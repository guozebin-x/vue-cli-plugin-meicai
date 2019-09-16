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
    name: 'site',
    message: '是否埋点'
  },
  {
    type: 'number',
    name: 'apiId',
    message: '请输入mock文档的id'
  }
]
