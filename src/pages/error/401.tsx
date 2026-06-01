import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { history, useSearchParams } from '@umijs/max';
import { Button, Result, Space } from 'antd';

export default function Unauthorized() {
  const [params] = useSearchParams();

  const back = () => {
    if (params.get('noGoBack')) {
      history.push('/');
    } else {
      window.history.back();
    }
  };

  return (
    <div className="result-page">
      <Result
        status="403"
        title="401错误!"
        subTitle="您没有访问权限，请不要进行非法操作。"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={back}>
              返回
            </Button>
            <Button type="primary" icon={<HomeOutlined />} onClick={() => history.push('/')}>
              回首页
            </Button>
          </Space>
        }
      />
    </div>
  );
}
