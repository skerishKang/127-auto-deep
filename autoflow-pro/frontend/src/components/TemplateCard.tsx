import React from 'react'
import { Card, Tag, Button, Space } from 'antd'
import { RocketOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { Template } from '../types/workflow'

interface TemplateCardProps {
  template: Template
  onUse: (template: Template) => void
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUse }) => {
  const difficultyColors = {
    easy: 'green',
    medium: 'orange',
    hard: 'red',
  }

  const categoryLabels = {
    mail: '메일',
    file: '파일',
    etl: '데이터',
    crawling: '크롤링',
    ai: 'AI',
    hr: '인사',
    finance: '재무',
    collaboration: '협업',
  }

  return (
    <Card
      hoverable
      cover={
        <div style={{ padding: '20px', background: '#f5f5f5', textAlign: 'center' }}>
          <RocketOutlined style={{ fontSize: '48px', color: '#722ed1' }} />
        </div>
      }
      actions={[
        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => onUse(template)}>
          사용하기
        </Button>,
      ]}
    >
      <Card.Meta
        title={
          <Space>
            {template.name}
            <Tag color={difficultyColors[template.difficulty]}>
              {template.difficulty === 'easy' ? '쉬움' :
               template.difficulty === 'medium' ? '보통' : '어려움'}
            </Tag>
          </Space>
        }
        description={
          <div>
            <p style={{ marginBottom: '8px', color: '#666' }}>
              {template.description}
            </p>
            <Space wrap>
              <Tag>{categoryLabels[template.category]}</Tag>
              {template.roiHint && <Tag color="blue">{template.roiHint}</Tag>}
            </Space>
            {template.testCases && template.testCases.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                ✓ {template.testCases[0]}
              </div>
            )}
          </div>
        }
      />
    </Card>
  )
}

export default TemplateCard
