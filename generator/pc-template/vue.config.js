const path = require('path')
const webpack = require('webpack')
const packageConfig = require('./package.json.js')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const resolve = function (dir) {
  return path.join(__dirname, dir)
}

/**
 * 配置开发模式使用的域名，默认不指定，即使用 localhost.
 *
 * 若指定了 devHost，如：const devHost = 'rad.dev.yunshanmeicai.com',
 * 则需要配置操作系统 host，如：127.0.0.1 rad.dev.yunshanmeicai.com
 */
const devHost = ''

function onProxyReq(proxyReq, req, res) {
  console.log(proxyReq.path)
}

// -------------------------------------编译配置选项-----------------------------------

/**
 * api反向代理配置.
 * 一般地，前后端分离开发，前端会把 ajax 的访问代理到可用的服务器环境，分两种情况：
 *
 * 1.代理到 test/stage等环境，配置如下：
 *    let isUseDevServerProxy = true
 *    let isUseRapMockerTarget = false
 *    let apiProxyTarget = 'http://test.cms.yunshanmeicai.com/'
 *
 * 2.代理到 mocker 平台
 *    let isUseDevServerProxy = true
 *    let isUseRapMockerTarget = true
 *    let apiProxyTarget = 'http://mockapi.yunshanmeicai.com/api/app/mock/39'
 *
 *    mocker 平台基于 rap2, 内网地址：http://mockapi.yunshanmeicai.com/
 *
 * dev proxy 配置参考: https://cli.vuejs.org/zh/config/#devserver-proxy
 */
let isUseDevServerProxy = false
let isUseRapMockerTarget = false
let apiProxyTarget = ''
let apiProxyMatches = ['/api']

/**
 * 配置编译后文件的存储位置。
 * 默认放到根目录下的 dist 文件夹。
 * 如下所示示例：
 * let outputPath = '../../acm/acm-portal/src/main/webapp/'
 * let indexFileName = 'index.html'
 * let assetsDir = 'static'
 */
let isChangeDistPathOnPrd = false
let isChangeDistPathOnDev = false
let outputPath = ''
let indexFileName = ''
let assetsDir = ''

/**
 * 是否分析 webpack 打包细节，以便于性能优化。
 */
let isAnalyzeBundle = false

// -------------------------------------编译配置解析-----------------------------------

/**
 * 基础编译配置。
 * 更多配置项，请参考：https://cli.vuejs.org/config/
 */
let options = {
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.json', '.vue'],
      alias: {
        jsutils: resolve('./src/utils/jsutils.js'),
        regexs: resolve('./src/utils/valregex.js')
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        __VERSION__: "'" + packageConfig['version'] + "'"
      }),
      new webpack.ProvidePlugin({
        _: 'jsutils',
        _reg: 'regexs'
      })
    ]
  },
  devServer: {
    open: true, // 启动后打开浏览器。
    host: 'localhost.yunshanmeicai.com',
    disableHostCheck: true,
    proxy: {
      '/api': {
        target: `http://portal.test.yunshanmeicai.com/`,
        logLevel: 'debug',
        pathRewrite: {
          '^/api': '/'
        }
      }
    }
  }

}

// 解析 ajax proxy.
if (isUseDevServerProxy) {
  let devProxyOptions = {}
  apiProxyMatches.forEach(api => {
    devProxyOptions[api] = {
      target: apiProxyTarget,
      changeOrigin: true,
      bypass: function (req, res, proxyOpt) {
        res.set('RAD-PROXY', 'on')
        res.set('RAD-PROXY-BY', apiProxyTarget)
      }
    }
    if (isUseRapMockerTarget) {
      devProxyOptions[api]['pathRewrite'] = (path, req) =>
        '/' + req.method + '/' + path
    }
  })
  options['devServer'] = options['devServer'] || {}
  options['devServer']['proxy'] = devProxyOptions
}

// 解析编译产出配置
if (
  (process.env.NODE_ENV === 'production' && isChangeDistPathOnPrd) ||
  isChangeDistPathOnDev
) {
  options['publicPath'] = './' + assetsDir
  options['indexPath'] = path.resolve(__dirname, outputPath + indexFileName)
  options['outputDir'] = path.resolve(__dirname, outputPath + assetsDir)
} else {
  options['publicPath'] = './'
  options['assetsDir'] = 'static'
}

if (isAnalyzeBundle) {
  options['configureWebpack'] = options['configureWebpack'] || {}
  options['configureWebpack']['plugins'] =
    options['configureWebpack']['plugins'] || []
  options['configureWebpack']['plugins'].push(new BundleAnalyzerPlugin())
}

module.exports = options
