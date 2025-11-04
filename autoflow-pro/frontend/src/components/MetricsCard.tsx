import React from 'react'
import { Card, Statistic } from 'antd'

interface MetricsCardProps {
  title: string
  value: number | string
  suffix?: string
  precision?: number
  prefix?: React.ReactNode
  valueStyle?: React.CSSProperties
  description?: string
  color?: string
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  suffix,
  precision,
  prefix,
  valueStyle,
  description,
  color,
}) => {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        precision={precision}
        prefix={prefix}
        valueStyle={{ color: color || '#000', ...valueStyle }}
      />
      {description && (
        <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
            {description}
        </div>
      )}
    </Card>
  )
}

export default MetricsCard
