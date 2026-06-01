import type { UploadFile } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { OssUploadResult, OssVO } from '@/api/system/oss/types';
import { delOss, listByIds, uploadOss } from '@/api/system/oss';

export interface OssUploadFile extends UploadFile {
  ossId?: string | number;
}

interface UseOssUploadListOptions<T extends OssUploadFile> {
  value?: string | number | OssVO[];
  onChange?: (value: string) => void;
  deleteRemote?: boolean;
  toUploadFile: (item: OssVO, index: number) => T;
  toUploadedFile: (result: OssUploadResult, file: File) => T;
}

export function ossFileListToValue(list: OssUploadFile[]) {
  return list
    .map(item => item.ossId)
    .filter(Boolean)
    .join(',');
}

export function useOssUploadList<T extends OssUploadFile>({
  value,
  onChange,
  deleteRemote = true,
  toUploadFile,
  toUploadedFile
}: UseOssUploadListOptions<T>) {
  const [fileList, setFileList] = useState<T[]>([]);
  const [uploading, setUploading] = useState(false);
  const lastValueRef = useRef('');

  const emitChange = useCallback(
    (next: T[]) => {
      const nextValue = ossFileListToValue(next);
      lastValueRef.current = nextValue;
      onChange?.(nextValue);
    },
    [onChange]
  );

  useEffect(() => {
    const resolveValue = async () => {
      if (!value) {
        setFileList([]);
        return;
      }
      if (Array.isArray(value)) {
        setFileList(value.map(toUploadFile));
        return;
      }
      const currentValue = String(value);
      if (currentValue === lastValueRef.current) {
        return;
      }
      const res = await listByIds(currentValue);
      setFileList((res.data || []).map(toUploadFile));
    };

    resolveValue();
  }, [toUploadFile, value]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await uploadOss(formData);
      const nextFile = toUploadedFile(res.data, file);
      setFileList(prev => {
        const next = [...prev, nextFile];
        emitChange(next);
        return next;
      });
      return { response: res, file: nextFile };
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (target: T) => {
    if (deleteRemote && target.ossId) {
      await delOss(target.ossId);
    }
    setFileList(prev => {
      const next = prev.filter(item => item.uid !== target.uid);
      emitChange(next);
      return next;
    });
  };

  return {
    fileList,
    setFileList,
    uploading,
    uploadFile,
    removeFile
  };
}
