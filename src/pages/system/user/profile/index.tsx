import { DeleteOutlined, RotateLeftOutlined, RotateRightOutlined, UploadOutlined } from '@ant-design/icons';
import { PageContainer, ProDescriptions, ProTable, type ProColumns } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Slider,
  Space,
  Tabs,
  Upload,
  type UploadProps
} from 'antd';
import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import CropperModule, { type Area, type CropperProps, type Point } from 'react-easy-crop';
import type { OnlineVO } from '@/api/monitor/online/types';
import type { SocialAuthVO } from '@/api/system/social/types';
import type { UserInfoVO, UserProfileForm } from '@/api/system/user/types';
import { delOnline, getOnline } from '@/api/monitor/online';
import { uploadOss } from '@/api/system/oss';
import { authRouterUrl, authUnlock, getAuthList } from '@/api/system/social/auth';
import { getUserProfile, updateUserProfile, updateUserPwd } from '@/api/system/user';
import giteeIcon from '@/assets/icons/svg/gitee.svg';
import githubIcon from '@/assets/icons/svg/github.svg';
import maxkeyIcon from '@/assets/icons/svg/maxkey.svg';
import topiamIcon from '@/assets/icons/svg/topiam.svg';
import wechatIcon from '@/assets/icons/svg/wechat.svg';
import defaultAvatar from '@/assets/images/profile.jpg';
import DictTag from '@/components/common/DictTag';
import { useDict } from '@/hooks/useDict';
import { useLoading } from '@/hooks/useLoading';
import { usePermissionStore } from '@/stores/permissionStore';
import { dictOptions } from '@/utils/dict';
import { getUploadErrorMessage, validateUploadFile } from '@/utils/upload';

// react-easy-crop 6.2.x 的 CommonJS 类型声明遗漏了默认导出，运行时仍为默认组件。
type CropperComponentProps = Partial<CropperProps> & Pick<CropperProps, 'crop' | 'onCropChange'>;
const Cropper = CropperModule as unknown as ComponentType<CropperComponentProps>;

const socialProviders = [
  { source: 'wechat', label: '微信', icon: wechatIcon },
  { source: 'maxkey', label: 'MaxKey', icon: maxkeyIcon },
  { source: 'topiam', label: 'TopIam', icon: topiamIcon },
  { source: 'gitee', label: 'Gitee', icon: giteeIcon },
  { source: 'github', label: 'GitHub', icon: githubIcon }
];
const avatarFileTypes = ['png', 'jpg', 'jpeg'];
const avatarOutputSize = 200;
const initialAvatarCrop: Point = { x: 0, y: 0 };

function socialProvider(source?: string) {
  return socialProviders.find(item => item.source === source);
}

function socialLabel(source?: string) {
  return socialProvider(source)?.label || source || '-';
}

function socialIcon(source?: string) {
  const provider = socialProvider(source);
  if (!provider) return null;
  return <img className="social-provider-icon" src={provider.icon} alt="" />;
}

function socialProviderNode(source?: string) {
  return (
    <span className="social-provider-name">
      {socialIcon(source)}
      <span>{socialLabel(source)}</span>
    </span>
  );
}

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
}

async function getCroppedAvatarBlob(imageSrc: string, crop: Area, rotation: number) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.naturalWidth, image.naturalHeight, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) return null;

  croppedCanvas.width = avatarOutputSize;
  croppedCanvas.height = avatarOutputSize;
  croppedCtx.drawImage(canvas, crop.x, crop.y, crop.width, crop.height, 0, 0, avatarOutputSize, avatarOutputSize);

  return new Promise<Blob | null>(resolve => croppedCanvas.toBlob(resolve, 'image/png'));
}

function avatarUploadFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '') || 'avatar';
}

function normalizeOnlineDevices(payload: OnlineVO[] | { rows?: OnlineVO[] } | undefined) {
  if (Array.isArray(payload)) return payload;
  return payload?.rows || [];
}

export default function Profile() {
  const [userForm] = Form.useForm<UserProfileForm>();
  const [pwdForm] = Form.useForm<{ oldPassword: string; newPassword: string; confirmPassword: string }>();
  const reloadMenus = usePermissionStore(state => state.reloadMenus);
  const dicts = useDict('sys_user_gender', 'sys_device_type');
  const [profile, setProfile] = useState<UserInfoVO>();
  const [devices, setDevices] = useState<OnlineVO[]>([]);
  const [auths, setAuths] = useState<SocialAuthVO[]>([]);
  const { loading, withLoading } = useLoading();
  const { loading: avatarUploading, withLoading: withAvatarUploading } = useLoading();
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [avatarCropUrl, setAvatarCropUrl] = useState('');
  const [avatarFileName, setAvatarFileName] = useState('avatar.png');
  const [avatarCrop, setAvatarCrop] = useState<Point>(initialAvatarCrop);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarRotation, setAvatarRotation] = useState(0);
  const [avatarCroppedAreaPixels, setAvatarCroppedAreaPixels] = useState<Area>();
  const user = profile?.user || {};
  const genderOptions = useMemo(() => dictOptions(dicts.sys_user_gender), [dicts.sys_user_gender]);

  const onAvatarCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setAvatarCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const loadProfile = useCallback(async () => {
    await withLoading(async () => {
      const [profileRes, authRes, onlineRes] = await Promise.all([getUserProfile(), getAuthList(), getOnline()]);
      setProfile(profileRes.data);
      setAuths(authRes.data || []);
      setDevices(normalizeOnlineDevices(onlineRes.data));
      userForm.setFieldsValue(profileRes.data.user || {});
    });
  }, [userForm, withLoading]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const submitUserInfo = async () => {
    const values = await userForm.validateFields();
    const profileForm: UserProfileForm = {
      nickName: values.nickName,
      phoneNumber: values.phoneNumber,
      email: values.email,
      gender: values.gender
    };
    await updateUserProfile(profileForm);
    message.success('修改成功');
    await reloadMenus();
    await loadProfile();
  };

  const submitPwd = async () => {
    const values = await pwdForm.validateFields();
    await updateUserPwd(values.oldPassword, values.newPassword);
    message.success('修改成功');
    pwdForm.resetFields();
  };

  const uploadProps: UploadProps = {
    showUploadList: false,
    accept: avatarFileTypes.map(item => `.${item}`).join(','),
    beforeUpload: file => {
      if (
        !validateUploadFile(file, { fileTypes: avatarFileTypes, maxSizeMB: 5, fileKind: '头像图片', matchMime: true })
      ) {
        return Upload.LIST_IGNORE;
      }
      if (avatarCropUrl) {
        window.URL.revokeObjectURL(avatarCropUrl);
      }
      setAvatarFileName(file.name || 'avatar.png');
      setAvatarCrop(initialAvatarCrop);
      setAvatarZoom(1);
      setAvatarRotation(0);
      setAvatarCroppedAreaPixels(undefined);
      setAvatarCropUrl(window.URL.createObjectURL(file));
      setAvatarCropOpen(true);
      return Upload.LIST_IGNORE;
    }
  };

  const closeAvatarCrop = () => {
    if (avatarCropUrl) {
      window.URL.revokeObjectURL(avatarCropUrl);
    }
    setAvatarCropOpen(false);
    setAvatarCropUrl('');
    setAvatarCrop(initialAvatarCrop);
    setAvatarZoom(1);
    setAvatarRotation(0);
    setAvatarCroppedAreaPixels(undefined);
  };

  const submitAvatarCrop = async () => {
    if (!avatarCropUrl || !avatarCroppedAreaPixels) {
      message.warning('请先选择头像图片');
      return;
    }
    const blob = await getCroppedAvatarBlob(avatarCropUrl, avatarCroppedAreaPixels, avatarRotation);
    if (!blob) {
      message.error('头像裁剪失败');
      return;
    }
    const formData = new FormData();
    formData.append('file', blob, `${avatarUploadFileName(avatarFileName)}.png`);
    await withAvatarUploading(async () => {
      try {
        const res = await uploadOss(formData);
        if (!res.data.ossId) {
          throw new Error('头像上传失败');
        }
        await updateUserProfile({ avatar: res.data.ossId });
        message.success('修改成功');
        closeAvatarCrop();
        await reloadMenus();
        await loadProfile();
      } catch (error) {
        message.error(getUploadErrorMessage(error, '头像上传失败'));
      }
    });
  };

  const deleteDevice = async (row: OnlineVO) => {
    await delOnline(row.tokenId);
    message.success('删除成功');
    const res = await getOnline();
    setDevices(normalizeOnlineDevices(res.data));
  };

  const unlockAuth = async (row: SocialAuthVO) => {
    await authUnlock(row.id);
    message.success('解绑成功');
    const res = await getAuthList();
    setAuths(res.data || []);
  };

  const bindAuth = async (source: string) => {
    const res = await authRouterUrl(source);
    window.location.href = res.data;
  };

  const deviceColumns: ProColumns<OnlineVO>[] = [
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      width: 120,
      render: (_, row) => <DictTag options={dicts.sys_device_type} value={row.deviceType} />
    },
    { title: '主机', dataIndex: 'ipaddr', ellipsis: true },
    { title: '登录地点', dataIndex: 'loginLocation', ellipsis: true },
    { title: '操作系统', dataIndex: 'os', ellipsis: true },
    { title: '浏览器', dataIndex: 'browser', ellipsis: true },
    { title: '登录时间', dataIndex: 'loginTime', valueType: 'dateTime', width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, row) => (
        <Popconfirm title="删除设备后，在该设备登录需要重新进行验证" onConfirm={() => deleteDevice(row)}>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  const authColumns: ProColumns<SocialAuthVO>[] = [
    { title: '绑定账号平台', dataIndex: 'source', width: 160, render: (_, row) => socialProviderNode(row.source) },
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 100,
      render: (_, row) => <Image width={44} height={44} src={row.avatar || defaultAvatar} />
    },
    { title: '系统账号', dataIndex: 'userName', ellipsis: true },
    { title: '绑定时间', dataIndex: 'createTime', valueType: 'dateTime', width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, row) => (
        <Popconfirm title={`您确定要解除"${socialLabel(row.source)}"的账号绑定吗？`} onConfirm={() => unlockAuth(row)}>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <PageContainer title="个人中心" loading={loading}>
      <Row gutter={16}>
        <Col xs={24} lg={7}>
          <Card title="个人信息">
            <Space orientation="vertical" size={18} style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Avatar size={112} src={user.avatarUrl || defaultAvatar} />
                <div style={{ marginTop: 12 }}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} loading={avatarUploading}>
                      上传头像
                    </Button>
                  </Upload>
                </div>
              </div>
              <ProDescriptions
                column={1}
                dataSource={{
                  ...user,
                  deptPost: user.deptName ? `${user.deptName} / ${profile?.postGroup || '-'}` : '-',
                  roleGroup: profile?.roleGroup || '-'
                }}
                columns={[
                  { title: '用户名称', dataIndex: 'userName' },
                  { title: '手机号码', dataIndex: 'phoneNumber' },
                  { title: '用户邮箱', dataIndex: 'email' },
                  { title: '所属部门', dataIndex: 'deptPost' },
                  { title: '所属角色', dataIndex: 'roleGroup' },
                  { title: '创建日期', dataIndex: 'createTime' }
                ]}
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={17}>
          <Card title="个人设置">
            <Tabs
              items={[
                {
                  key: 'userinfo',
                  label: '基本资料',
                  children: (
                    <Form form={userForm} layout="vertical" style={{ maxWidth: 560 }}>
                      <Form.Item
                        name="nickName"
                        label="用户昵称"
                        rules={[{ required: true, message: '用户昵称不能为空' }]}
                      >
                        <Input maxLength={30} />
                      </Form.Item>
                      <Form.Item
                        name="phoneNumber"
                        label="手机号码"
                        rules={[
                          { required: true, message: '手机号码不能为空' },
                          { pattern: /^1[3456789][0-9]\d{8}$/, message: '请输入正确的手机号码' }
                        ]}
                      >
                        <Input maxLength={11} />
                      </Form.Item>
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[{ required: true, type: 'email', message: '请输入正确的邮箱地址' }]}
                      >
                        <Input maxLength={50} />
                      </Form.Item>
                      <Form.Item name="gender" label="性别">
                        <Radio.Group options={genderOptions} />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" onClick={submitUserInfo}>
                          保存
                        </Button>
                      </Form.Item>
                    </Form>
                  )
                },
                {
                  key: 'resetPwd',
                  label: '修改密码',
                  children: (
                    <Form form={pwdForm} layout="vertical" style={{ maxWidth: 560 }}>
                      <Form.Item
                        name="oldPassword"
                        label="旧密码"
                        rules={[{ required: true, message: '旧密码不能为空' }]}
                      >
                        <Input.Password placeholder="请输入旧密码" />
                      </Form.Item>
                      <Form.Item
                        name="newPassword"
                        label="新密码"
                        rules={[
                          { required: true, message: '新密码不能为空' },
                          { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
                          { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\ |' }
                        ]}
                      >
                        <Input.Password placeholder="请输入新密码" />
                      </Form.Item>
                      <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        dependencies={['newPassword']}
                        rules={[
                          { required: true, message: '确认密码不能为空' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                              return Promise.reject(new Error('两次输入的密码不一致'));
                            }
                          })
                        ]}
                      >
                        <Input.Password placeholder="请确认新密码" />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" onClick={submitPwd}>
                          保存
                        </Button>
                      </Form.Item>
                    </Form>
                  )
                },
                {
                  key: 'thirdParty',
                  label: '第三方应用',
                  children: (
                    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                      <ProTable<SocialAuthVO>
                        rowKey="id"
                        columns={authColumns}
                        scroll={{ x: 900 }}
                        options={false}
                        dataSource={auths}
                        search={false}
                        pagination={false}
                      />
                      <Space wrap>
                        {socialProviders.map(item => (
                          <Button
                            key={item.source}
                            icon={<img className="social-provider-icon" src={item.icon} alt="" />}
                            onClick={() => bindAuth(item.source)}
                          >
                            {item.label}
                          </Button>
                        ))}
                      </Space>
                    </Space>
                  )
                },
                {
                  key: 'onlineDevice',
                  label: '在线设备',
                  children: (
                    <ProTable<OnlineVO>
                      rowKey="tokenId"
                      columns={deviceColumns}
                      scroll={{ x: 1000 }}
                      options={false}
                      dataSource={devices}
                      search={false}
                      pagination={false}
                    />
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        title="裁剪头像"
        open={avatarCropOpen}
        width={640}
        confirmLoading={avatarUploading}
        onOk={submitAvatarCrop}
        onCancel={closeAvatarCrop}
        destroyOnHidden
      >
        {avatarCropUrl && (
          <div className="avatar-cropper-react">
            <div style={{ position: 'relative', height: 360, width: '100%', background: '#111', borderRadius: 6 }}>
              <Cropper
                image={avatarCropUrl}
                crop={avatarCrop}
                zoom={avatarZoom}
                rotation={avatarRotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setAvatarCrop}
                onZoomChange={setAvatarZoom}
                onRotationChange={setAvatarRotation}
                onCropComplete={onAvatarCropComplete}
              />
            </div>
            <Space orientation="vertical" size={12} style={{ marginTop: 12, width: '100%' }}>
              <Space>
                <Button icon={<RotateLeftOutlined />} onClick={() => setAvatarRotation(value => value - 90)}>
                  左旋转
                </Button>
                <Button icon={<RotateRightOutlined />} onClick={() => setAvatarRotation(value => value + 90)}>
                  右旋转
                </Button>
              </Space>
              <Slider min={1} max={3} step={0.1} value={avatarZoom} onChange={setAvatarZoom} />
            </Space>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
