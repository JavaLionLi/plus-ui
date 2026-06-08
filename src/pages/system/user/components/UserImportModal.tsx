import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, message, Modal, Space, Upload, type UploadFile, type UploadProps } from 'antd';
import { useState } from 'react';
import { importUser } from '@/api/system/user';
import { download } from '@/utils/download';
import { buildAccept, formatUploadResponseMessage, getUploadErrorMessage, validateUploadFile } from '@/utils/upload';

interface UserImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const importFileTypes = ['xls', 'xlsx'];

export default function UserImportModal({ open, onClose, onSuccess }: UserImportModalProps) {
  const [uploading, setUploading] = useState(false);
  const [updateSupport, setUpdateSupport] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const resetImport = () => {
    setFileList([]);
    setUploading(false);
  };

  const importTemplate = () => {
    download('/system/user/importTemplate', {}, `user_template_${Date.now()}.xlsx`);
  };

  const importUploadProps: UploadProps = {
    name: 'file',
    accept: buildAccept(importFileTypes),
    maxCount: 1,
    fileList,
    beforeUpload: file => {
      if (!validateUploadFile(file, { fileTypes: importFileTypes, fileKind: '导入文件' })) {
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    onRemove: () => setFileList([]),
    onChange: info => {
      setFileList(info.fileList.slice(-1));
    }
  };

  const submitImport = async () => {
    const file = fileList[0]?.originFileObj || fileList[0];
    if (!file) {
      message.warning('请选择导入文件');
      return;
    }
    const formData = new FormData();
    formData.append('file', file as File);
    setUploading(true);
    try {
      const response = await importUser(formData, updateSupport);
      onClose();
      resetImport();
      Modal.info({
        title: '导入结果',
        content: formatUploadResponseMessage(response.msg)
      });
      onSuccess();
    } catch (error) {
      message.error(getUploadErrorMessage(error, '导入失败'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="用户导入"
      open={open}
      confirmLoading={uploading}
      onOk={submitImport}
      onCancel={() => {
        onClose();
        resetImport();
      }}
    >
      <Upload.Dragger {...importUploadProps}>
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">将文件拖到此处，或点击上传</p>
        <p className="ant-upload-hint">仅允许导入 xls、xlsx 格式文件。</p>
      </Upload.Dragger>
      <Space orientation="vertical" style={{ marginTop: 12 }}>
        <Checkbox checked={updateSupport} onChange={event => setUpdateSupport(event.target.checked)}>
          是否更新已经存在的用户数据
        </Checkbox>
        <Button type="link" icon={<DownloadOutlined />} onClick={importTemplate}>
          下载模板
        </Button>
      </Space>
    </Modal>
  );
}
