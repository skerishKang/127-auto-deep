import React from 'react'
import { Typography, Card } from 'antd'
import AINodeEditor from '../components/AINodeEditor'

const { Title, Text } = Typography

const AINodePage: React.FC = () => {
  const handleSave = (data: any) => {
    console.log('AI Node saved:', data)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>AI 노드</Title>
        <Text type="secondary">
          OpenAI와 Anthropic의 AI 모델을 활용하여 텍스트를 요약, 분류, 번역할 수 있습니다.
        </Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Text strong>SP-04 기능: </Text>
        <Text>OpenAI/Anthropic 연동, 요약/분류/번역, 백오프/폴백, 공급자 스위치</Text>
      </Card>

      <AINodeEditor onSave={handleSave} />
    </div>
  )
}

export default AINodePage
