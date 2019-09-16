export default {
  state: {
    userInfo: {}
  },
  mutations: {
    SET_USERINFO: (state, userInfo) => {
      state.userInfo = userInfo
    }
  },
  actions: {
    getInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        _api.home.getUserInfo().then(res => {
          if (res.data) {
            commit('SET_USERINFO', res.data)
            resolve(res)
          } else {
            reject(err)
          }
        })
      })
    }
  }
}
