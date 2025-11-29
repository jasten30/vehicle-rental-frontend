const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  // --- ADD THIS LINE FOR PRODUCTION DEPLOYMENT ---
  // This ensures assets (CSS, JS) are loaded from the root path (/)
  publicPath: '/',
  // ---------------------------------------------

  transpileDependencies: true,

  // This devServer block is only used locally and is ignored during 'npm run build'
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        pathRewrite: { '^/api': '/api' }
      }
    }
  }
});