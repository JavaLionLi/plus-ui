import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { message, Modal, Tag } from 'antd';
import { useRef, useState } from 'react';
import type { UserQuery, UserVO } from '@/api/system/user/types';
import { authUserSelectAll, unallocatedUserList } from '@/api/system/role';
import { toPageQuery, toTableData } from '@/utils/ruoyi';

interface SelectUserModalProps {
  open: boolean;
  roleId: string | number;
  onCancel: () => void;
  onSuccess: () => void;
}

const columns: ProColumns<UserVO>[] = [
  { title: '用户名称', dataIndex: 'userName' },
  { title: '用户昵称', dataIndex: 'nickName', search: false },
  { title: '邮箱', dataIndex: 'email', search: false },
  { title: '手机号码', dataIndex: 'phoneNumber' },
  {
    title: '状态',
    dataIndex: 'status',
    search: false,
    width: 100,
    render: (_, row) => <Tag color={row.status === '0' ? 'green' : 'red'}>{row.status === '0' ? '正常' : '停用'}</Tag>
  },
  { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 }
];

export default function SelectUserModal({ open, roleId, onCancel, onSuccess }: SelectUserModalProps) {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<UserVO[]>([]);
  const selectedIds = selectedRows.map(item => item.userId).filter(Boolean) as Array<string | number>;

  const closeModal = () => {
    setSelectedRows([]);
    onCancel();
  };

  const submit = async () => {
    if (!selectedIds.length) {
      message.warning('请选择要分配的用户');
      return;
    }
    await authUserSelectAll({ roleId, userIds: selectedIds.join(',') });
    message.success('分配成功');
    setSelectedRows([]);
    onSuccess();
    actionRef.current?.reloadAndRest?.();
  };

  return (
    <Modal title="选择用户" open={open} width={900} onOk={submit} onCancel={closeModal} destroyOnHidden>
      <ProTable<UserVO, UserQuery>
        actionRef={actionRef}
        rowKey="userId"
        columns={columns}
        scroll={{ x: 1010 }}
        options={false}
        search={{ labelWidth: 90 }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={{
          selectedRowKeys: open ? selectedIds : [],
          onChange: (_, rows) => setSelectedRows(rows)
        }}
        request={async params => {
          const res = await unallocatedUserList({
            ...toPageQuery(params),
            roleId
          });
          return toTableData(res);
        }}
        toolBarRender={false}
      />
    </Modal>
  );
}
