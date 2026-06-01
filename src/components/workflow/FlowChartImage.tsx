import { Card, Empty, Image } from 'antd';
import { useMemo, useRef, useState, type MouseEvent, type WheelEvent } from 'react';

interface FlowChartImageProps {
  imgUrl?: string;
}

const minScale = 0.5;
const maxScale = 3;

export default function FlowChartImage({ imgUrl }: FlowChartImageProps) {
  const wrapperRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({ dragging: false, x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const transformStyle = useMemo(
    () => ({
      transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
      transition: dragRef.current.dragging ? 'none' : 'transform 0.2s ease'
    }),
    [scale, translate]
  );

  const resetTransform = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleWheel = (event: WheelEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const nextScale = Math.max(minScale, Math.min(maxScale, scale - event.deltaY / 1000));
    setScale(nextScale);
    setTranslate({ x: 0, y: 0 });
  };

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    if (scale <= 1) return;
    event.preventDefault();
    dragRef.current = { dragging: true, x: event.clientX, y: event.clientY };
  };

  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    if (!dragRef.current.dragging) return;
    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    dragRef.current = { dragging: true, x: event.clientX, y: event.clientY };
    setTranslate(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
  };

  const stopDrag = () => {
    dragRef.current.dragging = false;
  };

  if (!imgUrl) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无流程图" />;
  }

  return (
    <button
      type="button"
      ref={wrapperRef}
      className="workflow-flow-chart-image"
      aria-label="流程图，双击或按回车复位"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onDoubleClick={resetTransform}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          resetTransform();
        }
      }}
    >
      <Card className="workflow-flow-chart-image-card" styles={{ body: { padding: 0 } }}>
        <div className="workflow-flow-chart-image-inner" style={transformStyle}>
          <Image src={imgUrl} preview={false} className="workflow-flow-chart-image-img" />
        </div>
      </Card>
    </button>
  );
}
