import { create } from 'zustand'
import { Node, Edge } from 'reactflow'
import axios from 'axios'
import toast from 'react-hot-toast'
import { WorkflowDefinition } from '../types/workflow'

interface WorkflowState {
  workflows: WorkflowDefinition[]
  currentWorkflow: WorkflowDefinition | null
  nodes: Node[]
  edges: Edge[]
  isLoading: boolean

  // Actions
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  loadWorkflow: (id: string) => Promise<void>
  saveWorkflow: (workflow: WorkflowDefinition) => Promise<void>
  testRunWorkflow: (id: string, input: any) => Promise<void>
  createWorkflow: (name: string, projectId: string) => Promise<void>
}

export const workflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  nodes: [],
  edges: [],
  isLoading: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  loadWorkflow: async (id: string) => {
    set({ isLoading: true })
    try {
      const response = await axios.get(`/api/v1/workflows/${id}`)
      const workflow = response.data

      set({
        currentWorkflow: workflow,
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load workflow:', error)
      set({ isLoading: false })
      throw error
    }
  },

  saveWorkflow: async (workflow: WorkflowDefinition) => {
    try {
      const isNew = !workflow.id || workflow.id === 'temp'

      if (isNew) {
        const response = await axios.post('/api/v1/workflows', {
          name: workflow.name,
          project_id: workflow.projectId,
          graph_json: {
            nodes: workflow.nodes,
            edges: workflow.edges,
          },
        })

        const savedWorkflow = { ...workflow, id: response.data.id }
        set((state) => ({
          workflows: [...state.workflows, savedWorkflow],
          currentWorkflow: savedWorkflow,
        }))

        toast.success('워크플로우가 생성되었습니다!')
      } else {
        await axios.put(`/api/v1/workflows/${workflow.id}`, {
          name: workflow.name,
          graph_json: {
            nodes: workflow.nodes,
            edges: workflow.edges,
          },
        })

        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflow.id ? workflow : w
          ),
          currentWorkflow: workflow,
        }))

        toast.success('워크플로우가 저장되었습니다!')
      }
    } catch (error) {
      console.error('Failed to save workflow:', error)
      toast.error('저장 중 오류가 발생했습니다.')
      throw error
    }
  },

  testRunWorkflow: async (id: string, input: any) => {
    try {
      const response = await axios.post(`/api/v1/workflows/${id}:run`, {
        input_json: input,
      })

      const runId = response.data.run_id
      toast.success('테스트 실행이 시작되었습니다!')

      // Listen for run completion via WebSocket
      // This will be implemented in SP-02

      return runId
    } catch (error) {
      console.error('Failed to start test run:', error)
      toast.error('테스트 실행 시작에 실패했습니다.')
      throw error
    }
  },

  createWorkflow: async (name: string, projectId: string) => {
    try {
      const response = await axios.post('/api/v1/workflows', {
        name,
        project_id: projectId,
        graph_json: { nodes: [], edges: [] },
      })

      const newWorkflow: WorkflowDefinition = {
        id: response.data.id,
        name,
        projectId,
        version: 'v1',
        status: 'draft',
        nodes: [],
        edges: [],
      }

      set((state) => ({
        workflows: [...state.workflows, newWorkflow],
        currentWorkflow: newWorkflow,
        nodes: [],
        edges: [],
      }))

      toast.success('새 워크플로우가 생성되었습니다!')
      return newWorkflow
    } catch (error) {
      console.error('Failed to create workflow:', error)
      toast.error('워크플로우 생성에 실패했습니다.')
      throw error
    }
  },
}))
