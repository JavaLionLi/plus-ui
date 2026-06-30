import { DeleteOutlined, EditOutlined, EyeOutlined, RollbackOutlined } from '@ant-design/icons';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { message, Tag } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CategoryTreeVO } from '@/api/workflow/category/types';
import type { FlowInstanceQuery, FlowInstanceVO } from '@/api/workflow/instance/types';
import { categoryTree } from '@/api/workflow/category';
import { cancelProcessApply, deleteByInstanceIds, pageByCurrent } from '@/api/workflow/instance';
import workflowCommon from '@/api/workflow/workflowCommon';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RowActions from '@/components/common/RowActions';
import TreePanel from '@/components/common/TreePanel';
import { useDict } from '@/hooks/useDict';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';


function editableStatus(status?: string) {
  return status === 'draft' || status === 'cancel' || status === 'back';
}

function openBusinessForm(row: FlowInstanceVO, type: 'update' | 'view') {
  workflowCommon.routerJump({
    businessId: row.businessId,
    taskId: row.id,
    type,
    formCustom: row.formCustom || 'N',
    formPath: row.formPath || '/workflow/leaveEdit/index'
  });
}

export default function WorkflowMyDocumentPage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1240);
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('wf_business_status');
  const [categoryOptions, setCategoryOptions] = useState<CategoryTreeVO[]>([]);
  const [category, setCategory] = useState<string | number>();
  const businessStatusOptions = useMemo(() => dictOptions(dicts.wf_business_status), [dicts.wf_business_status]);
  const canRemove = hasPermi(userInfo, ['workflow:instance:remove']);
  const canCancel = hasPermi(userInfo, ['workflow:instance:cancel']);

  useEffect(() => {
    categoryTree().then(res => setCategoryOptions(res.data || []));
  }, []);

  const resetSearch = () => {
    setCategory(undefined);
    setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
  };

  const handleDelete = async (row: FlowInstanceVO) => {
    await deleteByInstanceIds(row.id);
    message.success('删除成功');
    actionRef.current?.reloadAndRest?.();
  };

  const handleCancelProcessApply = async (row: FlowInstanceVO) => {
    await cancelProcessApply({
      businessId: row.businessId,
      message: '申请人撤销流程！'
    });
    message.success('撤销成功');
    actionRef.current?.reload();
  };

  const columns: ProColumns<FlowInstanceVO>[] = [
    {
      title: '流程定义名称',
      dataIndex: 'flowName',
      search: false,
      width: 180,
      render: (_, row) => <EllipsisText value={row.flowName} maxWidth={160} />
    },
    {
      title: '流程定义编码',
      dataIndex: 'flowCode',
      width: 170,
      render: (_, row) => <EllipsisText value={row.flowCode} maxWidth={150} />
    },
    {
      title: '流程分类',
      dataIndex: 'categoryName',
      search: false,
      width: 150,
      render: (_, row) => <EllipsisText value={row.categoryName} maxWidth={130} />
    },
    {
      title: '版本号',
      dataIndex: 'version',
      search: false,
      width: 100,
      render: (_, row) => (row.version ? `v${row.version}.0` : '-')
    },
    {
      title: '状态',
      dataIndex: 'isSuspended',
      search: false,
      width: 100,
      render: (_, row) => (row.isSuspended ? <Tag color="red">挂起</Tag> : <Tag color="green">激活</Tag>)
    },
    {
      title: '流程状态',
      dataIndex: 'flowStatus',
      valueType: 'select',
      width: 120,
      fieldProps: { options: businessStatusOptions },
      render: (_, row) => <DictTag options={dicts.wf_business_status} value={row.flowStatus} />
    },
    { title: '启动时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            editableStatus(row.flowStatus) && {
              key: 'edit',
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => openBusinessForm(row, 'update')
            },
            canRemove &&
              editableStatus(row.flowStatus) && {
                key: 'delete',
                label: '删除',
                icon: <DeleteOutlined />,
                danger: true,
                confirm: '是否确认删除？',
                onClick: () => handleDelete(row)
              },
            { key: 'view', label: '查看', icon: <EyeOutlined />, onClick: () => openBusinessForm(row, 'view') },
            canCancel &&
              row.flowStatus === 'waiting' && {
                key: 'cancel',
                label: '撤销',
                icon: <RollbackOutlined />,
                confirm: '是否确认撤销当前单据？',
                onClick: () => handleCancelProcessApply(row)
              }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="我的单据">
      <div className="tree-table-page">
        <TreePanel<CategoryTreeVO>
          title="流程分类"
          placeholder="请输入流程分类名"
          data={categoryOptions}
          fieldNames={{ title: 'label', key: 'id', children: 'children' }}
          filterField="label"
          onNodeClick={node => {
            setCategory(node.id === '0' ? undefined : node.id);
            setTimeout(() => actionRef.current?.reloadAndRest?.(), 0);
          }}
        />
        <main className="table-panel">
          <ProTable<FlowInstanceVO, FlowInstanceQuery>
            actionRef={actionRef}
            rowKey="id"
            columns={columns}
            scroll={tableScroll}
            search={{ labelWidth: 120 }}
            form={{ onReset: resetSearch }}
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            request={async params => {
              const res = await pageByCurrent({ ...toPageQuery(params), category });
              return toTableData(res);
            }}
            toolbar={{ title: '我的单据' }}
          />
        </main>
      </div>
    </PageContainer>
  );
}
