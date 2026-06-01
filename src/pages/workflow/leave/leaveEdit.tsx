import { PageContainer, ProCard } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { useBoolean } from 'ahooks';
import { DatePicker, Form, Input, InputNumber, message, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import type { LeaveForm } from '@/api/workflow/leave/types';
import type { StartProcessBo } from '@/api/workflow/workflowCommon/types';
import { addLeave, getLeave, updateLeave } from '@/api/workflow/leave';
import { startWorkFlow } from '@/api/workflow/task';
import ApprovalButton from '@/components/workflow/ApprovalButton';
import ApprovalRecord from '@/components/workflow/ApprovalRecord';
import SubmitVerify from '@/components/workflow/SubmitVerify';
const leaveTypeOptions = [
  { value: '1', label: '事假' },
  { value: '2', label: '调休' },
  { value: '3', label: '病假' },
  { value: '4', label: '婚假' }
];

const flowCodeOptions = [
  { value: 'leave1', label: '请假申请-普通' },
  { value: 'leave2', label: '请假申请-排他网关' },
  { value: 'leave3', label: '请假申请-并行网关' },
  { value: 'leave4', label: '请假申请-会签' },
  { value: 'leave5', label: '请假申请-并行会签网关' },
  { value: 'leave6', label: '请假申请-排他并行会签' }
];

const leaveTimeDefaultOpenValue = [dayjs().startOf('day'), dayjs().endOf('day')] as [dayjs.Dayjs, dayjs.Dayjs];

type PageType = 'add' | 'update' | 'view' | 'approval';

function calcLeaveDays(range?: [dayjs.Dayjs, dayjs.Dayjs]) {
  if (!range?.[0] || !range?.[1]) return undefined;
  return range[1].startOf('day').diff(range[0].startOf('day'), 'day') + 1;
}

function buildTaskVariables(data?: Partial<LeaveForm>) {
  return {
    leaveDays: data?.leaveDays,
    userList: ['1', '3', '4']
  };
}

export default function WorkflowLeaveEditPage() {
  const [form] = Form.useForm<LeaveForm & { leaveTime?: [dayjs.Dayjs, dayjs.Dayjs] }>();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const pageType = (query.get('type') || 'add') as PageType;
  const id = query.get('id');
  const taskId = query.get('taskId') || '';
  const readonly = pageType === 'view';
  const [flowCode, setFlowCode] = useState('leave1');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [approvalOpen, { setTrue: openApprovalModal, set: setApprovalOpen }] = useBoolean(false);
  const [approvalTaskId, setApprovalTaskId] = useState<string | number>();
  const [approvalVariables, setApprovalVariables] = useState<Record<string, unknown>>(buildTaskVariables());
  const [recordOpen, { setTrue: openRecordModal, set: setRecordOpen }] = useBoolean(false);

  useEffect(() => {
    const load = async () => {
      form.resetFields();
      if (!id || pageType === 'add') {
        form.setFieldsValue({});
        return;
      }
      setLoading(true);
      try {
        const res = await getLeave(id);
        form.setFieldsValue({
          ...res.data,
          leaveTime:
            res.data.startDate && res.data.endDate ? [dayjs(res.data.startDate), dayjs(res.data.endDate)] : undefined
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [form, id, pageType]);

  const leaveTime = Form.useWatch('leaveTime', form);
  const formId = Form.useWatch('id', form);
  const formStatus = Form.useWatch('status', form);

  useEffect(() => {
    form.setFieldValue('leaveDays', calcLeaveDays(leaveTime));
  }, [form, leaveTime]);

  const goBack = () => {
    window.history.back();
  };

  const finishWorkflowAction = () => {
    window.history.back();
  };

  const openApprovalVerify = (targetTaskId?: string | number, variables?: Record<string, unknown>) => {
    if (!targetTaskId) {
      message.warning('缺少任务ID');
      return;
    }
    setApprovalTaskId(targetTaskId);
    setApprovalVariables(variables || buildTaskVariables(form.getFieldsValue()));
    openApprovalModal();
  };

  const openApprovalRecord = () => {
    if (!formId) return;
    openRecordModal();
  };

  const saveLeave = async (redirect = true, showSuccessMessage = true) => {
    const values = await form.validateFields();
    const payload: LeaveForm = {
      ...values,
      startDate: values.leaveTime?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
      endDate: values.leaveTime?.[1]?.format('YYYY-MM-DD HH:mm:ss')
    };
    delete (payload as LeaveForm & { leaveTime?: unknown }).leaveTime;
    setSubmitLoading(true);
    try {
      const res = payload.id ? await updateLeave(payload) : await addLeave(payload);
      form.setFieldsValue(res.data);
      if (showSuccessMessage) {
        message.success('暂存成功');
      }
      if (redirect) {
        history.push('/workflow/leave/index');
      }
      return res.data;
    } finally {
      setSubmitLoading(false);
    }
  };

  const submitFlow = async () => {
    const data = await saveLeave(false, false);
    if (!data?.id) return;
    const payload: StartProcessBo = {
      flowCode,
      businessId: data.id,
      variables: buildTaskVariables(data),
      bizExt: {
        businessTitle: '请假申请',
        businessCode: data.applyCode
      }
    };
    setSubmitLoading(true);
    try {
      const res = await startWorkFlow(payload);
      message.success('流程已启动');
      if (res.data.taskId) {
        openApprovalVerify(res.data.taskId, payload.variables);
      } else {
        history.push('/workflow/leave/index');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <PageContainer title={pageType === 'add' ? '新增请假' : pageType === 'view' ? '查看请假' : '修改请假'}>
      <ProCard loading={loading}>
        <ApprovalButton
          status={formStatus}
          pageType={pageType}
          id={formId}
          buttonLoading={submitLoading}
          onSubmitDraft={() => saveLeave()}
          onSubmit={submitFlow}
          onApprovalVerifyOpen={() => openApprovalVerify(taskId)}
          onApprovalRecord={openApprovalRecord}
          onBack={goBack}
        />
        <Form form={form} layout="vertical" disabled={readonly} initialValues={{ leaveType: '1' }}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="status" hidden>
            <Input />
          </Form.Item>
          {pageType === 'add' && (
            <Form.Item label="流程定义">
              <Select value={flowCode} options={flowCodeOptions} onChange={setFlowCode} />
            </Form.Item>
          )}
          <Form.Item name="leaveType" label="请假类型" rules={[{ required: true, message: '请假类型不能为空' }]}>
            <Select options={leaveTypeOptions} placeholder="请选择请假类型" />
          </Form.Item>
          <Form.Item name="leaveTime" label="请假时间" rules={[{ required: true, message: '请假时间不能为空' }]}>
            <DatePicker.RangePicker
              showTime={{ defaultOpenValue: leaveTimeDefaultOpenValue }}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="leaveDays" label="请假天数" rules={[{ required: true, message: '请假天数不能为空' }]}>
            <InputNumber disabled min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="请假原因">
            <Input.TextArea rows={4} placeholder="请输入请假原因" />
          </Form.Item>
        </Form>
      </ProCard>

      <SubmitVerify
        open={approvalOpen}
        taskId={approvalTaskId}
        variables={approvalVariables}
        onOpenChange={setApprovalOpen}
        onSubmitted={finishWorkflowAction}
      />

      <ApprovalRecord businessId={formId} open={recordOpen} onOpenChange={setRecordOpen} />
    </PageContainer>
  );
}
