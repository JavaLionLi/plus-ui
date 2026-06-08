import type { EChartsOption } from 'echarts';
import { ReloadOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Card, Col, Row, Space, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import type { CacheVO } from '@/api/monitor/cache/types';
import { getCache } from '@/api/monitor/cache';
import { useLoading } from '@/hooks/useLoading';

function infoValue(cache: Partial<CacheVO>, key: string) {
  return cache.info?.[key] || '-';
}

function cpuValue(cache: Partial<CacheVO>) {
  const value = Number.parseFloat(infoValue(cache, 'used_cpu_user_children'));
  return Number.isNaN(value) ? '-' : value.toFixed(2);
}

function overviewRows(cache: Partial<CacheVO>) {
  return [
    [
      ['Redis版本', infoValue(cache, 'redis_version')],
      ['运行模式', infoValue(cache, 'redis_mode') === 'standalone' ? '单机' : infoValue(cache, 'redis_mode')],
      ['端口', infoValue(cache, 'tcp_port')],
      ['客户端数', infoValue(cache, 'connected_clients')]
    ],
    [
      ['运行时间(天)', infoValue(cache, 'uptime_in_days')],
      ['使用内存', infoValue(cache, 'used_memory_human')],
      ['使用CPU', cpuValue(cache)],
      ['内存配置', infoValue(cache, 'maxmemory_human')]
    ],
    [
      ['AOF是否开启', infoValue(cache, 'aof_enabled') === '0' ? '否' : '是'],
      ['RDB是否成功', infoValue(cache, 'rdb_last_bgsave_status')],
      ['Key数量', cache.dbSize ?? '-'],
      [
        '网络入口/出口',
        `${infoValue(cache, 'instantaneous_input_kbps')}kps/${infoValue(cache, 'instantaneous_output_kbps')}kps`
      ]
    ]
  ];
}

export default function MonitorCachePage() {
  const [cache, setCache] = useState<Partial<CacheVO>>({});
  const { loading, withLoading } = useLoading();

  const loadOverview = useCallback(async () => {
    await withLoading(async () => {
      const cacheRes = await getCache();
      setCache(cacheRes.data || {});
    });
  }, [withLoading]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const commandOption = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      series: [
        {
          name: '命令',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: (cache.commandStats || []).map(item => ({ name: item.name, value: Number(item.value) || 0 })),
          animationEasing: 'cubicInOut',
          animationDuration: 1000
        }
      ]
    }),
    [cache.commandStats]
  );

  const memoryOption = useMemo<EChartsOption>(() => {
    const usedMemoryHuman = infoValue(cache, 'used_memory_human');
    return {
      tooltip: {
        formatter: `{b} <br/>{a} : ${usedMemoryHuman}`
      },
      series: [
        {
          name: '峰值',
          type: 'gauge',
          min: 0,
          max: 1000,
          detail: {
            formatter: usedMemoryHuman
          },
          data: [
            {
              value: Number.parseFloat(usedMemoryHuman) || 0,
              name: '内存消耗'
            }
          ]
        }
      ]
    };
  }, [cache]);

  return (
    <PageContainer title="缓存监控">
      <Spin spinning={loading}>
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <ProCard
            title="缓存概览"
            extra={
              <Button icon={<ReloadOutlined />} onClick={loadOverview}>
                刷新
              </Button>
            }
          >
            <div className="cache-overview-table-react">
              <table>
                <tbody>
                  {overviewRows(cache).map(row => (
                    <tr key={row[0][0]}>
                      {row.map(([label, value]) => (
                        <Fragment key={label}>
                          <td className="cache-overview-label-react">{label}</td>
                          <td>{value}</td>
                        </Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ProCard>

          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <Card title="命令统计">
                <ReactECharts option={commandOption} theme="macarons" className="cache-chart-react" />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="内存信息">
                <ReactECharts option={memoryOption} theme="macarons" className="cache-chart-react" />
              </Card>
            </Col>
          </Row>
        </Space>
      </Spin>
    </PageContainer>
  );
}
