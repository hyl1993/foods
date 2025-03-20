// 引入Vue核心库
import Vue from 'vue'
// 引入根组件
import App from './App.vue'
// 引入路由配置
import router from './router'
// 引入ElementUI组件库
import ElementUI from 'element-ui'
// 引入ElementUI默认样式
import 'element-ui/lib/theme-chalk/index.css'


// 全局注册ElementUI组件
Vue.use(ElementUI)

// 生产环境提示开关
Vue.config.productionTip = false

// 创建Vue根实例
new Vue({
  router,  // 注入路由
  render: h => h(App)  // 渲染根组件
}).$mount('#app')  // 挂载到#app节点
