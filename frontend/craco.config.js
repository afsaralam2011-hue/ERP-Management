module.exports = {
  eslint: {
    enable: false,
  },
  style: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss'),
        require('cssnano')({
          preset: ['default', {
            calc: false,
          }],
        }),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Increase memory limit for build
      webpackConfig.performance = {
        maxAssetSize: 2 * 1024 * 1024, // 2MB
        maxEntrypointSize: 2 * 1024 * 1024, // 2MB
        hints: false // Turn off size warnings
      };

      // Ignore all warnings
      webpackConfig.ignoreWarnings = [
        { message: /Failed to parse source map/ },
        { message: /autoprefixer/ },
        { message: /tailwindcss/ },
        { message: /unused/ },
        { message: /asset size limit/ }
      ];

      return webpackConfig;
    }
  }
};