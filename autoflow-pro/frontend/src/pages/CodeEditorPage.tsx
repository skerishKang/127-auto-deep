import React from 'react'
import { Typography, Card } from 'antd'
import CodeEditor from '../components/CodeEditor'

const { Title, Text } = Typography

const CodeEditorPage: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>코드 실행기</Title>
        <Text type="secondary">
          Python과 JavaScript 코드를 샌드박스 환경에서 실행할 수 있습니다.
        </Text>
      </div>

      <Card>
        <Text strong>SP-03 기능: </Text>
        <Text>Python/JS 코드 실행, 패키지 관리(allowlist), 60초 타임아웃, 아티팩트 다운로드</Text>
      </Card>

      <div style={{ marginTop: 24 }}>
        <CodeEditor />
      </div>
    </div>
  )
}

export default CodeEditorPage
