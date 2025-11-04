import React, { useState } from 'react'
import { Button, Card, List, Space, Typography, Modal, Input } from 'antd'
import { PlusOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons'
import { workflowStore } from '../stores/workflowStore'
import WorkflowCanvas from '../components/WorkflowCanvas'

const { Title, Text } = Typography

const WorkflowPage: React.FC = () => {
  const { workflows, currentWorkflow, createWorkflow } = workflowStore()
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [newWorkflowName, setNewWorkflowName] = useState('')

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) return

    try {
      await createWorkflow(newWorkflowName, 'default')
      setNewWorkflowName('')
      setIsCreateModalVisible(false)
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>워크플로우</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
        >
          새 워크플로우
        </Button>
      </div>

      {!currentWorkflow ? (
        <Card>
          <Title level={4}>워크플로우를 선택하거나 새로 만드세요</Title>
          <List
            bordered
            dataSource={workflows}
            renderItem={(workflow) => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => workflowStore.getState().loadWorkflow(workflow.id)}
              >
                <List.Item.Meta
                  avatar={<FileOutlined />}
                  title={workflow.name}
                  description={`${workflow.version} • ${workflow.status}`}
                />
              </List.Item>
            )}
          />
        </Card>
      ) : (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <Space>
              <Text strong>{currentWorkflow.name}</Text>
              <Text type="secondary">v{currentWorkflow.version}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{currentWorkflow.status}</Text>
            </Space>
          </Card>

          <WorkflowCanvas workflowId={currentWorkflow.id} />
        </div>
      )}

      <Modal
        title="새 워크플로우 생성"
        open={isCreateModalVisible}
        onOk={handleCreateWorkflow}
        onCancel={() => setIsCreateModalVisible(false)}
        okButtonProps={{ disabled: !newWorkflowName.trim() }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>워크플로우 이름을 입력하세요:</Text>
          <Input
            placeholder="예: 이메일 자동화 워크플로우"
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
            onPressEnter={handleCreateWorkflow}
            autoFocus
          />
        </Space>
      </Modal>
    </div>
  )
}

export default WorkflowPage
