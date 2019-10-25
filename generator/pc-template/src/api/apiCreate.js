const path = require('path')
const files = require.context('./modules', false, /\.js$/)
let modules = {}
files.keys().forEach(key => {
  let name = path.basename(key, '.js')
  modules[name] = files(key).default || files(key)
})

const serverBasePath = ''
const API = {
  get(url, params) {
    return axios.get(url, { params })
  },
  post(url, params, headers) {
    return axios.post(url, params, { headers })
  },
  makeApiMethod(source, target, method) {
    let getApiNames = Object.keys(source)
    getApiNames.forEach(apiName => {
      target[apiName] = (params, headers) => {
        return this[method || 'get'](serverBasePath + source[apiName], params, headers)
      }
    })
  }
}

let _api = {}
function load(apiJSON) {
  let apiGroups = Object.keys(apiJSON)
  apiGroups.forEach(group => {
    let apiConfig = apiJSON[group]
    let allApis = {}
    if (apiConfig) {
      if (apiConfig['get']) {
        API.makeApiMethod(apiConfig['get'], allApis)
      }
      if (apiConfig['post']) {
        API.makeApiMethod(apiConfig['post'], allApis, 'post')
      }
    }

    _api[group] = allApis
  })
}

load(modules)


export default _api
