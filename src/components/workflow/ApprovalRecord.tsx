import { DownloadOutlined } from '@ant-design/icons';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Button, Modal, Popover, Spin, Table, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import type { OssVO } from '@/api/system/oss/types';
import type { FlowHistoryVO } from '@/api/workflow/task/types';
import { downloadOss, listByIds } from '@/api/system/oss';
import { flowHisTaskList } from '@/api/workflow/instance';
import DictTag from '@/components/common/DictTag';
import { useDict } from '@/hooks/useDict';
import { saveValidatedBlob } from '@/utils/download';
import FlowChart from './FlowChart';
import UserNameDisplay from './UserNameDisplay';

interface ApprovalRecordProps {
  businessId?: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  width?: string | number;
}

export default function ApprovalRecord({ businessId, open, onOpenChange, width = '80%' }: ApprovalRecordProps) {
  const dicts = useDict('wf_task_status');
  const [recordList, setRecordList] = useState<FlowHistoryVO[]>([]);
  const [instanceId, setInstanceId] = useState<string | number>();
  const { loading, runAsync: loadRecords } = useRequest(
    async (nextBusinessId: string | number) => {
      const res = await flowHisTaskList(nextBusinessId);
      const rows = res.data?.list || [];
      const nextRows = await Promise.all(
        rows.map(async row => {
          if (!row.ext) {
            return { ...row, attachmentList: [] };
          }
          try {
            const ossRes = await listByIds(row.ext);
            return { ...row, attachmentList: ossRes.data || [] };
          } catch {
            return { ...row, attachmentList: [] };
          }
        })
      );
      return { rows: nextRows, instanceId: res.data?.instanceId };
    },
    {
      manual: true,
      onSuccess: data => {
        setRecordList(data.rows);
        setInstanceId(data.instanceId);
      }
    }
  );

  useEffect(() => {
    if (!open || !businessId) {
      if (!open) {
        setRecordList([]);
        setInstanceId(undefined);
      }
      return;
    }

    setRecordList([]);
    setInstanceId(undefined);
    loadRecords(businessId);
  }, [businessId, loadRecords, open]);

  const downloadAttachment = async (row: OssVO) => {
    const blob = await downloadOss(row.ossId);
    await saveValidatedBlob(blob, row.originalName || row.fileName || `oss_${row.ossId}`);
  };

  const columns: ProColumns<FlowHistoryVO>[] = [
    { title: '任务名称', dataIndex: 'nodeName', ellipsis: true },
    {
      title: '办理人',
      dataIndex: 'approverName',
      ellipsis: true,
      render: (_, row) => <UserNameDisplay content={row.approverName} />
    },
    {
      title: '状态',
      dataIndex: 'flowStatus',
      width: 100,
      render: (_, row) => <DictTag options={dicts.wf_task_status} value={row.flowStatus} />
    },
    { title: '审批意见', dataIndex: 'message', ellipsis: true },
    { title: '开始时间', dataIndex: 'createTime', valueType: 'dateTime', width: 170 },
    { title: '结束时间', dataIndex: 'updateTime', valueType: 'dateTime', width: 170 },
    { title: '运行时长', dataIndex: 'runDuration', width: 140 },
    {
      title: '附件',
      dataIndex: 'attachmentList',
      width: 100,
      render: (_, row) => {
        const attachments = row.attachmentList || [];
        if (!attachments.length) return '-';
        return (
          <Popover
            trigger="click"
            placement="right"
            content={
              <Table<OssVO>
                rowKey="ossId"
                size="small"
                pagination={false}
                dataSource={attachments}
                columns={[
                  { title: '附件名称', dataIndex: 'originalName', ellipsis: true, width: 220 },
                  {
                    title: '操作',
                    width: 90,
                    render: (_, attachment) => (
                      <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadAttachment(attachment)}
                      >
                        下载
                      </Button>
                    )
                  }
                ]}
              />
            }
          >
            <Button type="link" size="small">
              附件
            </Button>
          </Popover>
        );
      }
    }
  ];

  return (
    <Modal
      title="审批记录"
      open={open}
      width={width}
      footer={null}
      onCancel={() => onOpenChange(false)}
      destroyOnHidden
    >
      <Tabs
        items={[
          {
            key: 'image',
            label: '流程图',
            children: (
              <Spin spinning={loading}>
                <FlowChart instanceId={instanceId} />
              </Spin>
            )
          },
          {
            key: 'info',
            label: '审批信息',
            children: (
              <ProTable<FlowHistoryVO>
                rowKey={(_, index) => String(index)}
                columns={columns}
                options={false}
                dataSource={recordList}
                loading={loading}
                search={false}
                pagination={false}
              />
            )
          }
        ]}
      />
    </Modal>
  );
}
