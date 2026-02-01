module.exports = {
  style: {
    postcss: {
      mode: 'extends',
    },
  },
  eslint: {
    enable: false,
  },
  webpack: {
    configure: (webpackConfig) => {
      // Remove eslint-webpack-plugin to avoid the error
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== "ESLintWebpackPlugin"
      );
      
      // Ignore source map warnings
      webpackConfig.ignoreWarnings = [
        { message: /Failed to parse source map/ },
        { message: /ESLintWebpackPlugin/ },
      ];
      
      return webpackConfig;
    },
  },
};
