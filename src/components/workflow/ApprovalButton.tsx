import { ArrowLeftOutlined, CheckCircleOutlined, HistoryOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';

type ApprovalPageType = 'add' | 'update' | 'view' | 'approval';

interface ApprovalButtonProps {
  status?: string;
  pageType: ApprovalPageType;
  id?: string | number;
  buttonLoading?: boolean;
  onSubmitDraft: () => void;
  onSubmit: () => void;
  onApprovalVerifyOpen: () => void;
  onApprovalRecord: () => void;
  onBack: () => void;
}

export default function ApprovalButton({
  status,
  pageType,
  id,
  buttonLoading = false,
  onSubmitDraft,
  onSubmit,
  onApprovalVerifyOpen,
  onApprovalRecord,
  onBack
}: ApprovalButtonProps) {
  const submitButtonShow =
    pageType === 'add' || (pageType === 'update' && !!status && ['draft', 'cancel', 'back'].includes(status));
  const approvalButtonShow = pageType === 'approval' && status === 'waiting';
  const approvalRecordShow = !!id && status !== 'draft';

  return (
    <div className="workflow-approval-button-bar">
      <Space wrap>
        {submitButtonShow && (
          <Button icon={<SaveOutlined />} loading={buttonLoading} onClick={onSubmitDraft}>
            暂存
          </Button>
        )}
        {submitButtonShow && (
          <Button type="primary" icon={<SendOutlined />} loading={buttonLoading} onClick={onSubmit}>
            提交
          </Button>
        )}
        {approvalButtonShow && (
          <Button type="primary" icon={<CheckCircleOutlined />} loading={buttonLoading} onClick={onApprovalVerifyOpen}>
            审批
          </Button>
        )}
        {approvalRecordShow && (
          <Button icon={<HistoryOutlined />} onClick={onApprovalRecord}>
            流程进度
          </Button>
        )}
      </Space>
      <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
        返回
      </Button>
    </div>
  );
}
