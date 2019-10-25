# vue-cli-plugin-meicai

## 项目构建插件

使用 vue-cli3 创建新项目后执行
`vue add vue-cli-plugin-meicai`
或
`npm install vue-cli-plugin-meicai` `vue invoke vue-cli-plugin-meicai`

执行后可自行选择所需功能，所需 npm 包均会自动安装，可根据 mock 文档的 id 自动生成接口并注入 VUE 实例，全局通过 api.模块名.接口名调用即可，并自动配置 vue.config.js 接入 mock 平台

pc 端可自动生成水印，埋点，store 目录下用户信息，elementui 配置，axios 全局拦截配置，常用 scss 函数

移动端自动引入 vant，除 pc 端功能外，会自动配置 postcss，进行 vw 适配并解决 1px 问题

插件运行结束后需自行修改 src/api/modules 下所生成接口目录的名称（目前只能生成汉字名）以及 src/store/modules/user.js 中请求用户信息的地址
