import { Injectable } from '@nestjs/common'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export interface AITask {
  type: 'summarize' | 'classify' | 'translate' | 'custom'
  input: string
  prompt?: string
  provider: 'openai' | 'anthropic'
  model?: string
  options?: {
    temperature?: number
    maxTokens?: number
  }
}

export interface AIResponse {
  success: boolean
  output: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
}

@Injectable()
export class AIService {
  private openai: OpenAI
  private anthropic: Anthropic

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async executeTask(task: AITask): Promise<AIResponse> {
    const maxRetries = 3
    let lastError: Error | null = null

    // Retry with exponential backoff
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        let result: string
        let model = task.model || this.getDefaultModel(task.provider)

        if (task.provider === 'openai') {
          result = await this.executeOpenAI(task, model)
        } else {
          result = await this.executeAnthropic(task, model)
        }

        return {
          success: true,
          output: result,
          model,
        }
      } catch (error) {
        console.error(`AI execution attempt ${attempt + 1} failed:`, error)
        lastError = error as Error

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000)
        }
      }
    }

    // All retries failed
    return {
      success: false,
      output: '',
      model: task.model || this.getDefaultModel(task.provider),
      error: lastError?.message || 'Unknown error',
    }
  }

  private async executeOpenAI(task: AITask, model: string): Promise<string> {
    const prompt = this.buildPrompt(task)

    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: task.options?.temperature || 0.7,
      max_tokens: task.options?.maxTokens || 1000,
    })

    return response.choices[0]?.message?.content || ''
  }

  private async executeAnthropic(task: AITask, model: string): Promise<string> {
    const prompt = this.buildPrompt(task)

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: task.options?.maxTokens || 1000,
      temperature: task.options?.temperature || 0.7,
      messages: [
        { role: 'user', content: prompt },
      ],
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }

    return ''
  }

  private buildPrompt(task: AITask): string {
    switch (task.type) {
      case 'summarize':
        return `다음 텍스트를 간결하게 요약해주세요:\n\n${task.input}`

      case 'classify':
        return `다음 텍스트를 분석하고 분류해주세요:\n\n${task.input}\n\n결과는 간단하게 요약해주세요.`

      case 'translate':
        return `다음 텍스트를 한국어로 번역해주세요:\n\n${task.input}`

      case 'custom':
        return task.prompt ? `${task.prompt}\n\n${task.input}` : task.input

      default:
        return task.input
    }
  }

  private getDefaultModel(provider: 'openai' | 'anthropic'): string {
    return provider === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-haiku'
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async testConnection(provider: 'openai' | 'anthropic'): Promise<boolean> {
    try {
      const task: AITask = {
        type: 'custom',
        input: 'Hello',
        prompt: 'Reply with "OK"',
        provider,
      }

      const response = await this.executeTask(task)
      return response.success
    } catch (error) {
      console.error(`${provider} connection test failed:`, error)
      return false
    }
  }

  getAvailableModels(provider: 'openai' | 'anthropic'): string[] {
    if (provider === 'openai') {
      return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
    } else {
      return ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus']
    }
  }
}
