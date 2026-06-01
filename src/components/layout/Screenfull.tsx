import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Tooltip } from 'antd';
import { useEffect } from 'react';
import screenfull from 'screenfull';

export default function Screenfull() {
  const [fullscreen, { set: setFullscreen }] = useBoolean(false);

  useEffect(() => {
    if (!screenfull.isEnabled) {
      return undefined;
    }
    const handleChange = () => setFullscreen(screenfull.isFullscreen);
    screenfull.on('change', handleChange);
    handleChange();
    return () => screenfull.off('change', handleChange);
  }, [setFullscreen]);

  const toggleFullscreen = async () => {
    if (!screenfull.isEnabled) {
      return;
    }
    await screenfull.toggle();
  };

  return (
    <Tooltip title={fullscreen ? '退出全屏' : '全屏'}>
      <Button
        type="text"
        className="layout-action-button"
        icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        aria-label={fullscreen ? '退出全屏' : '全屏'}
        onClick={toggleFullscreen}
      />
    </Tooltip>
  );
}
