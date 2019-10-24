const path = require('path')
const fs = require('fs')
const http = require('http');
const resolve = (...file) => path.resolve(__dirname, ...file)


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


let apidata = '';
const startRequest = (url) => {
  //采用http模块向服务器发起一次get请求   
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      var titles = [];
      res.setEncoding('utf-8'); //防止中文乱码
      res.on('data', function (chunk) {
        apidata += chunk;
      });
      res.on('end', () => {
        resolve(true)
      });
    })
  })
}



async function create(inputId) {
  let url = "http://mockapi.yunshanmeicai.com/api/repository/get?id=" + inputId

  await startRequest(url)
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
  } catch{
    console.log('id有误,跳过api创建')
    return
  }
  interfacesList.forEach(i => {
    parsing(i)
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
module.exports = async (api, options, rootOptions) => {
  if (options.site) {
    await api.render('./track')
  }
  if (options.waterMark) {
    await api.render('./water-mark')
  }
  if (options.project == 'PC') {
    await api.render('./pc-template')
    api.extendPackage({
      devDependencies: {
        'chalk': "^2.4.2"
      },
      dependencies: {
        "vue-router": "^3.0.3",
        "vuex": "^3.0.1",
        'axios': "^0.18.0",
        'element-ui': "^2.4.5"
      },
      scripts: {
        "new:comp": "node ./scripts/generateComponent",
        "new:view": "node ./scripts/generateView"
      }
    });
  } else {
    await api.render('./mobile-template')
    api.extendPackage({
      devDependencies: {
        'chalk': "^2.4.2",
        "babel-plugin-import": "^1.12.1"
      },
      dependencies: {
        'axios': "^0.18.0",
        'vant': '^2.2.1',
        "cssnano": "^4.1.10",
        "fastclick": "^1.0.6",
        "postcss-aspect-ratio-mini": "^1.0.1",
        "postcss-cssnext": "^3.1.0",
        "postcss-px-to-viewport": "^1.1.0",
        "vuex": "^3.0.1",
        'axios': "^0.18.0",
        "postcss-write-svg": "^3.0.1"
      },
      scripts: {
        "new:comp": "node ./scripts/generateComponent",
        "new:view": "node ./scripts/generateView"
      }
    })
  }

  create(options.apiId)

  const fs = require("fs");
  const helpers = require('./helpers')(api)

  // adapted from https://github.com/Akryum/vue-cli-plugin-apollo/blob/master/generator/index.js#L68-L91
  api.onCreateComplete(() => {
    // Modify main.js
    helpers.updateMain(src => {
      let vueImportIndex = src.findIndex(line => line.match(/^import Vue/));
      let newImportIndex = src.findIndex(line => line.match(/^new Vue/));
      let axiosImportIndex = src.findIndex(line => line.match(/\/plugins\/axios/));
      let apiImportIndex = src.findIndex(line => line.match(/\/plugins\/api/));
      let elementImportIndex = src.findIndex(line => line.match(/\/plugins\/element/));
      let fastImportIndex = src.findIndex(line => line.match(/^import fastClick/));
      if (axiosImportIndex < 0) {
        src.splice(++vueImportIndex, 0, "import './plugins/axios'");
      }
      if (apiImportIndex < 0) {
        src.splice(++vueImportIndex, 0, "import './plugins/api'");
      }
      if (elementImportIndex < 0 && options.project == 'PC') {
        src.splice(++vueImportIndex, 0, "import './plugins/element'");
      }

      if (fastImportIndex < 0 && options.project == 'Mobile') {
        src.splice(++vueImportIndex, 0, "import fastClick from 'fastclick'");

      }

      if (options.project == 'Mobile') {
        src.splice(++vueImportIndex, 0, `import Vant from 'vant';
import 'vant/lib/index.css';`);
        src.splice(++newImportIndex, 0, "fastClick.attach(document.body)");
        src.splice(++newImportIndex, 0, "Vue.use(Vant);");
      }
      src.splice(++newImportIndex, 0, `router.beforeEach(async (to, from, next) => {
  if (store.getters.userInfo.id) {
    next()
  } else {
    store.dispatch('getInfo').then(res => {
      next()
    })
  }
})`)

      return src;
    });
  });
};
