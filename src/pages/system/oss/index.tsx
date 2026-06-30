import {
  DeleteOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SettingOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useBoolean } from 'ahooks';
import { Button, Form, message, Modal, Popconfirm, Space, Switch } from 'antd';
import { useRef, useState } from 'react';
import type { OssQuery, OssVO } from '@/api/system/oss/types';
import { getConfigKey, updateConfigByKey } from '@/api/system/config';
import { delOss, downloadOss, listOss } from '@/api/system/oss';
import EllipsisText from '@/components/common/EllipsisText';
import FileUpload from '@/components/common/FileUpload';
import ImagePreview from '@/components/common/ImagePreview';
import ImageUpload from '@/components/common/ImageUpload';
import RowActions from '@/components/common/RowActions';
import { useDateRangeQuery } from '@/hooks/useDateRangeQuery';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { saveValidatedBlob } from '@/utils/download';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData, withTableSort } from '@/utils/ruoyi';

function isImage(fileSuffix?: string) {
  return ['.png', '.jpg', '.jpeg'].includes((fileSuffix || '').toLowerCase());
}

export default function SystemOssPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1300);
  const userInfo = useUserStore(state => state.userInfo);
  const [selectedRows, setSelectedRows] = useState<OssVO[]>([]);
  const [previewListResource, setPreviewListResource] = useState(true);
  const [uploadOpen, { setTrue: openUploadModal, setFalse: closeUploadModal }] = useBoolean(false);
  const [uploadTitle, setUploadTitle] = useState('上传文件');
  const [uploadType, setUploadType] = useState<'file' | 'image'>('file');
  const [uploadValue, setUploadValue] = useState('');
  const { applyDateRange: applyCreateTimeDateRange } = useDateRangeQuery();

  const canUpload = hasPermi(userInfo, ['system:oss:upload']);
  const canRemove = hasPermi(userInfo, ['system:oss:remove']);
  const canEdit = hasPermi(userInfo, ['system:oss:edit']);
  const canDownload = hasPermi(userInfo, ['system:oss:download']);
  const canConfig = hasPermi(userInfo, ['system:ossConfig:list']);
  const ids = selectedRows.map(item => item.ossId).filter(Boolean);

  const openUpload = (type: 'file' | 'image') => {
    setUploadTitle(type === 'image' ? '上传图片' : '上传文件');
    setUploadType(type);
    setUploadValue('');
    openUploadModal();
  };

  const submitUpload = () => {
    if (!uploadValue) {
      message.warning('请选择要上传的文件');
      return;
    }
    message.success('上传成功');
    closeUploadModal();
    actionRef.current?.reload();
  };

  const remove = async (row?: OssVO) => {
    await delOss(row?.ossId || ids);
    message.success('删除成功');
    setSelectedRows([]);
    actionRef.current?.reloadAndRest?.();
  };

  const downloadFile = async (row: OssVO) => {
    const blob = await downloadOss(row.ossId);
    await saveValidatedBlob(blob, row.originalName || row.fileName || `oss_${row.ossId}`);
  };

  const togglePreview = async (checked: boolean) => {
    await updateConfigByKey('sys.oss.previewListResource', checked);
    setPreviewListResource(checked);
    message.success(`${checked ? '启用' : '停用'}成功`);
  };

  const columns: ProColumns<OssVO>[] = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      width: 190,
      render: (_, row) => <EllipsisText value={row.fileName} maxWidth={170} />
    },
    {
      title: '原名',
      dataIndex: 'originalName',
      width: 190,
      render: (_, row) => <EllipsisText value={row.originalName} maxWidth={170} />
    },
    { title: '文件后缀', dataIndex: 'fileSuffix' },
    {
      title: '文件展示',
      dataIndex: 'url',
      search: false,
      width: 220,
      render: (_, row) =>
        previewListResource && isImage(row.fileSuffix) ? (
          <ImagePreview width={100} height={100} src={row.url} />
        ) : (
          <EllipsisText value={row.url} maxWidth={200} />
        )
    },
    { title: '创建时间', dataIndex: 'createTimeRange', valueType: 'dateTimeRange', hideInTable: true },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170, sorter: true },
    { title: '上传人', dataIndex: 'createByName', search: false },
    { title: '服务商', dataIndex: 'service', sorter: true },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            canDownload && {
              key: 'download',
              label: '下载',
              icon: <DownloadOutlined />,
              onClick: () => downloadFile(row)
            },
            canRemove && {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: `是否确认删除OSS对象存储编号为"${row.ossId}"的数据项？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="文件管理">
      <ProTable<OssVO, OssQuery & { createTimeRange?: [string, string] }>
        actionRef={actionRef}
        rowKey="ossId"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        rowSelection={{ selectedRowKeys: ids, onChange: (_, rows) => setSelectedRows(rows) }}
        request={async (params, sort) => {
          const { createTimeRange, ...tableParams } = params;
          const query = applyCreateTimeDateRange(
            withTableSort(toPageQuery(tableParams), sort, { orderByColumn: 'createTime', isAsc: 'ascending' }),
            createTimeRange
          );
          const preview = await getConfigKey('sys.oss.previewListResource');
          setPreviewListResource(preview.data === undefined ? true : preview.data === 'true');
          const res = await listOss(query);
          return toTableData(res);
        }}
        toolbar={{ title: '文件列表' }}
        toolBarRender={() => [
          canUpload && (
            <Button key="upload-file" type="primary" icon={<UploadOutlined />} onClick={() => openUpload('file')}>
              上传文件
            </Button>
          ),
          canUpload && (
            <Button key="upload-image" type="primary" icon={<UploadOutlined />} onClick={() => openUpload('image')}>
              上传图片
            </Button>
          ),
          canRemove && (
            <Popconfirm
              key="delete"
              title={`是否确认删除OSS对象存储编号为"${ids}"的数据项？`}
              onConfirm={() => remove()}
            >
              <Button danger disabled={!ids.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ),
          canEdit && (
            <Space key="preview">
              {previewListResource ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              <Switch
                checked={previewListResource}
                checkedChildren="预览"
                unCheckedChildren="禁用"
                onChange={togglePreview}
              />
            </Space>
          ),
          canConfig && (
            <Button key="config" icon={<SettingOutlined />} onClick={() => history.push('/system/oss-config/index')}>
              配置管理
            </Button>
          )
        ]}
      />

      <Modal
        title={uploadTitle}
        open={uploadOpen}
        width={520}
        onOk={submitUpload}
        onCancel={closeUploadModal}
        destroyOnHidden
      >
        <Form layout="vertical">
          <Form.Item label="文件" required>
            {uploadType === 'image' ? (
              <ImageUpload value={uploadValue} onChange={setUploadValue} limit={1} />
            ) : (
              <FileUpload value={uploadValue} onChange={setUploadValue} limit={1} />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
