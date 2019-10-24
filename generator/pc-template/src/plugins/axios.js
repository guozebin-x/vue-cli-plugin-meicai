'use strict'

import Vue from 'vue'
import axios from 'axios'
import { Message, Loading } from 'element-ui'
import router from '../router'
import pathConfig from '@/config/requirePath'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
}
let loading = null

const _axios = axios.create(config)

_axios.interceptors.request.use(
  config => {
    // loading = Loading.service({
    //   text: '正在加载中......'
    // })
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// Add a response interceptor
_axios.interceptors.response.use(
  response => {
    if (loading) {
      loading.close()
    }
    const ret = response.data.ret

    if (ret === 1) {
      return Promise.resolve(response.data)
    } else {
      if (response.data.msg == "cookie中没有user_token" || response.data.msg == "没有登录") {
        window.location.href = pathConfig.loginPath;
      } else {
        Message.error(response.data.msg)
      }

      return Promise.reject(response.data)
    }
  },
  error => {
    if (loading) {
      loading.close()
    }
    console.log('err' + error) // for debug
    // 断网 或者 请求超时 状态
    if (!error.response) {
      // 请求超时状态
      if (error.message.includes('timeout')) {
        Message.error('请求超时，请检查网络是否连接正常')
      } else {
        // 可以展示断网组件
        Message.error('请求失败，请检查网络是否已连接')
      }
      return
    }

    const responseCode = error.response.status
    switch (responseCode) {
      // 401：未登录
      // case 401:
      //   // 跳转登录页
      //   router.replace({
      //     path: '/login',
      //     query: {
      //       redirect: router.currentRoute.fullPath
      //     }
      //   })
      //   break
      // // 403: token过期
      // case 403:
      //   // 弹出错误信息
      //   Message({
      //     type: 'error',
      //     message: '登录信息过期，请重新登录'
      //   })
      //   // 清除token
      //   localStorage.removeItem('token')
      //   // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
      //   setTimeout(() => {
      //     router.replace({
      //       path: '/login',
      //       query: {
      //         redirect: router.currentRoute.fullPath
      //       }
      //     })
      //   }, 1000)
      //   break
      // 404请求不存在
      case 404:
        Message({
          message: '网络请求不存在',
          type: 'error'
        })
        break
      // 其他错误，直接抛出错误提示
      default:
        Message({
          message: error.response.data.message,
          type: 'error'
        })
    }
    return Promise.reject(error)
  }
)

Plugin.install = function (Vue, options) {
  Vue.axios = _axios
  window.axios = _axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios
      }
    },
    $axios: {
      get() {
        return _axios
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin
