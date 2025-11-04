import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { Workflow } from './entities/workflow.entity'
import { Node } from './entities/node.entity'
import { Edge } from './entities/edge.entity'
import { Run } from './entities/run.entity'
import { CreateWorkflowDto } from './dto/create-workflow.dto'

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
    @InjectRepository(Edge)
    private edgeRepository: Repository<Edge>,
    @InjectRepository(Run)
    private runRepository: Repository<Run>,
  ) {}

  async create(createWorkflowDto: CreateWorkflowDto) {
    const workflow = new Workflow()
    workflow.id = uuidv4()
    workflow.name = createWorkflowDto.name
    workflow.description = createWorkflowDto.description
    workflow.version = createWorkflowDto.version
    workflow.status = 'draft'
    workflow.projectId = createWorkflowDto.project_id
    workflow.graphJson = createWorkflowDto.graph_json
    workflow.createdBy = 'system'

    const savedWorkflow = await this.workflowRepository.save(workflow)

    // Save nodes
    if (createWorkflowDto.graph_json.nodes?.length > 0) {
      const nodes = createWorkflowDto.graph_json.nodes.map((node) => {
        const newNode = new Node()
        newNode.id = node.id
        newNode.workflowId = savedWorkflow.id
        newNode.type = node.type
        newNode.position = node.position
        newNode.data = node.data
        return newNode
      })
      await this.nodeRepository.save(nodes)
    }

    // Save edges
    if (createWorkflowDto.graph_json.edges?.length > 0) {
      const edges = createWorkflowDto.graph_json.edges.map((edge) => {
        const newEdge = new Edge()
        newEdge.id = edge.id || uuidv4()
        newEdge.workflowId = savedWorkflow.id
        newEdge.source = edge.source
        newEdge.target = edge.target
        newEdge.label = edge.label
        newEdge.condition = edge.condition
        newEdge.sourceHandle = edge.sourceHandle
        newEdge.targetHandle = edge.targetHandle
        return newEdge
      })
      await this.edgeRepository.save(edges)
    }

    return { id: savedWorkflow.id }
  }

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {}
    const workflows = await this.workflowRepository.find({
      where,
      select: ['id', 'name', 'description', 'version', 'status', 'createdAt', 'updatedAt'],
      order: { updatedAt: 'DESC' },
    })
    return workflows
  }

  async findOne(id: string) {
    const workflow = await this.workflowRepository.findOne({
      where: { id },
      relations: ['nodes', 'edges'],
    })

    if (!workflow) {
      throw new NotFoundException(`워크플로우 ID ${id}를 찾을 수 없습니다.`)
    }

    return {
      ...workflow,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
    }
  }

  async update(id: string, updateWorkflowDto: Partial<CreateWorkflowDto>) {
    const workflow = await this.findOne(id)

    if (updateWorkflowDto.name) workflow.name = updateWorkflowDto.name
    if (updateWorkflowDto.description !== undefined) workflow.description = updateWorkflowDto.description
    if (updateWorkflowDto.graph_json) workflow.graphJson = updateWorkflowDto.graph_json

    await this.workflowRepository.save(workflow)

    // Update nodes
    if (updateWorkflowDto.graph_json) {
      await this.nodeRepository.delete({ workflowId: id })
      const nodes = updateWorkflowDto.graph_json.nodes.map((node) => {
        const newNode = new Node()
        newNode.id = node.id
        newNode.workflowId = id
        newNode.type = node.type
        newNode.position = node.position
        newNode.data = node.data
        return newNode
      })
      await this.nodeRepository.save(nodes)

      await this.edgeRepository.delete({ workflowId: id })
      const edges = updateWorkflowDto.graph_json.edges.map((edge) => {
        const newEdge = new Edge()
        newEdge.id = edge.id || uuidv4()
        newEdge.workflowId = id
        newEdge.source = edge.source
        newEdge.target = edge.target
        newEdge.label = edge.label
        newEdge.condition = edge.condition
        newEdge.sourceHandle = edge.sourceHandle
        newEdge.targetHandle = edge.targetHandle
        return newEdge
      })
      await this.edgeRepository.save(edges)
    }

    return { success: true }
  }

  async run(id: string, input?: any) {
    const workflow = await this.findOne(id)

    const run = new Run()
    run.id = uuidv4()
    run.workflowId = id
    run.status = 'running'
    run.input = input
    run.logs = []
    run.startedAt = new Date()

    const savedRun = await this.runRepository.save(run)

    // Simulate workflow execution
    setTimeout(async () => {
      try {
        const endTime = new Date()
        const duration = endTime.getTime() - savedRun.startedAt.getTime()

        savedRun.status = 'success'
        savedRun.endedAt = endTime
        savedRun.output = { result: '워크플로우가 성공적으로 실행되었습니다.' }
        savedRun.metrics = {
          duration,
          nodeMetrics: workflow.nodes.reduce((acc, node) => {
            acc[node.id] = { duration: Math.random() * 1000 }
            return acc
          }, {}),
        }

        await this.runRepository.save(savedRun)
      } catch (error) {
        savedRun.status = 'error'
        savedRun.endedAt = new Date()
        savedRun.error = {
          nodeId: 'unknown',
          message: error.message,
          stack: error.stack,
        }
        await this.runRepository.save(savedRun)
      }
    }, 2000)

    return { run_id: savedRun.id, status: 'running' }
  }

  async getRuns(workflowId: string) {
    const runs = await this.runRepository.find({
      where: { workflowId },
      order: { startedAt: 'DESC' },
    })

    return runs.map((run) => ({
      id: run.id,
      status: run.status,
      startedAt: run.startedAt,
      endedAt: run.endedAt,
      logs_url: `/api/v1/workflows/runs/${run.id}`,
    }))
  }

  async getRun(runId: string) {
    const run = await this.runRepository.findOne({
      where: { id: runId },
    })

    if (!run) {
      throw new NotFoundException(`실행 ID ${runId}를 찾을 수 없습니다.`)
    }

    return {
      id: run.id,
      status: run.status,
      startedAt: run.startedAt,
      endedAt: run.endedAt,
      input: run.input,
      output: run.output,
      logs: run.logs || [],
      error: run.error,
      metrics_json: run.metrics,
    }
  }
}
