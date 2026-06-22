import { GithubOutlined, ReadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Space, Tag } from 'antd';

const products = [
  {
    name: 'RuoYi-Vue-Plus',
    version: 'v6.0.0',
    summary: '面向分布式集群场景的后台管理系统，保持现有业务接口与权限逻辑，适合先完成前端壳升级。',
    tags: ['React', 'Ant', 'Spring Boot', 'Sa-Token'],
    primaryUrl: 'https://github.com/dromara/RuoYi-Vue-Plus',
    secondaryUrl: 'https://plus-doc.dromara.org/#/ruoyi-vue-plus/changlog'
  },
  {
    name: 'RuoYi-Cloud-Plus',
    version: 'v6.0.0',
    summary: '微服务通用权限管理系统，适合更复杂的服务治理场景，也可以沿用同样的前端升级思路。',
    tags: ['Spring Cloud', 'Gateway', 'Nacos', 'Dubbo'],
    primaryUrl: 'https://github.com/dromara/RuoYi-Cloud-Plus',
    secondaryUrl: 'https://plus-doc.dromara.org/#/ruoyi-cloud-plus/changlog'
  }
];

const capabilityGroups = [
  {
    title: '后端基建',
    items: ['Spring Boot / Spring Cloud', 'Sa-Token 认证与权限', 'MySQL / Redis', '代码生成器']
  },
  {
    title: '平台能力',
    items: ['动态菜单与按钮权限', '监控、日志、在线用户', '任务调度与工作流', '文件存储与多云适配']
  },
  {
    title: '前端方向',
    items: ['UI 卡片化', '主题与布局统一', '通用页面容器规范化', '企业化布局']
  }
];

function openTarget(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function Dashboard() {
  return (
    <PageContainer title={false}>
      <div className="home-dashboard">
        <section className="home-hero">
          <div>
            <h1>RuoYi-React-Plus 控制台</h1>
            <p>
              企业级后台管理系统，重写 RuoYi-Vue 所有功能，集成 Sa-Token、Mybatis-Plus、WarmFlow、SpringDoc、Hutool、OSS
              等组件。
            </p>
            <Space wrap>
              <Button
                type="primary"
                icon={<GithubOutlined />}
                onClick={() => openTarget('https://github.com/dromara/RuoYi-Vue-Plus')}
              >
                查看源码
              </Button>
              <Button
                icon={<ReadOutlined />}
                onClick={() => openTarget('https://plus-doc.dromara.org/#/ruoyi-vue-plus/changlog')}
              >
                更新日志
              </Button>
            </Space>
          </div>
        </section>

        <div className="home-grid">
          <Card title="项目矩阵">
            <div className="home-product-list">
              {products.map(product => (
                <article key={product.name} className="home-product-card">
                  <div className="home-product-top">
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.summary}</p>
                    </div>
                    <span>{product.version}</span>
                  </div>
                  <Space wrap>
                    {product.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                  <Space wrap>
                    <Button type="primary" ghost onClick={() => openTarget(product.primaryUrl)}>
                      访问 GitHub
                    </Button>
                    <Button onClick={() => openTarget(product.secondaryUrl)}>查看更新日志</Button>
                  </Space>
                </article>
              ))}
            </div>
          </Card>

          <Card title="能力地图">
            <div className="home-capability-list">
              {capabilityGroups.map(group => (
                <article key={group.title} className="home-capability-card">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
