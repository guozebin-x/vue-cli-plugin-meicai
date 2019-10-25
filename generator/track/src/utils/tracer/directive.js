import Vue from 'vue'
const tracerDirective = {}

const install = function (Vue) {
  Vue.directive('trace-click', {
    bind(el, binding) {
      el.addEventListener('click', function () {
        mcTracer.click(binding.value)
      })
    }
  })
}

Vue.use(install);

tracerDirective.install = install
export default tracerDirective