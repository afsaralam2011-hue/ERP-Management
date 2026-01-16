const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [
        // Tailwind v3 کے لیے - یہ سب سے بہتر ہے
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Increase memory limit for build
      webpackConfig.performance = {
        maxAssetSize: 512000,
        maxEntrypointSize: 512000,
        hints: env === 'production' ? 'warning' : false,
      };
      
      // Ignore source map warnings
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
      ];
      
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "fs": false,
        "path": false,
        "os": false,
      };
      
      return webpackConfig;
    }
  },
  babel: {
    plugins: [
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
    ]
  }
};