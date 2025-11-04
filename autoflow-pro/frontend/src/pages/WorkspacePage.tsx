import React from 'react'
import { Card, Typography, Space, Statistic } from 'antd'

const { Title, Text } = Typography

const WorkspacePage: React.FC = () => {
  return (
    <div>
      <Title level={2}>워크스페이스</Title>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <Card>
          <Statistic title="활성 워크플로우" value={0} />
        </Card>
        <Card>
          <Statistic title="월간 실행" value={0} />
        </Card>
        <Card>
          <Statistic title="성공률" value={100} suffix="%" />
        </Card>
      </div>

      <Card>
        <Title level={4}>환영합니다!</Title>
        <Text>
          AutoFlow Pro에서 지능형 워크플로우를 만들어 자동화 업무를 시작하세요.
        </Text>
      </Card>
    </div>
  )
}

export default WorkspacePage
