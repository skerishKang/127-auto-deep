import React, { useCallback, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button, Card, Space, Tooltip } from 'antd'
import { PlayCircleOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons'
import { workflowStore } from '../stores/workflowStore'
import { validateWorkflow } from '../utils/validation'

// Custom Node Components
const TriggerNode = ({ data }: { data: any }) => (
  <Card size="small" style={{ background: '#e6f7ff', borderColor: '#1890ff' }}>
    <div style={{ fontWeight: 600 }}>{data.label}</div>
    <div style={{ fontSize: '12px', color: '#666' }}>{data.type}</div>
  </Card>
)

const ActionNode = ({ data }: { data: any }) => (
  <Card size="small" style={{ background: '#fff7e6', borderColor: '#fa8c16' }}>
    <div style={{ fontWeight: 600 }}>{data.label}</div>
    <div style={{ fontSize: '12px', color: '#666' }}>{data.service}.{data.action}</div>
  </Card>
)

const LogicNode = ({ data }: { data: any }) => (
  <Card size="small" style={{ background: '#fffbe6', borderColor: '#fadb14' }}>
    <div style={{ fontWeight: 600 }}>{data.label}</div>
    <div style={{ fontSize: '12px', color: '#666' }}>{data.logicType}</div>
  </Card>
)

const AINode = ({ data }: { data: any }) => (
  <Card size="small" style={{ background: '#f9f0ff', borderColor: '#722ed1' }}>
    <div style={{ fontWeight: 600 }}>{data.label}</div>
    <div style={{ fontSize: '12px', color: '#666' }}>{data.aiProvider}.{data.aiModel}</div>
  </Card>
)

const CodeNode = ({ data }: { data: any }) => (
  <Card size="small" style={{ background: '#f0f0f0', borderColor: '#8c8c8c' }}>
    <div style={{ fontWeight: 600 }}>{data.label}</div>
    <div style={{ fontSize: '12px', color: '#666' }}>{data.language}</div>
  </Card>
)

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  logic: LogicNode,
  ai: AINode,
  code: CodeNode,
}

const WorkflowCanvas: React.FC<{ workflowId?: string }> = ({ workflowId }) => {
  const { nodes, edges, saveWorkflow, testRunWorkflow } = workflowStore()
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const [localNodes, setLocalNodes, onNodesChangeHandler] = useNodesState(nodes)
  const [localEdges, setLocalEdges, onEdgesChangeHandler] = useEdgesState(edges)

  React.useEffect(() => {
    setLocalNodes(nodes)
    setLocalEdges(edges)
  }, [nodes, edges, setLocalNodes, setLocalEdges])

  const handleSave = async () => {
    const validation = validateWorkflow(localNodes, localEdges)
    if (!validation.isValid) {
      alert(`워크플로우 검증 실패: ${validation.errors.length}개 오류`)
      return
    }

    try {
      await saveWorkflow({
        id: workflowId || 'temp',
        nodes: localNodes,
        edges: localEdges,
        name: 'Untitled Workflow',
        projectId: 'default',
        version: 'v1',
        status: 'draft'
      })
      alert('워크플로우가 저장되었습니다!')
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
      console.error(error)
    }
  }

  const handleTestRun = async () => {
    try {
      await testRunWorkflow(workflowId || 'temp', {})
      alert('테스트 실행이 시작되었습니다!')
    } catch (error) {
      alert('테스트 실행 중 오류가 발생했습니다.')
      console.error(error)
    }
  }

  const handleAddNode = (type: string) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `${type} Node` },
    }
    setLocalNodes((nds) => [...nds, newNode])
  }

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #e8e8e8', borderRadius: '8px' }}>
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNode(node)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />

        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          <Card size="small">
            <Space>
              <Tooltip title="워크플로우 저장">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                >
                  저장
                </Button>
              </Tooltip>

              <Tooltip title="테스트 실행">
                <Button
                  icon={<PlayCircleOutlined />}
                  onClick={handleTestRun}
                  disabled={localNodes.length === 0}
                >
                  실행
                </Button>
              </Tooltip>
            </Space>
          </Card>
        </div>

        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
          <Card size="small" title="노드 추가">
            <Space wrap>
              <Button size="small" icon={<PlusOutlined />} onClick={() => handleAddNode('trigger')}>
                Trigger
              </Button>
              <Button size="small" icon={<PlusOutlined />} onClick={() => handleAddNode('action')}>
                Action
              </Button>
              <Button size="small" icon={<PlusOutlined />} onClick={() => handleAddNode('logic')}>
                Logic
              </Button>
              <Button size="small" icon={<PlusOutlined />} onClick={() => handleAddNode('ai')}>
                AI
              </Button>
              <Button size="small" icon={<PlusOutlined />} onClick={() => handleAddNode('code')}>
                Code
              </Button>
            </Space>
          </Card>
        </div>
      </ReactFlow>
    </div>
  )
}

export default WorkflowCanvas
