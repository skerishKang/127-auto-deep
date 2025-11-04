import { Card } from "antd";
import React, { useState, useEffect } from 'react'
import { Typography, Row, Col, Select, Input, Space, Empty, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import axios from 'axios'
import TemplateCard from '../components/TemplateCard'
import { Template } from '../types/workflow'
import toast from 'react-hot-toast'

const { Title, Text } = Typography
const { Option } = Select

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, category, difficulty, searchKeyword])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/templates')
      setTemplates(response.data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      toast.error('템플릿 로딩에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    if (category) {
      filtered = filtered.filter((t) => t.category === category)
    }

    if (difficulty) {
      filtered = filtered.filter((t) => t.difficulty === difficulty)
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(keyword) ||
          t.description.toLowerCase().includes(keyword),
      )
    }

    setFilteredTemplates(filtered)
  }

  const handleUseTemplate = async (template: Template) => {
    try {
      // Template instantiation API call would go here
      toast.success(`${template.name} 템플릿을 사용합니다!`)
      console.log('Using template:', template)
    } catch (error) {
      toast.error('템플릿 사용 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>템플릿 마켓</Title>
        <Text type="secondary">
          즉시 사용 가능한 워크플로우 템플릿으로 빠르게 자동화를 시작하세요.
        </Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="템플릿 검색..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="카테고리"
            value={category}
            onChange={setCategory}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="mail">메일</Option>
            <Option value="file">파일</Option>
            <Option value="etl">데이터</Option>
            <Option value="crawling">크롤링</Option>
            <Option value="ai">AI</Option>
            <Option value="hr">인사</Option>
            <Option value="finance">재무</Option>
            <Option value="collaboration">협업</Option>
          </Select>
          <Select
            placeholder="난이도"
            value={difficulty}
            onChange={setDifficulty}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="easy">쉬움</Option>
            <Option value="medium">보통</Option>
            <Option value="hard">어려움</Option>
          </Select>
        </Space>
      </Card>

      {filteredTemplates.length === 0 ? (
        <Empty description="조건에 맞는 템플릿이 없습니다." />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTemplates.map((template) => (
            <Col key={template.id} xs={24} sm={12} md={8} lg={6}>
              <TemplateCard template={template} onUse={handleUseTemplate} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default TemplatesPage
