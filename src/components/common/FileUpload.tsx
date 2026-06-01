import { DeleteOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, List, message, Upload, type UploadProps } from 'antd';
import type { OssVO } from '@/api/system/oss/types';
import { buildAccept, getUploadErrorMessage, validateUploadFile } from '@/utils/upload';
import { type OssUploadFile, useOssUploadList } from './useOssUploadList';

export interface FileUploadProps {
  value?: string | number | OssVO[];
  onChange?: (value: string) => void;
  limit?: number;
  fileSize?: number;
  fileType?: string[];
  showTip?: boolean;
  disabled?: boolean;
  deleteRemote?: boolean;
}

const defaultFileTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf'];

function getFileName(name?: string) {
  if (!name) {
    return '-';
  }
  const index = name.lastIndexOf('/');
  return index > -1 ? name.slice(index + 1) : name;
}

function toUploadFile(item: OssVO, index: number): OssUploadFile {
  return {
    uid: String(item.ossId || `${Date.now()}-${index}`),
    name: item.originalName || item.fileName || String(item.ossId),
    url: item.url,
    status: 'done',
    ossId: item.ossId
  };
}

function toUploadedFile(
  result: { ossId?: string | number; fileName?: string; url?: string },
  file: File
): OssUploadFile {
  return {
    uid: String(result.ossId || file.name),
    name: result.fileName || file.name,
    url: result.url,
    status: 'done',
    ossId: result.ossId
  };
}

export default function FileUpload({
  value,
  onChange,
  limit = 5,
  fileSize = 5,
  fileType = defaultFileTypes,
  showTip = true,
  disabled = false,
  deleteRemote = true
}: FileUploadProps) {
  const { fileList, uploading, uploadFile, removeFile } = useOssUploadList({
    value,
    onChange,
    deleteRemote,
    toUploadFile,
    toUploadedFile
  });

  const beforeUpload: UploadProps['beforeUpload'] = file => {
    if (fileList.length >= limit) {
      message.error(`上传文件数量不能超过 ${limit} 个`);
      return Upload.LIST_IGNORE;
    }
    if (!validateUploadFile(file, { fileTypes: fileType, maxSizeMB: fileSize, fileKind: '文件' })) {
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async options => {
    const file = options.file as File;
    try {
      const { response } = await uploadFile(file);
      options.onSuccess?.(response, file);
    } catch (error) {
      options.onError?.(error as Error);
      message.error(getUploadErrorMessage(error, '上传文件失败'));
    }
  };

  return (
    <div className="file-upload-react">
      {!disabled && (
        <Upload
          multiple
          accept={buildAccept(fileType)}
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            选取文件
          </Button>
        </Upload>
      )}
      {showTip && !disabled && (
        <div className="upload-tip-react">
          请上传大小不超过 <b>{fileSize}MB</b>，格式为 <b>{fileType.join('/')}</b> 的文件
        </div>
      )}
      <List
        size="small"
        className="file-upload-list-react"
        dataSource={fileList}
        renderItem={item => (
          <List.Item
            actions={
              disabled
                ? []
                : [
                    <Button
                      key="delete"
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeFile(item)}
                    >
                      删除
                    </Button>
                  ]
            }
          >
            <a href={item.url} target="_blank" rel="noreferrer">
              <PaperClipOutlined /> {getFileName(item.name)}
            </a>
          </List.Item>
        )}
      />
    </div>
  );
}
