import { PictureOutlined } from '@ant-design/icons';
import { Image } from 'antd';

export interface ImagePreviewProps {
  src?: string;
  width?: string | number;
  height?: string | number;
}

function toCssSize(value?: string | number) {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value;
}

export default function ImagePreview({ src = '', width = 100, height = 100 }: ImagePreviewProps) {
  const srcList = src
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  const firstSrc = srcList[0];

  if (!firstSrc) {
    return (
      <div className="image-preview-empty" style={{ width: toCssSize(width), height: toCssSize(height) }}>
        <PictureOutlined />
      </div>
    );
  }

  return (
    <Image.PreviewGroup items={srcList}>
      <Image
        className="image-preview-react"
        src={firstSrc}
        width={toCssSize(width)}
        height={toCssSize(height)}
        preview={{ src: firstSrc, scaleStep: 0.5 }}
      />
    </Image.PreviewGroup>
  );
}
