import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { Run } from '../workflows/entities/run.entity'
import { Workflow } from '../workflows/entities/workflow.entity'

export interface InternalWorkflowMetrics {
  workflowId: string
  totalRuns: number
  successRate: number
  avgDuration: number
  p95Duration: number
  topErrors: Array<{
    message: string
    count: number
    percentage: number
  }>
  dailyStats: Array<{
    date: string
    total: number
    success: number
    failed: number
  }>
}

export interface InternalSystemMetrics {
  activeWorkflows: number
  totalRuns24h: number
  avgSuccessRate: number
  avgDuration: number
  alerts: Array<{
    type: 'high_failure_rate' | 'slow_execution' | 'cost_spike'
    message: string
    value: number
    threshold: number
    timestamp: string
  }>
}

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(Run)
    private runRepository: Repository<Run>,
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
  ) {}

  async getWorkflowMetrics(workflowId: string): Promise<InternalWorkflowMetrics> {
    const runs = await this.runRepository.find({
      where: { workflowId },
      order: { startedAt: 'DESC' },
      take: 100,
    })

    const totalRuns = runs.length
    const successRuns = runs.filter((run) => run.status === 'success').length
    const successRate = totalRuns > 0 ? (successRuns / totalRuns) * 100 : 0

    const durations = runs
      .filter((run) => run.endedAt)
      .map((run) => run.endedAt!.getTime() - run.startedAt.getTime())
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0

    const sortedDurations = durations.sort((a, b) => a - b)
    const p95Index = Math.floor(sortedDurations.length * 0.95)
    const p95Duration = sortedDurations[p95Index] || 0

    const errors = runs
      .filter((run) => run.error)
      .reduce((acc, run) => {
        const message = run.error!.message
        acc[message] = (acc[message] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const topErrors = Object.entries(errors)
      .map(([message, count]) => ({
        message,
        count,
        percentage: totalRuns > 0 ? (count / totalRuns) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate daily stats for last 7 days
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayRuns = runs.filter(
        (run) =>
          run.startedAt >= date && run.startedAt < nextDate
      )

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        total: dayRuns.length,
        success: dayRuns.filter((run) => run.status === 'success').length,
        failed: dayRuns.filter((run) => run.status === 'error').length,
      })
    }

    return {
      workflowId,
      totalRuns,
      successRate,
      avgDuration,
      p95Duration,
      topErrors,
      dailyStats,
    }
  }

  async getSystemMetrics(): Promise<InternalSystemMetrics> {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const runs24h = await this.runRepository.find({
      where: {
        startedAt: Between(yesterday, now),
      },
    })

    const activeWorkflows = await this.runRepository
      .createQueryBuilder('run')
      .select('COUNT(DISTINCT run.workflowId)', 'count')
      .where('run.startedAt >= :yesterday', { yesterday })
      .getRawOne()

    const totalRuns24h = runs24h.length
    const successRuns24h = runs24h.filter((run) => run.status === 'success').length
    const avgSuccessRate = totalRuns24h > 0
      ? (successRuns24h / totalRuns24h) * 100
      : 0

    const durations = runs24h
      .filter((run) => run.endedAt)
      .map((run) => run.endedAt!.getTime() - run.startedAt.getTime())
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0

    // Generate alerts based on metrics
    const alerts = []

    if (avgSuccessRate < 95) {
      alerts.push({
        type: 'high_failure_rate',
        message: `Average success rate is ${avgSuccessRate.toFixed(1)}% (below 95% threshold)`,
        value: avgSuccessRate,
        threshold: 95,
        timestamp: now.toISOString(),
      })
    }

    if (avgDuration > 180000) { // 3 minutes in milliseconds
      alerts.push({
        type: 'slow_execution',
        message: `Average execution time is ${(avgDuration / 1000).toFixed(1)}s (above 180s threshold)`,
        value: avgDuration,
        threshold: 180000,
        timestamp: now.toISOString(),
      })
    }

    return {
      activeWorkflows: parseInt(activeWorkflows.count) || 0,
      totalRuns24h,
      avgSuccessRate,
      avgDuration,
      alerts,
    }
  }

  async getWorkflowList(): Promise<Array<{
    workflowId: string
    name: string
    totalRuns: number
    successRate: number
    avgDuration: number
  }>> {
    const runs = await this.runRepository
      .createQueryBuilder('run')
      .leftJoin('run.workflow', 'workflow')
      .select('run.workflowId', 'workflowId')
      .addSelect('workflow.name', 'name')
      .addSelect('COUNT(*)', 'totalRuns')
      .addSelect(
        'AVG(CASE WHEN run.status = \'success\' THEN 1 ELSE 0 END) * 100',
        'successRate',
      )
      .addSelect(
        'AVG(EXTRACT(EPOCH FROM (run.endedAt - run.startedAt)))',
        'avgDuration',
      )
      .where('run.endedAt IS NOT NULL')
      .groupBy('run.workflowId')
      .addGroupBy('workflow.name')
      .orderBy('totalRuns', 'DESC')
      .limit(50)
      .getRawMany()

    return runs.map((run) => ({
      workflowId: run.workflowId,
      name: run.name || `Workflow ${run.workflowId.substring(0, 8)}`,
      totalRuns: parseInt(run.totalRuns),
      successRate: parseFloat(run.successRate),
      avgDuration: parseFloat(run.avgDuration) * 1000, // Convert to milliseconds
    }))
  }

  async getRunHistory(workflowId: string, limit = 50): Promise<Run[]> {
    return this.runRepository.find({
      where: { workflowId },
      order: { startedAt: 'DESC' },
      take: limit,
    })
  }
}
