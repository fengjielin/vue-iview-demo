module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true,
    proxy: {
      // 代理 用于解决跨域问题
      '/api': {
        // 目标地址
        target: 'http://192.168.43.233:8080/',
        // 发送请求头host会被设置为target
        changeOrigin: true,
        // websocket
        ws: false,
        // 是否重新请求地址
        pathRewrite: { '/api': '' }
      }
    }
  },
}