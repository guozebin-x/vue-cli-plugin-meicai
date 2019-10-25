import _api from './apiCreate'
import Vue from 'vue'
let apiCreate = {}

apiCreate.install = function (Vue, options) {
  Vue._api = _api
  window._api = _api
  Object.defineProperties(Vue.prototype, {
    api: {
      get() {
        return _api
      }
    },
    _api: {
      get() {
        return _api
      }
    }
  })
}

Vue.use(apiCreate)
export default apiCreate
