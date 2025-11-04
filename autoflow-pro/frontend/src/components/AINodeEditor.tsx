import React, { useState } from 'react'
import { Card, Select, Input, Button, Space, Tag, Spin, Result } from 'antd'
import { RobotOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import axios from 'axios'
import toast from 'react-hot-toast'

interface AINodeEditorProps {
  initialData?: {
    aiProvider: 'openai' | 'anthropic'
    aiModel: string
    prompt?: string
    type: 'summarize' | 'classify' | 'translate' | 'custom'
  }
  onSave: (data: any) => void
}

const AINodeEditor: React.FC<AINodeEditorProps> = ({ initialData, onSave }) => {
  const [provider, setProvider] = useState<'openai' | 'anthropic'>(initialData?.aiProvider || 'openai')
  const [model, setModel] = useState(initialData?.aiModel || '')
  const [taskType, setTaskType] = useState<'summarize' | 'classify' | 'translate' | 'custom'>(initialData?.type || 'summarize')
  const [prompt, setPrompt] = useState(initialData?.prompt || '')
  const [inputText, setInputText] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)

  const models = {
    openai: [
      { label: 'GPT-3.5 Turbo (빠름)', value: 'gpt-3.5-turbo' },
      { label: 'GPT-4 (고급)', value: 'gpt-4' },
      { label: 'GPT-4 Turbo (최신)', value: 'gpt-4-turbo' },
    ],
    anthropic: [
      { label: 'Claude 3 Haiku (빠름)', value: 'claude-3-haiku' },
      { label: 'Claude 3 Sonnet (균형)', value: 'claude-3-sonnet' },
      { label: 'Claude 3 Opus (최고급)', value: 'claude-3-opus' },
    ],
  }

  const taskPrompts = {
    summarize: '다음 텍스트를 간결하게 요약해주세요.',
    classify: '다음 텍스트를 분석하고 분류해주세요.',
    translate: '다음 텍스트를 한국어로 번역해주세요.',
    custom: prompt || '다음 작업을 수행해주세요.',
  }

  const handleTestConnection = async () => {
    setIsConnected(null)
    try {
      const response = await axios.get('/api/v1/ai/test', {
        params: { provider },
      })
      setIsConnected(response.data.connected)
      if (response.data.connected) {
        toast.success(`${provider} 연결 성공!`)
      } else {
        toast.error(`${provider} 연결 실패`)
      }
    } catch (error) {
      setIsConnected(false)
      toast.error('연결 테스트 중 오류가 발생했습니다.')
    }
  }

  const handleRunAI = async () => {
    if (!inputText.trim()) {
      toast.error('입력 텍스트를 작성해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post('/api/v1/ai/execute', {
        provider,
        model,
        type: taskType,
        input: inputText,
        prompt: taskPrompts[taskType],
        options: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      })

      if (response.data.success) {
        setOutput(response.data.output)
        toast.success('AI 작업이 완료되었습니다!')
      } else {
        setOutput(`오류: ${response.data.error}`)
        toast.error('AI 작업이 실패했습니다.')
      }
    } catch (error) {
      console.error('AI execution error:', error)
      toast.error('AI 실행 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    const data = {
      aiProvider: provider,
      aiModel: model,
      type: taskType,
      prompt: taskPrompts[taskType],
    }
    onSave(data)
    toast.success('AI 노드 설정이 저장되었습니다!')
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="AI 설정" size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <span>공급자:</span>
            <Select
              value={provider}
              onChange={setProvider}
              style={{ width: 150 }}
              options={[
                { label: 'OpenAI', value: 'openai' },
                { label: 'Anthropic', value: 'anthropic' },
              ]}
            />
            <Button size="small" onClick={handleTestConnection}>
              연결 테스트
            </Button>
            {isConnected !== null && (
              <Tag icon={isConnected ? <CheckCircleOutlined /> : <CloseCircleOutlined />} color={isConnected ? 'success' : 'error'}>
                {isConnected ? '연결됨' : '연결 실패'}
              </Tag>
            )}
          </Space>

          <Space wrap>
            <span>모델:</span>
            <Select
              value={model}
              onChange={setModel}
              style={{ minWidth: 250 }}
              placeholder="모델을 선택하세요"
              options={models[provider]}
            />
          </Space>

          <Space wrap>
            <span>작업 유형:</span>
            <Select
              value={taskType}
              onChange={(value) => {
                setTaskType(value)
                if (value !== 'custom') {
                  setPrompt(taskPrompts[value])
                }
              }}
              style={{ width: 200 }}
              options={[
                { label: '요약', value: 'summarize' },
                { label: '분류', value: 'classify' },
                { label: '번역', value: 'translate' },
                { label: '사용자 정의', value: 'custom' },
              ]}
            />
          </Space>

          {taskType === 'custom' && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <span>프롬프트:</span>
              <Input.TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="사용자 정의 프롬프트를 입력하세요"
                rows={3}
              />
            </Space>
          )}
        </Space>
      </Card>

      <Card title="입력" size="small">
        <Input.TextArea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="AI로 처리할 텍스트를 입력하세요"
          rows={6}
        />
        <div style={{ marginTop: 8 }}>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={handleRunAI}
            loading={isLoading}
            disabled={!model || !inputText.trim()}
          >
            AI 실행
          </Button>
        </div>
      </Card>

      <Card title="결과" size="small">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>AI가 작업 중입니다...</div>
          </div>
        ) : output ? (
          <div>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto' }}>
              {output}
            </pre>
            <div style={{ marginTop: 12 }}>
              <Button type="primary" onClick={handleSave}>
                설정 저장
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
            AI 실행 결과가 여기에 표시됩니다.
          </div>
        )}
      </Card>
    </Space>
  )
}

export default AINodeEditor
