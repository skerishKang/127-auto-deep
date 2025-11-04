import { Test, TestingModule } from '@nestjs/testing'
import { MonitoringController } from '../monitoring.controller'
import { MonitoringService } from '../monitoring.service'

describe('MonitoringController', () => {
  let controller: MonitoringController
  let service: MonitoringService

  const mockWorkflowMetrics = {
    workflowId: 'workflow-123',
    totalRuns: 100,
    successRate: 95.5,
    avgDuration: 30000,
    p95Duration: 45000,
    topErrors: [
      {
        message: 'Test error',
        count: 5,
        percentage: 5,
      },
    ],
    dailyStats: [
      {
        date: '2024-01-01',
        total: 10,
        success: 9,
        failed: 1,
      },
    ],
  }

  const mockSystemMetrics = {
    activeWorkflows: 5,
    totalRuns24h: 500,
    avgSuccessRate: 92.5,
    avgDuration: 35000,
    alerts: [
      {
        type: 'high_failure_rate',
        message: 'Average success rate is 90% (below 95% threshold)',
        value: 90,
        threshold: 95,
        timestamp: new Date().toISOString(),
      },
    ],
  }

  const mockWorkflowList = [
    {
      workflowId: 'workflow-123',
      name: 'Test Workflow',
      totalRuns: 100,
      successRate: 95.5,
      avgDuration: 30000,
    },
    {
      workflowId: 'workflow-456',
      name: 'Another Workflow',
      totalRuns: 50,
      successRate: 88.0,
      avgDuration: 45000,
    },
  ]

  const mockRunHistory = [
    {
      id: 'run-1',
      workflowId: 'workflow-123',
      status: 'success',
      startedAt: new Date('2024-01-01T10:00:00Z'),
      endedAt: new Date('2024-01-01T10:01:00Z'),
    },
  ]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [
        {
          provide: MonitoringService,
          useValue: {
            getWorkflowMetrics: jest.fn().mockResolvedValue(mockWorkflowMetrics),
            getSystemMetrics: jest.fn().mockResolvedValue(mockSystemMetrics),
            getWorkflowList: jest.fn().mockResolvedValue(mockWorkflowList),
            getRunHistory: jest.fn().mockResolvedValue(mockRunHistory),
          },
        },
      ],
    }).compile()

    controller = module.get<MonitoringController>(MonitoringController)
    service = module.get<MonitoringService>(MonitoringService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getWorkflowMetrics', () => {
    it('should return workflow metrics for a specific workflow', async () => {
      const workflowId = 'workflow-123'
      const result = await controller.getWorkflowMetrics(workflowId)

      expect(service.getWorkflowMetrics).toHaveBeenCalledWith(workflowId)
      expect(result).toEqual(mockWorkflowMetrics)
    })
  })

  describe('getSystemMetrics', () => {
    it('should return system metrics', async () => {
      const result = await controller.getSystemMetrics()

      expect(service.getSystemMetrics).toHaveBeenCalled()
      expect(result).toEqual(mockSystemMetrics)
    })
  })

  describe('getWorkflowList', () => {
    it('should return list of workflows with metrics', async () => {
      const result = await controller.getWorkflowList()

      expect(service.getWorkflowList).toHaveBeenCalled()
      expect(result).toEqual(mockWorkflowList)
    })
  })

  describe('getRunHistory', () => {
    it('should return run history with default limit', async () => {
      const workflowId = 'workflow-123'
      const result = await controller.getRunHistory(workflowId)

      expect(service.getRunHistory).toHaveBeenCalledWith(workflowId, 50)
      expect(result).toEqual(mockRunHistory)
    })

    it('should return run history with custom limit', async () => {
      const workflowId = 'workflow-123'
      const limit = '100'
      const result = await controller.getRunHistory(workflowId, limit)

      expect(service.getRunHistory).toHaveBeenCalledWith(workflowId, 100)
      expect(result).toEqual(mockRunHistory)
    })

    it('should parse string limit to number', async () => {
      const workflowId = 'workflow-123'
      const limit = '25'
      const result = await controller.getRunHistory(workflowId, limit)

      expect(service.getRunHistory).toHaveBeenCalledWith(workflowId, 25)
    })
  })
})
