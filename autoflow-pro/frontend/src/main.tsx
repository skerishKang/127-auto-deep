import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Ant Design Theme
const antdTheme = {
  token: {
    colorPrimary: '#722ed1',
    borderRadius: 6,
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
