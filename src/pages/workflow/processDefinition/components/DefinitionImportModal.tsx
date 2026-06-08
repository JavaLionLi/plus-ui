import { UploadOutlined } from '@ant-design/icons';
import { message, Modal, Space, TreeSelect, Upload, type UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import type { CategoryTreeVO } from '@/api/workflow/category/types';
import { importDefinition } from '@/api/workflow/definition';
import { buildAccept, getUploadErrorMessage, validateUploadFile } from '@/utils/upload';

interface DefinitionImportModalProps {
  open: boolean;
  categoryOptions: CategoryTreeVO[];
  initialCategory?: string | number;
  onCancel: () => void;
  onSuccess: () => void;
}

const definitionFileTypes = ['json'];

export default function DefinitionImportModal({
  open,
  categoryOptions,
  initialCategory,
  onCancel,
  onSuccess
}: DefinitionImportModalProps) {
  const [uploadCategory, setUploadCategory] = useState<string | number>();

  useEffect(() => {
    if (open) {
      setUploadCategory(initialCategory);
    }
  }, [initialCategory, open]);

  const handleImportDefinition: UploadProps['customRequest'] = async options => {
    const file = options.file as File;
    if (!validateUploadFile(file, { fileTypes: definitionFileTypes, fileKind: '流程文件' })) {
      options.onError?.(new Error('流程文件格式不正确'));
      return;
    }
    if (!uploadCategory || uploadCategory === 'ALL' || uploadCategory === '0') {
      message.error('请选择部署流程分类');
      options.onError?.(new Error('请选择部署流程分类'));
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', String(uploadCategory));
    try {
      await importDefinition(formData);
      message.success('部署成功');
      options.onSuccess?.({});
      onCancel();
      onSuccess();
    } catch (error) {
      message.error(getUploadErrorMessage(error, '部署失败'));
      options.onError?.(error as Error);
    }
  };

  return (
    <Modal title="部署流程文件" open={open} footer={null} onCancel={onCancel} destroyOnHidden>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <TreeSelect
          value={uploadCategory}
          onChange={setUploadCategory}
          treeData={categoryOptions}
          fieldNames={{ label: 'label', value: 'id', children: 'children' }}
          treeDefaultExpandAll
          placeholder="请选择部署流程分类"
          style={{ width: '100%' }}
        />
        <Upload.Dragger
          accept={buildAccept(definitionFileTypes)}
          multiple
          customRequest={handleImportDefinition}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击上传，选择 JSON 流程文件</p>
          <p className="ant-upload-hint">仅支持 json 格式文件</p>
        </Upload.Dragger>
      </Space>
    </Modal>
  );
}
