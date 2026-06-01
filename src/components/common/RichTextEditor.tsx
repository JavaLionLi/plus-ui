import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor-next/editor';
import { Editor, Toolbar } from '@wangeditor-next/editor-for-react';
import { message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listByIds, uploadOss } from '@/api/system/oss';
import { getUploadErrorMessage, validateUploadFile } from '@/utils/upload';

const OSS_MARKER_RE = /oss:\/\/([\w-]+)/g;
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'svg'];
const VIDEO_TYPES = ['mp4', 'webm', 'ogg'];
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg', 'image/svg+xml'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  minHeight?: number;
  height?: number;
  readOnly?: boolean;
  placeholder?: string;
  imageSize?: number;
  videoSize?: number;
  type?: 'url' | 'base64' | '';
}

export default function RichTextEditor({
  value,
  onChange,
  minHeight = 400,
  height,
  readOnly = false,
  placeholder = '请输入内容',
  imageSize = 5,
  videoSize = 100,
  type = 'url'
}: RichTextEditorProps) {
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [html, setHtml] = useState('');
  const ossUrlToIdRef = useRef(new Map<string, string>());
  const lastEncodedValueRef = useRef('');
  const isResolvingRef = useRef(false);

  const uploadToOss = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await uploadOss(formData);
    if (!res.data.url || !res.data.ossId) {
      throw new Error('上传失败');
    }
    ossUrlToIdRef.current.set(res.data.url, String(res.data.ossId));
    return res.data;
  }, []);

  const encodeOssContent = useCallback((content: string) => {
    if (!content) {
      return content;
    }
    let result = content;
    for (const [url, ossId] of ossUrlToIdRef.current) {
      result = result.replaceAll(url, `oss://${ossId}`);
    }
    return result;
  }, []);

  const decodeOssContent = useCallback(async (content: string) => {
    if (!content) {
      return '';
    }
    const matches = [...content.matchAll(OSS_MARKER_RE)];
    if (!matches.length) {
      return content;
    }

    const ossIds = [...new Set(matches.map(match => match[1]).filter(Boolean))];
    try {
      const res = await listByIds(ossIds.join(','));
      let result = content;
      for (const oss of res.data || []) {
        ossUrlToIdRef.current.set(oss.url, String(oss.ossId));
        result = result.replaceAll(`oss://${oss.ossId}`, oss.url);
      }
      return result;
    } catch {
      return content;
    }
  }, []);

  const validateImageFile = useCallback(
    (file: File) => {
      return validateUploadFile(file, {
        fileTypes: IMAGE_TYPES,
        maxSizeMB: imageSize,
        fileKind: '图片',
        matchMime: true
      });
    },
    [imageSize]
  );

  const validateVideoFile = useCallback(
    (file: File) => {
      return validateUploadFile(file, {
        fileTypes: VIDEO_TYPES,
        maxSizeMB: videoSize,
        fileKind: '视频',
        matchMime: true
      });
    },
    [videoSize]
  );

  const getUploadImageMenuConfig = useCallback(() => {
    if (type === 'base64') {
      return {
        allowedFileTypes: IMAGE_MIME_TYPES,
        customUpload(file: File, insertFn: (url: string, alt?: string, href?: string) => void) {
          if (!validateImageFile(file)) {
            return;
          }
          const reader = new FileReader();
          reader.onload = () => insertFn(reader.result as string, file.name);
          reader.onerror = () => message.error('图片插入失败');
          reader.readAsDataURL(file);
        }
      };
    }

    return {
      allowedFileTypes: IMAGE_MIME_TYPES,
      async customUpload(file: File, insertFn: (url: string, alt?: string, href?: string) => void) {
        if (!validateImageFile(file)) {
          return;
        }
        try {
          const result = await uploadToOss(file);
          insertFn(result.url || '', file.name, result.url);
        } catch (error) {
          message.error(getUploadErrorMessage(error, '图片上传失败'));
        }
      }
    };
  }, [type, uploadToOss, validateImageFile]);

  const getUploadVideoMenuConfig = useCallback(
    () => ({
      allowedFileTypes: VIDEO_MIME_TYPES,
      async customUpload(file: File, insertFn: (url: string, poster?: string) => void) {
        if (!validateVideoFile(file)) {
          return;
        }
        try {
          const result = await uploadToOss(file);
          insertFn(result.url || '');
        } catch (error) {
          message.error(getUploadErrorMessage(error, '视频上传失败'));
        }
      }
    }),
    [uploadToOss, validateVideoFile]
  );

  const toolbarConfig = useMemo<Partial<IToolbarConfig>>(() => {
    const excludeKeys = ['fullScreen'];
    if (!type) {
      excludeKeys.push('uploadImage', 'uploadVideo');
    }
    return {
      modalAppendToBody: false,
      excludeKeys
    };
  }, [type]);

  const editorConfig = useMemo<Partial<IEditorConfig>>(
    () => ({
      placeholder,
      autoFocus: false,
      MENU_CONF: {
        uploadImage: getUploadImageMenuConfig(),
        uploadVideo: getUploadVideoMenuConfig()
      }
    }),
    [getUploadImageMenuConfig, getUploadVideoMenuConfig, placeholder]
  );

  useEffect(() => {
    const nextValue = value || '';
    if (nextValue === lastEncodedValueRef.current) {
      return;
    }

    let ignore = false;
    isResolvingRef.current = true;
    decodeOssContent(nextValue)
      .then(resolved => {
        if (!ignore) {
          setHtml(resolved);
        }
      })
      .finally(() => {
        if (!ignore) {
          isResolvingRef.current = false;
        }
      });

    return () => {
      ignore = true;
    };
  }, [decodeOssContent, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (readOnly) {
      editor.disable();
    } else {
      editor.enable();
    }
  }, [editor, readOnly]);

  useEffect(() => {
    return () => {
      if (!editor) {
        return;
      }
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  const handleChange = (currentEditor: IDomEditor) => {
    const currentHtml = currentEditor.getHtml();
    setHtml(currentHtml);
    if (isResolvingRef.current) {
      return;
    }
    const encoded = encodeOssContent(currentHtml);
    lastEncodedValueRef.current = encoded;
    onChange?.(encoded);
  };

  return (
    <div className="rich-editor-shell">
      <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" className="rich-editor-toolbar" />
      <div className="rich-editor-body" style={{ minHeight, height: height || minHeight }}>
        <Editor
          defaultConfig={editorConfig}
          value={html}
          onCreated={setEditor}
          onChange={handleChange}
          mode="default"
          className="rich-editor-content"
        />
      </div>
    </div>
  );
}
