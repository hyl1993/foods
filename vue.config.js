// Webpack配置扩展文件
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: ['element-ui'], // 需要编译的依赖
  lintOnSave: false, // 关闭eslint校验
  
  // 链式Webpack配置
  chainWebpack: config => {
    config.resolve.alias
      .set('element-ui', 'element-ui/lib') // 设置路径别名，优化打包体积1
  },
  
  // 开发服务器配置
  devServer: {
    proxy: {
      '/api': { // 代理配置
        target: 'http://localhost:80', // 后端接口地址
        changeOrigin: true, // 允许跨域
       // pathRewrite: { '^/api': '' } // 路径重写
      }
    }
  }
})

