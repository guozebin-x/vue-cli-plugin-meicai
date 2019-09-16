const getters = {
  userInfo: state => state.user.userInfo,
  mySystem: state => state.system.list,
  status: state => state.system.status
}
export default getters
