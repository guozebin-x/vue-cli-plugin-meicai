const http = require('http');
const path = require('path')
const fs = require('fs')

const generateFile = (path, data) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      let err = {}
      err.message = '文件已存在'
      reject(err)
      return
    }
    fs.writeFile(path, data, 'utf8', err => {
      if (err) {
        console.log(err.message)
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}
const startRequest = (url) => {
  //采用http模块向服务器发起一次get请求   
  return new Promise((resolve, reject) => {
    let apidata = '';
    http.get(url, res => {
      var titles = [];
      res.setEncoding('utf-8'); //防止中文乱码
      res.on('data', function (chunk) {
        apidata += chunk;
      });
      res.on('end', () => {
        resolve(apidata)
      });
    })
  })
}
async function parsing(module) {
  let interfaces = module.interfaces
  let output = `export default {
  get: {
    `
  let apiList = []
  interfaces.forEach(i => {
    let m = {};
    m.name = i.name
    m.url = i.url
    m.method = i.method
    apiList.push(m)
  });

  let getMethod = []
  let postMethod = []
  apiList.forEach(i => {
    if (i.method == "GET") {
      getMethod.push(i)
    } else {
      postMethod.push(i)
    }
  })

  getMethod.forEach(i => {
    let name = 'get-' + i.url.split('/').splice(-1, 1)
    name = camelCase(name)
    output += `  //${i.name}
    ${name}:'${i.url}',
  `
  })
  output += `},
  post: {
  `
  postMethod.forEach(i => {
    let name = 'post-' + i.url.split('/').splice(-1, 1)
    name = camelCase(name)
    output += `  //${i.name}
    ${name}: '${i.url}',
  `
  })
  output += `}
}`
  try {
    console.log(`正在生成${module.name}`)
    await generateFile('src/api/modules/' + module.name + '.js', output)
    console.log(`${module.name}生成成功`)
  } catch (e) {
    console.log(e.message)
  }
}

//横线转驼峰
function camelCase(string) {
  return string.replace(/-([a-z])/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

function dotExistDirectoryCreate(directory) {
  return new Promise((resolve) => {
    mkdirs(directory, function () {
      resolve(true)
    })
  })
}

// 递归创建目录
function mkdirs(directory, callback) {
  var exists = fs.existsSync(directory)
  if (exists) {
    callback()
  } else {
    mkdirs(path.dirname(directory), function () {
      fs.mkdirSync(directory)
      callback()
    })
  }
}

async function create(inputId) {
  let url = "http://mockapi.yunshanmeicai.com/api/repository/get?id=" + inputId

  let apidata = await startRequest(url)
  const apiDirectory = 'src/api/modules'
  const hasApiDirectory = fs.existsSync(apiDirectory)
  if (!hasApiDirectory) {
    console.log(`正在生成 api 目录`)
    await dotExistDirectoryCreate(apiDirectory)
    console.log(`api 目录生成成功`)
  }
  let data = eval('(' + apidata + ')')
  let interfacesList
  try {
    interfacesList = data.data.modules
  } catch (error) {
    console.log('id有误,跳过api创建')
    return
  }
  interfacesList.forEach(i => {
    parsing(i)
  })
}
module.exports = create