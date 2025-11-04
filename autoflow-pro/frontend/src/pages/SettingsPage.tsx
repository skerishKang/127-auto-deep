import React from 'react'
import { Card, Typography } from 'antd'

const { Title, Text } = Typography

const SettingsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>설정</Title>

      <Card>
        <Text>설정 기능은 SP-07과 SP-08에서 구현됩니다.</Text>
      </Card>
    </div>
  )
}

export default SettingsPage
