
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
        'element-ui': "^2.4.5",
        "normalize.css": "^8.0.1"
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
  const create = require('./apiCreate')

  create(options.apiId)

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
      let vantImportIndex = src.findIndex(line => line.match(/^import Vant/));
      if (axiosImportIndex < 0) {
        src.splice(++vueImportIndex, 0, "import './plugins/axios'");
        newImportIndex++
      }
      if (apiImportIndex < 0) {
        src.splice(++vueImportIndex, 0, "import '@/api'");
        newImportIndex++
      }
      if (elementImportIndex < 0 && options.project == 'PC') {
        src.splice(++vueImportIndex, 0, "import './plugins/element'");
        newImportIndex++
        src.splice(++vueImportIndex, 0, "import 'normalize.css'");
        newImportIndex++
      }
      if (options.waterMark) {
        src.splice(++vueImportIndex, 0, "import waterMark from '@/utils/water-mark'");
        newImportIndex++
      }
      if (options.site) {
        src.splice(++vueImportIndex, 0, "import tracer from '@/utils/tracer'");
        newImportIndex++
        src.splice(++vueImportIndex, 0, "import '@/utils/tracer/directive'");
        newImportIndex++
      }
      if (vantImportIndex < 0 && options.project == 'Mobile') {
        src.splice(++vueImportIndex, 0, `import Vant from 'vant';
import 'vant/lib/index.css';`);
        src.splice(--newImportIndex, 0, "Vue.use(Vant);");
        newImportIndex++
      }
      if (options.site && options.waterMark) {

        src.splice(++newImportIndex, 0, `router.beforeEach(async (to, from, next) => {
  if (store.getters.userInfo.id) {
    next()
  } else {
    store.dispatch('getInfo').then(res => {
      waterMark.set(store.getters.userInfo.name + "-" + store.getters.userInfo.uid);
      if (tracer.useTrack) {
        tracer.baseParam.uid = store.getters.userInfo.uid
        tracer.create()
      }
      next()
    })
  }
})`)
      } else if (options.site && !options.waterMark) {
        src.splice(++newImportIndex, 0, `router.beforeEach(async (to, from, next) => {
  if (store.getters.userInfo.id) {
    next()
  } else {
    store.dispatch('getInfo').then(res => {
      if (tracer.useTrack) {
        tracer.baseParam.uid = store.getters.userInfo.uid
        tracer.create()
      }
      next()
    })
  }
})`)
      } else if (!options.site && options.waterMark) {
        src.splice(++newImportIndex, 0, `router.beforeEach(async (to, from, next) => {
  if (store.getters.userInfo.id) {
    next()
  } else {
    store.dispatch('getInfo').then(res => {
      waterMark.set(store.getters.userInfo.name + "-" + store.getters.userInfo.uid);
      next()
    })
  }
})`)
      } else {
        src.splice(++newImportIndex, 0, `router.beforeEach(async (to, from, next) => {
  if (store.getters.userInfo.id) {
    next()
  } else {
    store.dispatch('getInfo').then(res => {
      next()
    })
  }
})`)
      }
      console.log('已自动代理至mock,请修改src/api文件夹接口名称和src/store/modules/user.js请求路径')
      return src;
    });

    helpers.updateVueConfig(src => {
      let oldUrl = 'http://mockapi.yunshanmeicai.com/api/app/mock/39'
      let newUrl = 'http://mockapi.yunshanmeicai.com/api/app/mock/' + options.apiId
      return src.replace(new RegExp(oldUrl, 'g'), newUrl)
    })
  });
};
