import { Node, Edge, XYPosition } from 'reactflow'

// Node Types
export type NodeType = 
  | 'trigger' 
  | 'action' 
  | 'logic' 
  | 'ai' 
  | 'code'

// Basic Node Data
export interface BaseNodeData {
  label: string
  description?: string
  config?: Record<string, any>
  status?: 'idle' | 'running' | 'success' | 'error'
}

// Trigger Node Data
export interface TriggerNodeData extends BaseNodeData {
  type: 'webhook' | 'schedule' | 'manual' | 'event'
  config: {
    schedule?: string
    event?: string
    webhookId?: string
  }
}

// Action Node Data
export interface ActionNodeData extends BaseNodeData {
  service: string // gmail, drive, slack, etc.
  action: string // send, upload, notify, etc.
  config: Record<string, any>
}

// Logic Node Data
export interface LogicNodeData extends BaseNodeData {
  logicType: 'if' | 'switch' | 'loop'
  condition?: string
  branches?: string[]
}

// AI Node Data
export interface AINodeData extends BaseNodeData {
  aiProvider: 'openai' | 'anthropic' | 'google'
  aiModel: string
  prompt?: string
  config: {
    provider?: 'openai' | 'anthropic' | 'google'
    model?: string
    temperature?: number
    maxTokens?: number
  }
}

// Code Node Data
export interface CodeNodeData extends BaseNodeData {
  language: 'python' | 'javascript'
  code: string
  packages?: string[]
  timeout?: number
  config: {
    packages: string[]
    timeout: number
  }
}

// Custom Nodes with proper typing
export interface CustomNode<T = any> extends Omit<Node, 'data'> {
  data: T
  type: NodeType
}

// Extended Edge with conditions
export interface CustomEdge extends Edge {
  condition?: string
  label?: string
}

// Workflow Definition
export interface WorkflowDefinition {
  id: string
  projectId: string
  name: string
  description?: string
  version: string
  status: 'draft' | 'active' | 'paused'
  nodes: CustomNode[]
  edges: CustomEdge[]
  metadata?: {
    createdAt: string
    updatedAt: string
    createdBy: string
  }
}

// Test Run Result
export interface TestRunResult {
  id: string
  workflowId: string
  status: 'running' | 'success' | 'error' | 'timeout'
  startedAt: string
  endedAt?: string
  input?: any
  output?: any
  logs: Array<{
    nodeId: string
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
    data?: any
  }>
  error?: {
    nodeId: string
    message: string
    stack?: string
  }
}

// Validation Errors
export interface ValidationError {
  type: 'node' | 'edge' | 'workflow'
  id: string
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Template Definition
export interface Template {
  id: string
  name: string
  category: 'mail' | 'file' | 'etl' | 'crawling' | 'ai' | 'hr' | 'finance' | 'collaboration'
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  prerequisites: string
  inputs: {
    name: string
    type: 'string' | 'number' | 'boolean' | 'object'
    required: boolean
    description?: string
  }[]
  outputs: {
    name: string
    type: string
    description?: string
  }[]
  nodes: CustomNode[]
  edges: CustomEdge[]
  roiHint?: string
  testCases?: string[]
}

export type NodeData = TriggerNodeData | ActionNodeData | LogicNodeData | AINodeData | CodeNodeData | BaseNodeData
