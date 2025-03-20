import axios from 'axios'
import router from '@/router'
import { Message } from 'element-ui'
import { removeUserInfo } from './auth'
// 创建 axios 实例
const service = axios.create({
  //统一加了api前缀
  baseURL: process.env.VUE_APP_BASE_API || '/api', // 从环境变量获取基础URL
  timeout: 10000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    
    // 如果有token则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 修改响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 处理成功响应
    if (res.code === 200) {
      return res.data
    }
    
    // 处理 401 状态码（未授权/token过期）
    if (res.code === 401) {
      Message.error('登录已过期，请重新登录')
      // 清除本地存储的认证信息
      removeUserInfo();
      
      // 跳转到登录页
      router.push('/')
      return Promise.reject(new Error('未授权或登录过期'))
    }
    
    // 处理其他错误状态码
    Message.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  
  error => {
    // 处理 HTTP 错误响应
    if (error.response) {
      
      switch (error.response.status) {
          
        case 404:
          Message.error('请求的资源不存在')
          break
          
        case 500:
          Message.error('服务器内部错误')
          break
          
        default:
          Message.error(error.response.data.message || '请求失败')
      }
    } else if (error.request) {
      Message.error('网络请求超时，请检查网络连接')
    } else {
      Message.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default service 