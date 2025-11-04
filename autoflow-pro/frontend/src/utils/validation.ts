import { Node, Edge } from 'reactflow'
import { ValidationResult, ValidationError } from '../types/workflow'

export function validateWorkflow(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: ValidationError[] = []

  // Check if there are any nodes
  if (nodes.length === 0) {
    errors.push({
      type: 'workflow',
      id: 'workflow',
      field: 'nodes',
      message: '워크플로우에 최소 하나의 노드가 필요합니다.',
    })
  }

  // Check for trigger nodes
  const triggerNodes = nodes.filter((node) => node.type === 'trigger')
  if (triggerNodes.length === 0) {
    errors.push({
      type: 'workflow',
      id: 'workflow',
      field: 'trigger',
      message: '워크플로우에 적어도 하나의 Trigger 노드가 필요합니다.',
    })
  }

  if (triggerNodes.length > 1) {
    errors.push({
      type: 'workflow',
      id: 'workflow',
      field: 'trigger',
      message: '하나 이상의 Trigger 노드가 발견되었습니다. 하나의 Trigger만 허용됩니다.',
    })
  }

  // Check for orphaned nodes (nodes with no connections)
  nodes.forEach((node) => {
    const hasIncoming = edges.some((edge) => edge.target === node.id)
    const hasOutgoing = edges.some((edge) => edge.source === node.id)

    // First node should have outgoing edges
    if (node.type === 'trigger' && !hasOutgoing) {
      errors.push({
        type: 'node',
        id: node.id,
        field: 'connections',
        message: `Trigger 노드는 적어도 하나의 outgoing 연결이 필요합니다.`,
      })
    }

    // Non-trigger nodes should have at least one incoming edge
    if (node.type !== 'trigger' && !hasIncoming) {
      errors.push({
        type: 'node',
        id: node.id,
        field: 'connections',
        message: `노드는 적어도 하나의 incoming 연결이 필요합니다.`,
      })
    }
  })

  // Check for valid edges
  edges.forEach((edge) => {
    if (!edge.source || !edge.target) {
      errors.push({
        type: 'edge',
        id: edge.id || 'unknown',
        field: 'connections',
        message: '엣지는 source와 target이 모두 필요합니다.',
      })
    }

    // Check if source and target nodes exist
    const sourceNode = nodes.find((node) => node.id === edge.source)
    const targetNode = nodes.find((node) => node.id === edge.target)

    if (!sourceNode) {
      errors.push({
        type: 'edge',
        id: edge.id || 'unknown',
        field: 'source',
        message: `소스 노드 '${edge.source}'를 찾을 수 없습니다.`,
      })
    }

    if (!targetNode) {
      errors.push({
        type: 'edge',
        id: edge.id || 'unknown',
        field: 'target',
        message: `타겟 노드 '${edge.target}'를 찾을 수 없습니다.`,
      })
    }
  })

  // Check for circular dependencies
  if (hasCircularDependency(nodes, edges)) {
    errors.push({
      type: 'workflow',
      id: 'workflow',
      field: 'dependencies',
      message: '순환 의존성이 발견되었습니다. 워크플로우는 DAG(비순환 그래프)이어야 합니다.',
    })
  }

  // Validate node configurations
  nodes.forEach((node) => {
    if (node.type === 'trigger' && !node.data?.type) {
      errors.push({
        type: 'node',
        id: node.id,
        field: 'config',
        message: 'Trigger 노드는 타입 설정이 필요합니다.',
      })
    }

    if (node.type === 'code' && !node.data?.code) {
      errors.push({
        type: 'node',
        id: node.id,
        field: 'config',
        message: 'Code 노드는 코드 입력이 필요합니다.',
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function hasCircularDependency(nodes: Node[], edges: Edge[]): boolean {
  const graph = new Map<string, string[]>()

  // Build adjacency list
  nodes.forEach((node) => {
    graph.set(node.id, [])
  })

  edges.forEach((edge) => {
    if (graph.has(edge.source)) {
      graph.get(edge.source)!.push(edge.target)
    }
  })

  // DFS to detect cycle
  const visited = new Set<string>()
  const recStack = new Set<string>()

  function hasCycle(nodeId: string): boolean {
    if (recStack.has(nodeId)) {
      return true // Cycle found
    }

    if (visited.has(nodeId)) {
      return false
    }

    visited.add(nodeId)
    recStack.add(nodeId)

    const neighbors = graph.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) {
        return true
      }
    }

    recStack.delete(nodeId)
    return false
  }

  for (const nodeId of graph.keys()) {
    if (hasCycle(nodeId)) {
      return true
    }
  }

  return false
}

export function validateNodeConfiguration(node: Node): ValidationError[] {
  const errors: ValidationError[] = []

  if (!node.data?.label) {
    errors.push({
      type: 'node',
      id: node.id,
      field: 'label',
      message: '노드 라벨이 필요합니다.',
    })
  }

  return errors
}
