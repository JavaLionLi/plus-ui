import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns
} from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { useBoolean } from 'ahooks';
import { Button, Descriptions, Form, message, Modal, Popconfirm } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NoticeForm, NoticeQuery, NoticeVO } from '@/api/system/notice/types';
import { addNotice, delNotice, getNotice, listNotice, updateNotice } from '@/api/system/notice';
import DictTag from '@/components/common/DictTag';
import EllipsisText from '@/components/common/EllipsisText';
import RichTextEditor from '@/components/common/RichTextEditor';
import RowActions from '@/components/common/RowActions';
import { useDict } from '@/hooks/useDict';
import { useTableSelection } from '@/hooks/useTableSelection';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useUserStore } from '@/stores/userStore';
import { resolveOssContent } from '@/utils/ossContent';
import { dictOptions } from '@/utils/dict';
import { hasPermi } from '@/utils/permission';
import { toPageQuery, toTableData } from '@/utils/ruoyi';
import { sanitizeHtml } from '@/utils/sanitize';

const defaultNoticeForm: NoticeForm = { status: '0' };
const emptyNoticeContent = '<p>暂无公告内容</p>';


function SafeHtmlContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = html;
    }
  }, [html]);

  return <div ref={ref} className="notice-detail-content" />;
}

export default function SystemNoticePage() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { tableScroll } = useTableScroll(1120);
  const [form] = Form.useForm<NoticeForm>();
  const location = useLocation();
  const userInfo = useUserStore(state => state.userInfo);
  const dicts = useDict('sys_notice_type', 'sys_notice_status');
  const { ids, selectedOne, handleSelectionChange, clearSelection } = useTableSelection<NoticeVO>(row => row.noticeId);
  const [modalOpen, { setTrue: openModal, setFalse: closeModal }] = useBoolean(false);
  const [modalTitle, setModalTitle] = useState('');
  const [detailOpen, { setTrue: openDetailModal, setFalse: closeDetailModal }] = useBoolean(false);
  const [detail, setDetail] = useState<NoticeVO>();

  const canAdd = hasPermi(userInfo, ['system:notice:add']);
  const canEdit = hasPermi(userInfo, ['system:notice:edit']);
  const canRemove = hasPermi(userInfo, ['system:notice:remove']);
  const noticeTypeOptions = useMemo(() => dictOptions(dicts.sys_notice_type), [dicts.sys_notice_type]);
  const noticeStatusOptions = useMemo(() => dictOptions(dicts.sys_notice_status), [dicts.sys_notice_status]);

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue(defaultNoticeForm);
    setModalTitle('添加公告');
    openModal();
  };

  const openEdit = async (row?: NoticeVO) => {
    const target = row || selectedOne;
    if (!target?.noticeId) return;
    const res = await getNotice(target.noticeId);
    form.resetFields();
    form.setFieldsValue(res.data);
    setModalTitle('修改公告');
    openModal();
  };

  const openDetail = useCallback(
    async (row: NoticeVO | string | number) => {
      const noticeId = typeof row === 'object' ? row.noticeId : row;
      const res = await getNotice(noticeId);
      const noticeContent = await resolveOssContent(res.data.noticeContent);
      setDetail({ ...res.data, noticeContent });
      openDetailModal();
    },
    [openDetailModal]
  );

  const closeDetail = () => {
    closeDetailModal();
    setDetail(undefined);
    const params = new URLSearchParams(location.search);
    if (!params.has('noticeId')) {
      return;
    }
    params.delete('noticeId');
    const search = params.toString();
    history.replace(`${location.pathname}${search ? `?${search}` : ''}`);
  };

  const submitForm = async (values: NoticeForm) => {
    values.noticeId ? await updateNotice(values) : await addNotice(values);
    message.success('操作成功');
    form.resetFields();
    actionRef.current?.reload();
    return true;
  };

  const remove = async (row?: NoticeVO) => {
    await delNotice(row?.noticeId || ids);
    message.success('删除成功');
    clearSelection();
    actionRef.current?.reloadAndRest?.();
  };

  useEffect(() => {
    const noticeId = new URLSearchParams(location.search).get('noticeId');
    if (noticeId) {
      openDetail(noticeId);
    }
  }, [location.search, openDetail]);

  const safeNoticeContent = useMemo(
    () => sanitizeHtml(detail?.noticeContent || emptyNoticeContent),
    [detail?.noticeContent]
  );

  const columns: ProColumns<NoticeVO>[] = [
    {
      title: '公告标题',
      dataIndex: 'noticeTitle',
      width: 220,
      render: (_, row) => <EllipsisText value={row.noticeTitle} maxWidth={200} />
    },
    { title: '操作人员', dataIndex: 'createByName', width: 130 },
    {
      title: '公告类型',
      dataIndex: 'noticeType',
      valueType: 'select',
      width: 120,
      fieldProps: { options: noticeTypeOptions },
      render: (_, row) => <DictTag options={dicts.sys_notice_type} value={row.noticeType} />
    },
    {
      title: '状态',
      dataIndex: 'status',
      search: false,
      width: 100,
      render: (_, row) => <DictTag options={dicts.sys_notice_status} value={row.status} />
    },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime', search: false, width: 170 },
    {
      title: '操作',
      valueType: 'option',
      width: 130,
      fixed: 'right',
      render: (_, row) => (
        <RowActions
          actions={[
            { key: 'detail', label: '详情', icon: <EyeOutlined />, onClick: () => openDetail(row) },
            canEdit && { key: 'edit', label: '修改', icon: <EditOutlined />, onClick: () => openEdit(row) },
            canRemove && {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              danger: true,
              confirm: `是否确认删除公告编号为"${row.noticeId}"的数据项？`,
              onClick: () => remove(row)
            }
          ]}
        />
      )
    }
  ];

  return (
    <PageContainer title="公告管理">
      <ProTable<NoticeVO, NoticeQuery>
        actionRef={actionRef}
        rowKey="noticeId"
        columns={columns}
        scroll={tableScroll}
        search={{ labelWidth: 90 }}
        rowSelection={{ selectedRowKeys: ids, onChange: handleSelectionChange }}
        request={async params => {
          const res = await listNotice(toPageQuery(params));
          return toTableData(res);
        }}
        toolbar={{ title: '公告列表' }}
        toolBarRender={() => [
          canAdd && (
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              新增
            </Button>
          ),
          canEdit && (
            <Button key="edit" disabled={!selectedOne} icon={<EditOutlined />} onClick={() => openEdit()}>
              修改
            </Button>
          ),
          canRemove && (
            <Popconfirm key="delete" title={`是否确认删除公告编号为"${ids}"的数据项？`} onConfirm={() => remove()}>
              <Button danger disabled={!ids.length} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )
        ]}
      />

      <ModalForm<NoticeForm>
        title={modalTitle}
        open={modalOpen}
        width={780}
        form={form}
        layout="vertical"
        initialValues={defaultNoticeForm}
        modalProps={{ destroyOnHidden: true, onCancel: closeModal }}
        onOpenChange={open => !open && closeModal()}
        onFinish={submitForm}
      >
        <ProFormText name="noticeId" hidden />
        <div className="form-grid">
          <ProFormText name="noticeTitle" label="公告标题" rules={[{ required: true, message: '公告标题不能为空' }]} />
          <ProFormSelect
            name="noticeType"
            label="公告类型"
            rules={[{ required: true, message: '公告类型不能为空' }]}
            options={noticeTypeOptions}
            placeholder="请选择"
          />
        </div>
        <ProFormRadio.Group name="status" label="状态" options={noticeStatusOptions} />
        <Form.Item name="noticeContent" label="内容">
          <RichTextEditor minHeight={192} />
        </Form.Item>
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
      </ModalForm>

      <Modal title="公告详情" open={detailOpen} width={820} footer={null} onCancel={closeDetail}>
        <div className="notice-detail">
          <h2>{detail?.noticeTitle || '-'}</h2>
          <Descriptions
            column={2}
            size="small"
            items={[
              {
                key: 'noticeType',
                label: '类型',
                children: <DictTag options={dicts.sys_notice_type} value={detail?.noticeType} />
              },
              {
                key: 'status',
                label: '状态',
                children: <DictTag options={dicts.sys_notice_status} value={detail?.status} />
              },
              { key: 'createByName', label: '创建者', children: detail?.createByName || '-' },
              { key: 'createTime', label: '创建时间', children: detail?.createTime || '-' }
            ]}
          />
          <SafeHtmlContent html={safeNoticeContent} />
        </div>
      </Modal>
    </PageContainer>
  );
}
