import { PlusOutlined } from '@ant-design/icons';
import { message, Upload, type UploadFile, type UploadProps } from 'antd';
import imageCompression from 'browser-image-compression';
import type { OssVO } from '@/api/system/oss/types';
import { buildAccept, getUploadErrorMessage, validateUploadFile } from '@/utils/upload';
import { useOssUploadList } from './useOssUploadList';

interface OssImageFile extends UploadFile {
  ossId?: string | number;
}

export interface ImageUploadProps {
  value?: string | number | OssVO[];
  onChange?: (value: string) => void;
  limit?: number;
  fileSize?: number;
  fileType?: string[];
  showTip?: boolean;
  disabled?: boolean;
  deleteRemote?: boolean;
  compressSupport?: boolean;
  compressTargetSize?: number;
}

const defaultImageTypes = ['png', 'jpg', 'jpeg'];

function toUploadFile(item: OssVO, index: number): OssImageFile {
  return {
    uid: String(item.ossId || `${Date.now()}-${index}`),
    name: String(item.ossId || item.originalName || item.fileName),
    url: item.url,
    status: 'done',
    ossId: item.ossId
  };
}

function toUploadedFile(result: { ossId?: string | number; url?: string }, file: File): OssImageFile {
  return {
    uid: String(result.ossId || file.name),
    name: String(result.ossId || file.name),
    url: result.url,
    status: 'done',
    ossId: result.ossId
  };
}

export default function ImageUpload({
  value,
  onChange,
  limit = 5,
  fileSize = 5,
  fileType = defaultImageTypes,
  showTip = true,
  disabled = false,
  deleteRemote = true,
  compressSupport = false,
  compressTargetSize = 300
}: ImageUploadProps) {
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
    if (!validateUploadFile(file, { fileTypes: fileType, maxSizeMB: fileSize, fileKind: '图片', matchMime: true })) {
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async options => {
    let file = options.file as File;
    if (compressSupport && file.size / 1024 > compressTargetSize) {
      file = await imageCompression(file, {
        maxSizeMB: compressTargetSize / 1024,
        useWebWorker: true
      });
    }
    try {
      const { response } = await uploadFile(file);
      options.onSuccess?.(response, file);
    } catch (error) {
      options.onError?.(error as Error);
      message.error(getUploadErrorMessage(error, '上传图片失败'));
    }
  };

  const onRemove: UploadProps['onRemove'] = async file => {
    await removeFile(file as OssImageFile);
    return true;
  };

  return (
    <div className="image-upload-react">
      <Upload
        listType="picture-card"
        multiple
        disabled={disabled}
        accept={buildAccept(fileType)}
        fileList={fileList}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onRemove={onRemove}
      >
        {!disabled && fileList.length < limit ? (
          <button type="button" className="image-upload-trigger-react" disabled={uploading}>
            <PlusOutlined />
          </button>
        ) : null}
      </Upload>
      {showTip && !disabled && (
        <div className="upload-tip-react">
          请上传大小不超过 <b>{fileSize}MB</b>，格式为 <b>{fileType.join('/')}</b> 的文件
        </div>
      )}
    </div>
  );
}
