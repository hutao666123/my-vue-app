import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 配置axios默认值
axios.defaults.baseURL = 'http://localhost:3000'  // 改为前端开发服务器地址
axios.defaults.timeout = 5000

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    // 打印请求信息用于调试
    console.log('发送请求:', config.url, config.params || config.data)
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    
    // 如果是获取图片的请求，设置responseType为blob
    if (config.url && config.url.includes('/api/article') && 
        config.params && config.params.url) {
      config.responseType = 'blob'
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 修改响应拦截器
axios.interceptors.response.use(
  response => {
    // 打印响应信息用于调试
    console.log('收到响应:', response.config.url, response.status)
    
    // 如果请求的是图片，直接返回响应
    if (response.config.url && response.config.url.includes('/api/article') && 
        response.config.params && response.config.params.url) {
      return response
    }
    return response
  },
  error => {
    console.error('响应错误:', error.message)
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误数据:', error.response.data)
      
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页面
          localStorage.removeItem('token')
          router.push('/')
          break
        default:
          console.error(error.response.data)
      }
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.mount('#app') 