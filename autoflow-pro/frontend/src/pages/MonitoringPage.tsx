import { Card } from "antd";
import React, { useState, useEffect } from 'react'
import { Typography, Row, Col, Table, Tag, Spin, Empty } from 'antd'
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, AlertOutlined } from '@ant-design/icons'
import axios from 'axios'
import MetricsCard from '../components/MetricsCard'

const { Title, Text } = Typography

interface SystemMetrics {
  activeWorkflows: number
  totalRuns24h: number
  avgSuccessRate: number
  avgDuration: number
  alerts: Array<{
    type: string
    message: string
    value: number
    threshold: number
    timestamp: string
  }>
}

interface WorkflowSummary {
  workflowId: string
  name: string
  totalRuns: number
  successRate: number
  avgDuration: number
}

const MonitoringPage: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [systemResponse, workflowsResponse] = await Promise.all([
        axios.get('/api/v1/monitoring/system'),
        axios.get('/api/v1/monitoring/workflows'),
      ])
      setSystemMetrics(systemResponse.data)
      setWorkflows(workflowsResponse.data)
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const workflowColumns = [
    {
      title: '워크플로우',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '총 실행',
      dataIndex: 'totalRuns',
      key: 'totalRuns',
      sorter: (a: WorkflowSummary, b: WorkflowSummary) => a.totalRuns - b.totalRuns,
    },
    {
      title: '성공률',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <Tag color={rate >= 95 ? 'green' : rate >= 80 ? 'orange' : 'red'}>
          {rate.toFixed(1)}%
        </Tag>
      ),
      sorter: (a: WorkflowSummary, b: WorkflowSummary) => a.successRate - b.successRate,
    },
    {
      title: '평균 실행시간',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      render: (duration: number) => formatDuration(duration),
      sorter: (a: WorkflowSummary, b: WorkflowSummary) => a.avgDuration - b.avgDuration,
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>모니터링 대시보드</Title>
        <Text type="secondary">
          워크플로우 실행 현황과 성능 메트릭을 확인하세요.
        </Text>
      </div>

      {systemMetrics && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <MetricsCard
                title="활성 워크플로우"
                value={systemMetrics.activeWorkflows}
                prefix={<PlayCircleOutlined />}
                color="#722ed1"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <MetricsCard
                title="24시간 실행"
                value={systemMetrics.totalRuns24h}
                prefix={<PlayCircleOutlined />}
                color="#1890ff"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <MetricsCard
                title="평균 성공률"
                value={systemMetrics.avgSuccessRate.toFixed(1)}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                color={systemMetrics.avgSuccessRate >= 95 ? '#52c41a' : '#faad14'}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <MetricsCard
                title="평균 실행시간"
                value={formatDuration(systemMetrics.avgDuration)}
                prefix={<PlayCircleOutlined />}
                color="#1890ff"
              />
            </Col>
          </Row>

          {systemMetrics.alerts.length > 0 && (
            <Card title="알림" style={{ marginBottom: 24 }}>
              {systemMetrics.alerts.map((alert, index) => (
                <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                  <AlertOutlined style={{ marginRight: 8, color: '#faad14' }} />
                  <Text>{alert.message}</Text>
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      <Card title="워크플로우 개요">
        {workflows.length === 0 ? (
          <Empty description="데이터가 없습니다." />
        ) : (
          <Table
            dataSource={workflows}
            columns={workflowColumns}
            rowKey="workflowId"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  )
}

export default MonitoringPage
