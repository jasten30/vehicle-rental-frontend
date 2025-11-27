  const { defineConfig } = require("@vue/cli-service");
   module.exports = defineConfig({
     transpileDependencies: true,
     devServer: {
       proxy: {
         '/api': {
           target: 'http://localhost:5001',  // Your backend port
           changeOrigin: true,  // Handles CORS and origin headers
           pathRewrite: { '^/api': '/api' }  // Optional: Ensures /api prefix is preserved (default behavior)
         }
       }
     }
   });
