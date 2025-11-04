import React, { useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { Card, Select, Space, Button, Input, Tag, Divider } from 'antd'
import { PlayCircleOutlined, DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons'
import axios from 'axios'
import toast from 'react-hot-toast'

interface CodeEditorProps {
  initialCode?: string
  language?: 'python' | 'javascript'
  onCodeChange?: (code: string) => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  language: initialLanguage = 'python',
  onCodeChange,
}) => {
  const [code, setCode] = useState(initialCode)
  const [language, setLanguage] = useState<'python' | 'javascript'>(initialLanguage)
  const [packages, setPackages] = useState<string[]>([])
  const [input, setInput] = useState('{}')
  const [output, setOutput] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [artifacts, setArtifacts] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const packageOptions = {
    python: [
      { label: 'requests', value: 'requests' },
      { label: 'pandas', value: 'pandas' },
      { label: 'numpy', value: 'numpy' },
      { label: 'beautifulsoup4', value: 'beautifulsoup4' },
      { label: 'flask', value: 'flask' },
      { label: 'sqlalchemy', value: 'sqlalchemy' },
      { label: 'pytesseract', value: 'pytesseract' },
      { label: 'openai', value: 'openai' },
    ],
    javascript: [
      { label: 'axios', value: 'axios' },
      { label: 'lodash', value: 'lodash' },
      { label: 'moment', value: 'moment' },
      { label: 'csv-parser', value: 'csv-parser' },
      { label: 'pdf2pic', value: 'pdf2pic' },
    ],
  }

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('코드를 입력해주세요.')
      return
    }

    setIsRunning(true)
    try {
      const inputData = JSON.parse(input || '{}')

      const response = await axios.post('/api/v1/code-execution/execute', {
        language,
        code,
        packages,
        input: inputData,
      })

      const { success, output, logs, artifacts, error } = response.data

      if (success) {
        setOutput(output || '실행 완료')
        setLogs(logs)
        setArtifacts(artifacts)
        toast.success('코드가 성공적으로 실행되었습니다!')
      } else {
        setOutput(error || '실행 중 오류가 발생했습니다.')
        toast.error('코드 실행에 실패했습니다.')
      }
    } catch (error) {
      console.error('Code execution error:', error)
      toast.error('코드 실행 중 오류가 발생했습니다.')
      setOutput(`오류: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleArtifactDownload = async (artifactPath: string) => {
    try {
      const response = await axios.get(
        `/api/v1/code-execution/artifact/${Date.now()}/${artifactPath}`,
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', artifactPath)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('아티팩트 다운로드에 실패했습니다.')
    }
  }

  return (
    <div>
      <Card title="코드 에디터" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <span>언어:</span>
            <Select
              value={language}
              onChange={setLanguage}
              style={{ width: 150 }}
              options={[
                { label: 'Python', value: 'python' },
                { label: 'JavaScript', value: 'javascript' },
              ]}
            />

            <span>패키지:</span>
            <Select
              mode="multiple"
              value={packages}
              onChange={setPackages}
              style={{ minWidth: 300 }}
              placeholder="패키지를 선택하세요"
              options={packageOptions[language]}
            />
          </Space>

          <Editor
            height="300px"
            language={language}
            value={code}
            onChange={(value) => {
              setCode(value || '')
              onCodeChange?.(value || '')
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />

          <Space wrap>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleRun}
              loading={isRunning}
            >
              코드 실행
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="입력 데이터" size="small" style={{ marginBottom: 16 }}>
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='JSON 형식으로 입력 데이터를 작성하세요. 예: {"name": "test"}'
          rows={3}
        />
      </Card>

      <Card title="실행 결과" size="small" style={{ marginBottom: 16 }}>
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 200, overflow: 'auto' }}>
          {output || '실행 결과가 여기에 표시됩니다.'}
        </pre>
      </Card>

      {logs.length > 0 && (
        <Card title="로그" size="small" style={{ marginBottom: 16 }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              <code>{log}</code>
            </div>
          ))}
        </Card>
      )}

      {artifacts.length > 0 && (
        <Card title="아티팩트" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            {artifacts.map((artifact, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  {artifact}
                </Tag>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleArtifactDownload(artifact)}
                >
                  다운로드
                </Button>
              </div>
            ))}
          </Space>
        </Card>
      )}
    </div>
  )
}

export default CodeEditor
