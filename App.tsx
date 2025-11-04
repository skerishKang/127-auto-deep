import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import WorkspacePage from './pages/WorkspacePage'
import WorkflowPage from './pages/WorkflowPage'
import CodeEditorPage from './pages/CodeEditorPage'
import AINodePage from './pages/AINodePage'
import TemplatesPage from './pages/TemplatesPage'
import MonitoringPage from './pages/MonitoringPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

const { Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, color: '#722ed1', fontSize: '24px', fontWeight: 600 }}>
            AutoFlow Pro
          </h1>
          <div style={{ color: '#666' }}>
            지능형 업무 자동화 플랫폼
          </div>
        </div>
      </Layout.Header>
      
      <Layout>
        <Layout.Sider 
          width={240} 
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
        >
          <nav style={{ padding: '16px 0' }}>
            <a href="/workspace" style={{ display: 'block', padding: '12px 24px', color: '#333' }}>
              워크스페이스
            </a>
            <a href="/workflows" style={{ display: 'block', padding: '12px 24px', color: '#333' }}>
              워크플로우
            </a>
            <a href="/code-editor" style={{ display: 'block', padding: '12px 24px', color: '#333' }}>
              코드 실행기
            </a>
            <a href="/ai-node" style={{ display: 'block', padding: '12px 24px', color: '#333', background: '#f9f0ff', fontWeight: 600 }}>
              🤖 AI 노드
            </a>
            <a href="/templates" style={{ display: 'block', padding: '12px 24px', color: '#333' }}>
              템플릿
            </a>
            <a href="/monitoring" style={{ display: 'block', padding: '12px 24px', color: '#333' }}>
              모니터링
            </a>
            <a href="/settings" style={{ display: 'block', padding: '12px 24px', color: '#333' }}>
              설정
            </a>
          </nav>
        </Layout.Sider>
        
        <Layout.Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/workspace" replace />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/workflows" element={<WorkflowPage />} />
            <Route path="/code-editor" element={<CodeEditorPage />} />
            <Route path="/ai-node" element={<AINodePage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default App
