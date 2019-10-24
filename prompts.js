module.exports = [
  {
    type: 'list',
    name: 'project',
    message: '项目类型',
    choices: [
      { name: 'PC', value: 'PC' },
      { name: 'Mobile', value: 'Mobile' }
    ],
    default: 'PC',
  },
  {
    type: 'confirm',
    name: 'waterMark',
    message: '是否添加水印'
  },
  {
    type: 'confirm',
    name: 'site',
    message: '是否埋点'
  },
  {
    type: 'number',
    name: 'apiId',
    message: '如需将接口注入vue实例,请输入mock文档的id,在全局通过api调用'
  }
]
