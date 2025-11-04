import { Injectable } from '@nestjs/common'

export interface Template {
  id: string
  name: string
  category: 'mail' | 'file' | 'etl' | 'crawling' | 'ai' | 'hr' | 'finance' | 'collaboration'
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  prerequisites: string
  inputs: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'object'
    required: boolean
    description?: string
  }>
  outputs: Array<{
    name: string
    type: string
    description?: string
  }>
  nodes: any[]
  edges: any[]
  roiHint?: string
  testCases?: string[]
}

@Injectable()
export class TemplateService {
  private templates: Template[] = [
    {
      id: 'mail-attachment-save',
      name: '메일 첨부 자동 저장/분류',
      category: 'mail',
      difficulty: 'easy',
      description: 'Gmail에서 첨부파일을 자동 다운로드하고 Google Drive에 저장합니다.',
      prerequisites: 'Gmail/Drive OAuth, 폴더ID',
      inputs: [
        { name: 'label', type: 'string', required: true, description: 'Gmail 라벨' },
        { name: 'ext_filter', type: 'string', required: false, description: '파일 확장자 필터' },
        { name: 'date_range', type: 'string', required: false, description: '날짜 범위' },
        { name: 'dest_folder_id', type: 'string', required: true, description: '저장할 폴더 ID' },
        { name: 'sheet_id', type: 'string', required: false, description: '로그 기록 시트 ID' },
      ],
      outputs: [
        { name: 'drive_path', type: 'string', description: '저장된 파일 경로' },
        { name: 'sheet_row_id', type: 'string', description: '시트 행 ID' },
      ],
      nodes: [
        {
          id: 'gmail-trigger',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { label: 'Gmail Trigger', type: 'event' },
        },
        {
          id: 'if-filter',
          type: 'logic',
          position: { x: 200, y: 0 },
          data: { label: '라벨/확장자 필터', logicType: 'if' },
        },
        {
          id: 'drive-upload',
          type: 'action',
          position: { x: 400, y: 0 },
          data: { label: 'Drive Upload', service: 'drive', action: 'upload' },
        },
        {
          id: 'sheets-append',
          type: 'action',
          position: { x: 600, y: 0 },
          data: { label: 'Sheet 기록', service: 'sheets', action: 'append' },
        },
      ],
      edges: [
        { id: 'e1', source: 'gmail-trigger', target: 'if-filter' },
        { id: 'e2', source: 'if-filter', target: 'drive-upload' },
        { id: 'e3', source: 'drive-upload', target: 'sheets-append' },
      ],
      roiHint: '반복 다운로드 2h/주 절감',
      testCases: ['샘플5건 E2E 100%'],
    },
    {
      id: 'meeting-summary-email',
      name: '회의록 요약→메일',
      category: 'collaboration',
      difficulty: 'easy',
      description: 'Gmail에서 회의 관련 메일을 수집하고 AI로 요약해서 발송합니다.',
      prerequisites: 'Gmail OAuth, LLM 키',
      inputs: [
        { name: 'sender_filter', type: 'string', required: false, description: '발신자 필터' },
        { name: 'period', type: 'string', required: false, description: '조회 기간' },
        { name: 'tone', type: 'string', required: false, description: '요약 톤' },
        { name: 'recipients', type: 'object', required: true, description: '수신자 목록' },
      ],
      outputs: [
        { name: 'summary_email_id', type: 'string', description: '요약 메일 ID' },
      ],
      nodes: [
        {
          id: 'gmail-search',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { label: 'Gmail 검색', type: 'schedule' },
        },
        {
          id: 'ai-summarize',
          type: 'ai',
          position: { x: 200, y: 0 },
          data: { label: 'AI 요약', aiProvider: 'openai', aiModel: 'gpt-3.5-turbo' },
        },
        {
          id: 'gmail-send',
          type: 'action',
          position: { x: 400, y: 0 },
          data: { label: '요약 메일 발송', service: 'gmail', action: 'send' },
        },
      ],
      edges: [
        { id: 'e1', source: 'gmail-search', target: 'ai-summarize' },
        { id: 'e2', source: 'ai-summarize', target: 'gmail-send' },
      ],
      roiHint: '의사결정 속도↑',
      testCases: ['실패율<2% 재시도'],
    },
    {
      id: 'excel-merge-master',
      name: '엑셀 병합→Master',
      category: 'etl',
      difficulty: 'medium',
      description: '여러 엑셀 파일의 데이터를 하나의 Master 시트로 통합합니다.',
      prerequisites: 'Sheets API, 폴더ID',
      inputs: [
        { name: 'folder_id', type: 'string', required: true, description: '폴더 ID' },
        { name: 'sheet_range', type: 'string', required: false, description: '시트 범위' },
        { name: 'master_sheet_id', type: 'string', required: true, description: 'Master 시트 ID' },
      ],
      outputs: [
        { name: 'master_sheet_id', type: 'string', description: '통합된 시트 ID' },
      ],
      nodes: [
        {
          id: 'drive-list',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { label: 'Drive 파일 목록', type: 'schedule' },
        },
        {
          id: 'loop-files',
          type: 'logic',
          position: { x: 200, y: 0 },
          data: { label: '파일 순회', logicType: 'loop' },
        },
        {
          id: 'sheets-read',
          type: 'action',
          position: { x: 400, y: 0 },
          data: { label: '시트 읽기', service: 'sheets', action: 'read' },
        },
        {
          id: 'transform',
          type: 'code',
          position: { x: 600, y: 0 },
          data: { label: '데이터 변환', language: 'python' },
        },
        {
          id: 'sheets-append',
          type: 'action',
          position: { x: 800, y: 0 },
          data: { label: 'Master 저장', service: 'sheets', action: 'append' },
        },
      ],
      edges: [
        { id: 'e1', source: 'drive-list', target: 'loop-files' },
        { id: 'e2', source: 'loop-files', target: 'sheets-read' },
        { id: 'e3', source: 'sheets-read', target: 'transform' },
        { id: 'e4', source: 'transform', target: 'sheets-append' },
      ],
      roiHint: '리포트 제작 60%↓',
      testCases: ['샘플3개 merge OK'],
    },
    {
      id: 'price-monitoring',
      name: '가격 크롤링→변동 알림',
      category: 'crawling',
      difficulty: 'medium',
      description: '경쟁사 가격을 주기적으로 모니터링하고 변동 시 알림을 보냅니다.',
      prerequisites: 'HTTP 접근 가능, 파서',
      inputs: [
        { name: 'urls', type: 'object', required: true, description: '监控할 URL 목록' },
        { name: 'selector', type: 'string', required: true, description: 'CSS 셀렉터' },
        { name: 'threshold', type: 'number', required: false, description: '변동 임계치' },
        { name: 'recipients', type: 'object', required: true, description: '알림 수신자' },
      ],
      outputs: [
        { name: 'alert_message_id', type: 'string', description: '알림 메시지 ID' },
      ],
      nodes: [
        {
          id: 'http-request',
          type: 'action',
          position: { x: 0, y: 0 },
          data: { label: 'HTTP 요청', service: 'http', action: 'get' },
        },
        {
          id: 'html-extract',
          type: 'action',
          position: { x: 200, y: 0 },
          data: { label: 'HTML 추출', service: 'html', action: 'extract' },
        },
        {
          id: 'compare',
          type: 'code',
          position: { x: 400, y: 0 },
          data: { label: '가격 비교', language: 'python' },
        },
        {
          id: 'if-changed',
          type: 'logic',
          position: { x: 600, y: 0 },
          data: { label: '변동 체크', logicType: 'if' },
        },
        {
          id: 'slack-notify',
          type: 'action',
          position: { x: 800, y: 0 },
          data: { label: 'Slack 알림', service: 'slack', action: 'send' },
        },
      ],
      edges: [
        { id: 'e1', source: 'http-request', target: 'html-extract' },
        { id: 'e2', source: 'html-extract', target: 'compare' },
        { id: 'e3', source: 'compare', target: 'if-changed' },
        { id: 'e4', source: 'if-changed', target: 'slack-notify' },
      ],
      roiHint: '구매 타이밍 최적화',
      testCases: ['리트라이 3회'],
    },
    {
      id: 'ocr-invoice',
      name: 'OCR 인보이스→시트 적재',
      category: 'ai',
      difficulty: 'medium',
      description: 'PDF 인보이스를 OCR으로 처리하고 데이터를 시트에 저장합니다.',
      prerequisites: 'OCR API 키, 폴더ID',
      inputs: [
        { name: 'bucket_path', type: 'string', required: true, description: '버킷 경로' },
        { name: 'schema_map', type: 'object', required: true, description: '스키마 맵핑' },
        { name: 'sheet_id', type: 'string', required: true, description: '저장 시트 ID' },
      ],
      outputs: [
        { name: 'sheet_row_id', type: 'string', description: '저장된 행 ID' },
      ],
      nodes: [
        {
          id: 'webhook-trigger',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { label: '파일 업로드', type: 'webhook' },
        },
        {
          id: 'file-download',
          type: 'action',
          position: { x: 200, y: 0 },
          data: { label: '파일 다운로드', service: 'storage', action: 'download' },
        },
        {
          id: 'ocr-api',
          type: 'action',
          position: { x: 400, y: 0 },
          data: { label: 'OCR 처리', service: 'ocr', action: 'extract' },
        },
        {
          id: 'mapper',
          type: 'code',
          position: { x: 600, y: 0 },
          data: { label: '필드 매핑', language: 'python' },
        },
        {
          id: 'sheets-append',
          type: 'action',
          position: { x: 800, y: 0 },
          data: { label: '시트 저장', service: 'sheets', action: 'append' },
        },
      ],
      edges: [
        { id: 'e1', source: 'webhook-trigger', target: 'file-download' },
        { id: 'e2', source: 'file-download', target: 'ocr-api' },
        { id: 'e3', source: 'ocr-api', target: 'mapper' },
        { id: 'e4', source: 'mapper', target: 'sheets-append' },
      ],
      roiHint: 'AP 처리 30%↓',
      testCases: ['샘플10건 필드매핑 95%↑'],
    },
  ]

  async findAll(): Promise<Template[]> {
    return this.templates
  }

  async findById(id: string): Promise<Template | undefined> {
    return this.templates.find((template) => template.id === id)
  }

  async findByCategory(category: string): Promise<Template[]> {
    return this.templates.filter((template) => template.category === category)
  }

  async findByDifficulty(difficulty: string): Promise<Template[]> {
    return this.templates.filter((template) => template.difficulty === difficulty)
  }

  async search(keyword: string): Promise<Template[]> {
    const lowerKeyword = keyword.toLowerCase()
    return this.templates.filter(
      (template) =>
        template.name.toLowerCase().includes(lowerKeyword) ||
        template.description.toLowerCase().includes(lowerKeyword),
    )
  }

  async instantiate(templateId: string, params: Record<string, any>): Promise<any> {
    const template = await this.findById(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    // Deep clone the template
    const workflow = JSON.parse(JSON.stringify(template))

    // Replace parameters in nodes
    workflow.nodes.forEach((node: any) => {
      if (node.data) {
        Object.keys(params).forEach((key) => {
          const value = params[key]
          // Replace in all string properties of data
          Object.keys(node.data).forEach((dataKey) => {
            if (typeof node.data[dataKey] === 'string') {
              node.data[dataKey] = node.data[dataKey].replace(
                new RegExp(`{{${key}}}`, 'g'),
                value,
              )
            }
          })
        })
      }
    })

    return workflow
  }

  async getCategories(): Promise<string[]> {
    const categories = [...new Set(this.templates.map((t) => t.category))]
    return categories
  }

  async getDifficulties(): Promise<string[]> {
    const difficulties = [...new Set(this.templates.map((t) => t.difficulty))]
    return difficulties
  }
}
