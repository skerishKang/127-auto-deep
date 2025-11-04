import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MonitoringService } from '../monitoring.service'
import { Run } from '../../workflows/entities/run.entity'
import { Workflow } from '../../workflows/entities/workflow.entity'

describe('MonitoringService', () => {
  let service: MonitoringService
  let runRepository: Repository<Run>
  let workflowRepository: Repository<Workflow>

  const mockWorkflow: Partial<Workflow> = {
    id: 'workflow-123',
    name: 'Test Workflow',
    description: 'A test workflow',
  }

  const mockRuns: Partial<Run>[] = [
    {
      id: 'run-1',
      workflowId: 'workflow-123',
      status: 'success',
      startedAt: new Date('2024-01-01T10:00:00Z'),
      endedAt: new Date('2024-01-01T10:01:00Z'),
    },
    {
      id: 'run-2',
      workflowId: 'workflow-123',
      status: 'success',
      startedAt: new Date('2024-01-01T11:00:00Z'),
      endedAt: new Date('2024-01-01T11:00:30Z'),
    },
    {
      id: 'run-3',
      workflowId: 'workflow-123',
      status: 'error',
      startedAt: new Date('2024-01-01T12:00:00Z'),
      endedAt: new Date('2024-01-01T12:00:45Z'),
    },
    {
      id: 'run-4',
      workflowId: 'workflow-456',
      status: 'success',
      startedAt: new Date('2024-01-02T10:00:00Z'),
      endedAt: new Date('2024-01-02T10:02:00Z'),
    },
  ]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        {
          provide: getRepositoryToken(Run),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              addGroupBy: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
              getRawOne: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Workflow),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<MonitoringService>(MonitoringService)
    runRepository = module.get<Repository<Run>>(getRepositoryToken(Run))
    workflowRepository = module.get<Repository<Workflow>>(getRepositoryToken(Workflow))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getWorkflowMetrics', () => {
    it('should return workflow metrics with correct calculations', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRuns),
      }

      jest.spyOn(runRepository, 'find').mockResolvedValue(mockRuns as Run[])

      const result = await service.getWorkflowMetrics('workflow-123')

      expect(result).toMatchObject({
        workflowId: 'workflow-123',
        totalRuns: 3,
        successRate: 66.67, // 2/3 * 100
      })
      expect(result.avgDuration).toBeCloseTo(45000, -2) // ~45 seconds average
    })

    it('should handle empty runs', async () => {
      jest.spyOn(runRepository, 'find').mockResolvedValue([])

      const result = await service.getWorkflowMetrics('workflow-999')

      expect(result.totalRuns).toBe(0)
      expect(result.successRate).toBe(0)
      expect(result.avgDuration).toBe(0)
    })

    it('should calculate P95 duration correctly', async () => {
      const manyRuns = Array.from({ length: 100 }, (_, i) => ({
        id: `run-${i}`,
        workflowId: 'workflow-123',
        status: 'success',
        startedAt: new Date(`2024-01-01T${10 + i}:00:00Z`),
        endedAt: new Date(`2024-01-01T${10 + i}:${i % 60}:00Z`),
      }))

      jest.spyOn(runRepository, 'find').mockResolvedValue(manyRuns as Run[])

      const result = await service.getWorkflowMetrics('workflow-123')

      expect(result.p95Duration).toBeDefined()
      expect(result.p95Duration).toBeGreaterThan(0)
    })

    it('should return top errors', async () => {
      const runsWithErrors = [
        ...mockRuns,
        {
          id: 'run-error-1',
          workflowId: 'workflow-123',
          status: 'error',
          startedAt: new Date('2024-01-01T13:00:00Z'),
          endedAt: new Date('2024-01-01T13:00:10Z'),
          error: { nodeId: 'node-1', message: 'Connection timeout' },
        },
        {
          id: 'run-error-2',
          workflowId: 'workflow-123',
          status: 'error',
          startedAt: new Date('2024-01-01T14:00:00Z'),
          endedAt: new Date('2024-01-01T14:00:10Z'),
          error: { nodeId: 'node-1', message: 'Connection timeout' },
        },
      ]

      jest.spyOn(runRepository, 'find').mockResolvedValue(runsWithErrors as Run[])

      const result = await service.getWorkflowMetrics('workflow-123')

      expect(result.topErrors).toHaveLength(1)
      expect(result.topErrors[0]).toMatchObject({
        message: 'Connection timeout',
        count: 2,
        percentage: 40, // 2/5 * 100
      })
    })
  })

  describe('getSystemMetrics', () => {
    it('should return system metrics with correct calculations', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '2' }),
      }

      jest.spyOn(runRepository, 'find').mockResolvedValue(mockRuns as Run[])

      const result = await service.getSystemMetrics()

      expect(result.activeWorkflows).toBe(2)
      expect(result.totalRuns24h).toBe(mockRuns.length)
      expect(result.avgSuccessRate).toBeCloseTo(75, 1) // 3/4 * 100
      expect(result.avgDuration).toBeGreaterThan(0)
      expect(result.alerts).toBeDefined()
    })

    it('should generate alert for low success rate', async () => {
      const lowSuccessRuns = [
        {
          id: 'run-1',
          workflowId: 'workflow-123',
          status: 'error',
          startedAt: new Date(),
          endedAt: new Date(Date.now() + 1000),
        },
      ]

      jest.spyOn(runRepository, 'find').mockResolvedValue(lowSuccessRuns as Run[])

      const result = await service.getSystemMetrics()

      expect(result.alerts).toContainEqual(
        expect.objectContaining({
          type: 'high_failure_rate',
        })
      )
    })

    it('should generate alert for slow execution', async () => {
      const slowRuns = [
        {
          id: 'run-1',
          workflowId: 'workflow-123',
          status: 'success',
          startedAt: new Date(Date.now() - 300000), // 5 minutes ago
          endedAt: new Date(), // now
        },
      ]

      jest.spyOn(runRepository, 'find').mockResolvedValue(slowRuns as Run[])

      const result = await service.getSystemMetrics()

      expect(result.alerts).toContainEqual(
        expect.objectContaining({
          type: 'slow_execution',
        })
      )
    })
  })

  describe('getWorkflowList', () => {
    it('should return workflow list with actual names', async () => {
      const mockRawResults = [
        {
          workflowId: 'workflow-123',
          name: 'Test Workflow',
          totalRuns: '3',
          successRate: '66.67',
          avgDuration: '45.5',
        },
        {
          workflowId: 'workflow-456',
          name: 'Another Workflow',
          totalRuns: '1',
          successRate: '100',
          avgDuration: '120',
        },
      ]

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawResults),
      }

      jest.spyOn(runRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any)

      const result = await service.getWorkflowList()

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        workflowId: 'workflow-123',
        name: 'Test Workflow',
        totalRuns: 3,
        successRate: 66.67,
        avgDuration: 45500, // 45.5 seconds * 1000
      })
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('run.workflow', 'workflow')
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('workflow.name', 'name')
    })

    it('should use fallback name when workflow name is null', async () => {
      const mockRawResults = [
        {
          workflowId: 'workflow-999',
          name: null,
          totalRuns: '1',
          successRate: '100',
          avgDuration: '30',
        },
      ]

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawResults),
      }

      jest.spyOn(runRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any)

      const result = await service.getWorkflowList()

      expect(result[0].name).toMatch(/^Workflow/)
      expect(result[0].name).toContain('workflow-999')
    })
  })

  describe('getRunHistory', () => {
    it('should return run history for a workflow', async () => {
      jest.spyOn(runRepository, 'find').mockResolvedValue(mockRuns as Run[])

      const result = await service.getRunHistory('workflow-123', 10)

      expect(result).toEqual(mockRuns)
      expect(runRepository.find).toHaveBeenCalledWith({
        where: { workflowId: 'workflow-123' },
        order: { startedAt: 'DESC' },
        take: 10,
      })
    })

    it('should use default limit when not specified', async () => {
      jest.spyOn(runRepository, 'find').mockResolvedValue(mockRuns as Run[])

      await service.getRunHistory('workflow-123')

      expect(runRepository.find).toHaveBeenCalledWith({
        where: { workflowId: 'workflow-123' },
        order: { startedAt: 'DESC' },
        take: 50,
      })
    })
  })

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      jest.spyOn(runRepository, 'find').mockRejectedValue(new Error('Database error'))

      await expect(service.getWorkflowMetrics('workflow-123')).rejects.toThrow('Database error')
    })
  })
})
