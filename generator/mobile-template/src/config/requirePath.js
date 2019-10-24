
const URL = window.location.href

let _env
if (URL.indexOf("localhost") != -1) {
  _env = "DEV"
} else if (URL.indexOf("stage") != -1) {
  _env = "STAGE"
} else if (URL.indexOf("test") != -1) {
  _env = "TEST"
} else {
  _env = "PRODUCT"
}
let urlPath = {
  DEV: {
    loginPath:
      "https://sso.test.yunshanmeicai.com/dingding/index?redirect_url=https%3A%2F%2Fhelp.test.yunshanmeicai.com"
  },
  TEST: {
    loginPath:
      "https://sso.test.yunshanmeicai.com/dingding/index?redirect_url=https%3A%2F%2Fhelp.test.yunshanmeicai.com"
  },
  STAGE: {
    loginPath: "https://sso.stage.yunshanmeicai.com/dingding/index?redirect_url=https%3A%2F%2Fhelp.stage.yunshanmeicai.com"
  },
  PRODUCT: {
    loginPath: "https://sso.yunshanmeicai.com/dingding/index?redirect_url=https%3A%2F%2Fhelp.yunshanmeicai.com"
  }
};

export default urlPath[_env];
