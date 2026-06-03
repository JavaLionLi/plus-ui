import { DeleteOutlined, PlusOutlined, StopOutlined, SwapOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Descriptions, message, Modal, Space, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';
import type { UserVO } from '@/api/system/user/types';
import type { FlowTaskVO } from '@/api/workflow/task/types';
import { currentTaskAllUser, getTask, taskOperation, terminationTask } from '@/api/workflow/task';
import UserSelect from '@/components/common/UserSelect';
import { useLoading } from '@/hooks/useLoading';
import { confirmTitleSafe } from '@/utils/modal';

type UserSelectMode = 'transfer' | 'addSignature';

type SignatureUser = {
  userId: string | number;
  nickName: string;
  nodeName?: string;
};

interface ProcessMeddleProps {
  open: boolean;
  taskId?: string | number;
  width?: string | number;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ProcessMeddle({ open, taskId, width = 760, onOpenChange, onSuccess }: ProcessMeddleProps) {
  const { loading, withLoading } = useLoading();
  const [currentTask, setCurrentTask] = useState<FlowTaskVO>();
  const [userModalOpen, { setTrue: openUserModal, setFalse: closeUserModal }] = useBoolean(false);
  const [userSelectMode, setUserSelectMode] = useState<UserSelectMode>('transfer');
  const [signatureOpen, { setTrue: openSignatureModal, setFalse: closeSignatureModal }] = useBoolean(false);
  const [signatureUsers, setSignatureUsers] = useState<SignatureUser[]>([]);

  useEffect(() => {
    if (!open || !taskId) {
      return;
    }

    const loadTask = () =>
      withLoading(async () => {
        setCurrentTask(undefined);
        const res = await getTask(taskId);
        setCurrentTask(res.data);
      });

    loadTask();
  }, [open, taskId, withLoading]);

  const closeWithSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const openTransferSelect = () => {
    setUserSelectMode('transfer');
    openUserModal();
  };

  const openAddSignatureSelect = () => {
    setUserSelectMode('addSignature');
    openUserModal();
  };

  const submitUserSelect = async (users: UserVO[]) => {
    if (!currentTask?.id) return;

    if (userSelectMode === 'transfer') {
      const user = users[0];
      if (!user?.userId) {
        message.warning('请选择用户');
        return;
      }
      if (!(await confirmTitleSafe('是否确认提交？'))) return;
      await taskOperation(
        { taskId: currentTask.id, userId: user.userId, message: '', messageType: ['1'] },
        'transferTask'
      );
      message.success('操作成功');
      closeUserModal();
      closeWithSuccess();
      return;
    }

    const userIds = users.map(item => item.userId).filter(Boolean) as Array<string | number>;
    if (!userIds.length) {
      message.warning('请选择用户');
      return;
    }
    if (!(await confirmTitleSafe('是否确认提交？'))) return;
    await taskOperation({ taskId: currentTask.id, userIds, message: '', messageType: ['1'] }, 'addSignature');
    message.success('操作成功');
    closeUserModal();
    closeWithSuccess();
  };

  const openReductionSignature = async () => {
    if (!currentTask?.id) return;
    await withLoading(async () => {
      const res = await currentTaskAllUser(currentTask.id);
      setSignatureUsers((res.data || []).map(item => ({ ...item, nodeName: currentTask.nodeName })));
      openSignatureModal();
    });
  };

  const deleteSignatureUser = async (row: SignatureUser) => {
    if (!currentTask?.id) return;
    if (!(await confirmTitleSafe('是否确认提交？'))) return;
    await taskOperation(
      { taskId: currentTask.id, userIds: [row.userId], message: '', messageType: ['1'] },
      'reductionSignature'
    );
    message.success('操作成功');
    closeSignatureModal();
    closeWithSuccess();
  };

  const submitTermination = async () => {
    if (!currentTask?.id) return;
    if (!(await confirmTitleSafe('是否确认终止？'))) return;
    await terminationTask({ taskId: currentTask.id, comment: '' });
    message.success('操作成功');
    closeWithSuccess();
  };

  return (
    <>
      <Modal
        title="流程干预"
        open={open}
        width={width}
        onCancel={() => onOpenChange(false)}
        footer={
          <Space>
            {currentTask?.flowStatus === 'waiting' && (
              <Button
                type="primary"
                icon={<SwapOutlined />}
                loading={loading}
                disabled={!currentTask}
                onClick={openTransferSelect}
              >
                转办
              </Button>
            )}
            {currentTask?.flowStatus === 'waiting' && Number(currentTask.nodeRatio) > 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={loading}
                disabled={!currentTask}
                onClick={openAddSignatureSelect}
              >
                加签
              </Button>
            )}
            {currentTask?.flowStatus === 'waiting' && Number(currentTask.nodeRatio) > 0 && (
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                loading={loading}
                disabled={!currentTask}
                onClick={openReductionSignature}
              >
                减签
              </Button>
            )}
            {currentTask?.flowStatus === 'waiting' && (
              <Button
                danger
                icon={<StopOutlined />}
                loading={loading}
                disabled={!currentTask}
                onClick={submitTermination}
              >
                终止
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)}>关闭</Button>
          </Space>
        }
        destroyOnHidden
      >
        <Spin spinning={loading}>
          <Descriptions
            bordered
            column={2}
            size="small"
            title={currentTask ? `${currentTask.flowName || '-'}(${currentTask.flowCode || '-'})` : undefined}
            items={[
              { key: 'nodeName', label: '任务名称', children: currentTask?.nodeName || '-' },
              { key: 'nodeCode', label: '节点编码', children: currentTask?.nodeCode || '-' },
              {
                key: 'createTime',
                label: '开始时间',
                children: currentTask?.createTime ? String(currentTask.createTime) : '-'
              },
              { key: 'instanceId', label: '流程实例ID', children: currentTask?.instanceId || '-' },
              { key: 'version', label: '版本号', children: currentTask?.version ? `${currentTask.version}.0` : '-' },
              { key: 'businessId', label: '业务ID', children: currentTask?.businessId || '-' }
            ]}
          />
        </Spin>
      </Modal>

      <UserSelect
        title={userSelectMode === 'transfer' ? '选择转办人' : '选择加签人'}
        open={userModalOpen}
        onOpenChange={open => (open ? openUserModal() : closeUserModal())}
        multiple={userSelectMode !== 'transfer'}
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
