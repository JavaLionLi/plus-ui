import {
  DeleteOutlined,
  PlusOutlined,
  RollbackOutlined,
  SearchOutlined,
  StopOutlined,
  SwapOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Form, Input, message, Modal, Select, Space, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import type { UserVO } from '@/api/system/user/types';
import type { FlowNextNodeVO, FlowTaskVO } from '@/api/workflow/task/types';
import {
  backProcess,
  completeTask,
  currentTaskAllUser,
  getBackTaskNode,
  getNextNodeList,
  getTask,
  taskOperation,
  terminationTask
} from '@/api/workflow/task';
import FileUpload from '@/components/common/FileUpload';
import UserSelect from '@/components/common/UserSelect';
import MessageType from '@/components/workflow/MessageType';
import { useLoading } from '@/hooks/useLoading';
import { confirmTitleSafe } from '@/utils/modal';

type UserSelectMode = 'copy' | 'assigneeMap' | 'transfer' | 'delegate' | 'addSignature';

type SignatureUser = {
  userId: string | number;
  nickName: string;
  nodeName?: string;
};

interface SubmitVerifyProps {
  open: boolean;
  taskId?: string | number;
  variables?: Record<string, unknown>;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

const emptyVariables: Record<string, unknown> = {};

function buttonVisible(task?: FlowTaskVO, code?: string) {
  return !!task?.buttonList?.find(item => item.code === code && item.show);
}

export default function SubmitVerify({ open, taskId, variables = emptyVariables, onOpenChange, onSubmitted }: SubmitVerifyProps) {
  const [approveForm] = Form.useForm<{
    message?: string;
    messageType?: string[];
    assigneeMap?: Record<string, string>;
    fileId?: string;
  }>();
  const [backForm] = Form.useForm<{ nodeCode?: string; message?: string; messageType?: string[]; fileId?: string }>();
  const { loading: approvalLoading, setLoading: setApprovalLoading, withLoading: withApprovalLoading } = useLoading();
  const [currentTask, setCurrentTask] = useState<FlowTaskVO>();
  const [nextNodes, setNextNodes] = useState<FlowNextNodeVO[]>([]);
  const [backOpen, { setTrue: openBackModal, setFalse: closeBackModal }] = useBoolean(false);
  const [backNodes, setBackNodes] = useState<FlowNextNodeVO[]>([]);
  const [copyUsers, setCopyUsers] = useState<UserVO[]>([]);
  const [userModalOpen, { setTrue: openUserModal, setFalse: closeUserModal, set: setUserModalOpen }] =
    useBoolean(false);
  const [userSelectMode, setUserSelectMode] = useState<UserSelectMode>('copy');
  const [selectNode, setSelectNode] = useState<FlowNextNodeVO>();
  const [assigneeNames, setAssigneeNames] = useState<Record<string, string>>({});
  const [signatureOpen, { setTrue: openSignatureModal, setFalse: closeSignatureModal }] = useBoolean(false);
  const [signatureUsers, setSignatureUsers] = useState<SignatureUser[]>([]);

  useEffect(() => {
    if (!open || !taskId) return;

    const loadTask = async () => {
      setApprovalLoading(true);
      approveForm.setFieldsValue({ message: '', messageType: ['1'], assigneeMap: {}, fileId: undefined });
      setCopyUsers([]);
      setAssigneeNames({});
      setCurrentTask(undefined);
      setNextNodes([]);
      try {
        const taskRes = await getTask(taskId);
        setCurrentTask(taskRes.data);
        setCopyUsers((taskRes.data.copyList || []).map(user => ({ userId: user.userId, nickName: user.nickName })));
        const nextRes = await getNextNodeList({ taskId, variables });
        setNextNodes(nextRes.data || []);
      } finally {
        setApprovalLoading(false);
      }
    };

    loadTask();
  }, [approveForm, open, taskId, variables]);

  const closeApprovalModal = () => {
    onOpenChange(false);
  };

  const finishWorkflowAction = () => {
    onOpenChange(false);
    onSubmitted();
  };

  const openUserSelect = (mode: UserSelectMode, node?: FlowNextNodeVO) => {
    if (mode === 'assigneeMap' && !node?.permissionFlag) {
      message.error('没有可选择的人员，请联系管理员！');
      return;
    }
    setUserSelectMode(mode);
    setSelectNode(node);
    openUserModal();
  };

  const submitUserSelect = async (users: UserVO[]) => {
    if (userSelectMode === 'copy') {
      setCopyUsers(users);
      closeUserModal();
      return;
    }

    if (userSelectMode === 'assigneeMap') {
      if (!selectNode?.nodeCode) return;
      const userIds = users
        .map(item => item.userId)
        .filter(Boolean)
        .join(',');
      const nickNames = users
        .map(item => item.nickName || item.userName)
        .filter(Boolean)
        .join(',');
      if (!userIds) {
        message.warning('请选择审批人');
        return;
      }
      approveForm.setFieldValue(['assigneeMap', selectNode.nodeCode], userIds);
      setAssigneeNames(prev => ({ ...prev, [selectNode.nodeCode]: nickNames }));
      closeUserModal();
      return;
    }

    if (!currentTask?.id) return;
    if (userSelectMode === 'transfer' || userSelectMode === 'delegate') {
      const user = users[0];
      if (!user?.userId) {
        message.warning('请选择用户');
        return;
      }
      if (!(await confirmTitleSafe('是否确认提交？'))) return;
      const values = approveForm.getFieldsValue();
      await taskOperation(
        {
          taskId: currentTask.id,
          userId: user.userId,
          message: values.message,
          messageType: values.messageType || ['1'],
          variables
        },
        userSelectMode === 'transfer' ? 'transferTask' : 'delegateTask'
      );
      message.success('操作成功');
      closeUserModal();
      finishWorkflowAction();
      return;
    }

    const userIds = users.map(item => item.userId).filter(Boolean) as Array<string | number>;
    if (!userIds.length) {
      message.warning('请选择用户');
      return;
    }
    if (!(await confirmTitleSafe('是否确认提交？'))) return;
    const values = approveForm.getFieldsValue();
    await taskOperation(
      {
        taskId: currentTask.id,
        userIds,
        message: values.message,
        messageType: values.messageType || ['1'],
        variables
      },
      'addSignature'
    );
    message.success('操作成功');
    closeUserModal();
    finishWorkflowAction();
  };

  const removeCopyUser = (userId?: string | number) => {
    setCopyUsers(prev => prev.filter(item => item.userId !== userId));
  };

  const completeApproval = async () => {
    if (!currentTask?.id) return;
    const values = await approveForm.validateFields();
    if (!(await confirmTitleSafe('是否确认提交？'))) return;
    await withApprovalLoading(async () => {
      await completeTask({
        taskId: currentTask.id,
        message: values.message,
        messageType: values.messageType || ['1'],
        fileId: values.fileId,
        variables,
        assigneeMap: values.assigneeMap || {},
        flowCopyList: copyUsers.map(item => ({ userId: item.userId, nickName: item.nickName || item.userName }))
      });
      message.success('操作成功');
      finishWorkflowAction();
    });
  };

  const openBack = async () => {
    if (!currentTask?.id) return;
    openBackModal();
    await withApprovalLoading(async () => {
      const res = await getBackTaskNode(currentTask.id, currentTask.nodeCode);
      setBackNodes(res.data || []);
      backForm.setFieldsValue({
        nodeCode: res.data?.[0]?.nodeCode,
        message: '',
        messageType: ['1'],
        fileId: undefined
      });
    });
  };

  const submitBack = async () => {
    if (!currentTask?.id) return;
    const values = await backForm.validateFields();
    if (!(await confirmTitleSafe('是否确认驳回？'))) return;
    await withApprovalLoading(async () => {
      await backProcess({
        ...values,
        taskId: currentTask.id,
        variables
      });
      message.success('操作成功');
      closeBackModal();
      finishWorkflowAction();
    });
  };

  const submitTermination = async () => {
    if (!currentTask?.id) return;
    const values = approveForm.getFieldsValue();
    if (!(await confirmTitleSafe('是否确认终止？'))) return;
    await withApprovalLoading(async () => {
      await terminationTask({ taskId: currentTask.id, comment: values.message });
      message.success('操作成功');
      finishWorkflowAction();
    });
  };

  const openReductionSignature = async () => {
    if (!currentTask?.id) return;
    await withApprovalLoading(async () => {
      const res = await currentTaskAllUser(currentTask.id);
      setSignatureUsers((res.data || []).map(item => ({ ...item, nodeName: currentTask.nodeName })));
      openSignatureModal();
    });
  };

  const deleteSignatureUser = async (row: SignatureUser) => {
    if (!currentTask?.id) return;
    const values = approveForm.getFieldsValue();
    if (!(await confirmTitleSafe('是否确认提交？'))) return;
    await taskOperation(
      {
        taskId: currentTask.id,
        userIds: [row.userId],
        message: values.message,
        messageType: values.messageType || ['1'],
        variables
      },
      'reductionSignature'
    );
    message.success('操作成功');
    closeSignatureModal();
    finishWorkflowAction();
  };

  return (
    <>
      <Modal
        title="审批"
        open={open}
        width={720}
        confirmLoading={approvalLoading}
        onOk={completeApproval}
        onCancel={closeApprovalModal}
        destroyOnHidden
        footer={(_, { OkBtn, CancelBtn }) => (
          <Space wrap>
            <OkBtn />
            {currentTask?.flowStatus === 'waiting' && buttonVisible(currentTask, 'trust') && (
              <Button icon={<UserSwitchOutlined />} onClick={() => openUserSelect('delegate')}>
                委托
              </Button>
            )}
            {currentTask?.flowStatus === 'waiting' && buttonVisible(currentTask, 'transfer') && (
              <Button icon={<SwapOutlined />} onClick={() => openUserSelect('transfer')}>
                转办
              </Button>
            )}
            {currentTask?.flowStatus === 'waiting' &&
              Number(currentTask.nodeRatio) > 0 &&
              buttonVisible(currentTask, 'addSign') && (
                <Button icon={<PlusOutlined />} onClick={() => openUserSelect('addSignature')}>
                  加签
                </Button>
              )}
            {currentTask?.flowStatus === 'waiting' &&
              Number(currentTask.nodeRatio) > 0 &&
              buttonVisible(currentTask, 'subSign') && (
                <Button danger icon={<DeleteOutlined />} onClick={openReductionSignature}>
                  减签
                </Button>
              )}
            {currentTask?.flowStatus === 'waiting' && buttonVisible(currentTask, 'back') && (
              <Button danger icon={<RollbackOutlined />} onClick={openBack}>
                退回
              </Button>
            )}
            {currentTask?.flowStatus === 'waiting' && buttonVisible(currentTask, 'termination') && (
              <Button danger icon={<StopOutlined />} onClick={submitTermination}>
                终止
              </Button>
            )}
            <CancelBtn />
          </Space>
        )}
      >
        <Form form={approveForm} layout="vertical" initialValues={{ messageType: ['1'], assigneeMap: {} }}>
          {buttonVisible(currentTask, 'copy') && (
            <Form.Item label="抄送">
              <Space wrap>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openUserSelect('copy')}>
                  选择
                </Button>
                {copyUsers.map(user => (
                  <Tag key={user.userId} closable onClose={() => removeCopyUser(user.userId)}>
                    {user.nickName || user.userName}
                  </Tag>
                ))}
              </Space>
            </Form.Item>
          )}
          {buttonVisible(currentTask, 'pop') && nextNodes.length > 0 && (
            <Form.Item label="下一步审批人">
              {nextNodes.map(node => (
                <Form.Item key={node.nodeCode} label={`【${node.nodeName}】`} required>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input readOnly placeholder="请选择审批人" value={assigneeNames[node.nodeCode]} />
                    <Button icon={<SearchOutlined />} onClick={() => openUserSelect('assigneeMap', node)}>
                      选择
                    </Button>
                  </Space.Compact>
                  <Form.Item
                    name={['assigneeMap', node.nodeCode]}
                    rules={[{ required: true, message: '请选择审批人' }]}
                    noStyle
                    hidden
                  >
                    <Input />
                  </Form.Item>
                </Form.Item>
              ))}
            </Form.Item>
          )}
          {buttonVisible(currentTask, 'file') && (
            <Form.Item name="fileId" label="附件">
              <FileUpload
                fileType={['png', 'jpg', 'jpeg', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'txt', 'pdf']}
                fileSize={20}
              />
            </Form.Item>
          )}
          {currentTask?.flowStatus === 'waiting' && <MessageType messageLabel="审批意见" />}
        </Form>
      </Modal>

      <Modal
        title="驳回"
        open={backOpen}
        confirmLoading={approvalLoading}
        onOk={submitBack}
        onCancel={closeBackModal}
        destroyOnHidden
      >
        <Form form={backForm} layout="vertical" initialValues={{ messageType: ['1'] }}>
          <Form.Item name="nodeCode" label="驳回节点" rules={[{ required: true, message: '请选择驳回节点' }]}>
            <Select options={backNodes.map(node => ({ label: node.nodeName, value: node.nodeCode }))} />
          </Form.Item>
          <Form.Item name="fileId" label="附件">
            <FileUpload
              fileType={['png', 'jpg', 'jpeg', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'txt', 'pdf']}
              fileSize={20}
            />
          </Form.Item>
          <MessageType messageLabel="审批意见" />
        </Form>
      </Modal>

      <UserSelect
        title={
          userSelectMode === 'copy'
            ? '选择抄送人'
            : userSelectMode === 'assigneeMap'
              ? '选择审批人'
              : userSelectMode === 'transfer'
                ? '选择转办人'
                : userSelectMode === 'delegate'
                  ? '选择委托人'
                  : '选择加签人'
        }
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        value={userSelectMode === 'copy' ? copyUsers : undefined}
        data={
          userSelectMode === 'assigneeMap' && selectNode?.nodeCode
            ? approveForm.getFieldValue(['assigneeMap', selectNode.nodeCode])
            : undefined
        }
        userIds={userSelectMode === 'assigneeMap' ? selectNode?.permissionFlag : undefined}
        multiple={userSelectMode !== 'transfer' && userSelectMode !== 'delegate'}
        onConfirm={submitUserSelect}
      />

      <Modal
        title="减签人员"
        open={signatureOpen}
        width={700}
        footer={null}
        onCancel={closeSignatureModal}
        destroyOnHidden
      >
        <Table<SignatureUser>
          rowKey="userId"
          dataSource={signatureUsers}
          pagination={false}
          columns={[
            { title: '任务名称', dataIndex: 'nodeName' },
            { title: '办理人', dataIndex: 'nickName' },
            {
              title: '操作',
              width: 120,
              render: (_, row) => (
                <Button danger size="small" icon={<DeleteOutlined />} onClick={() => deleteSignatureUser(row)}>
                  删除
                </Button>
              )
            }
          ]}
        />
      </Modal>
    </>
  );
}
