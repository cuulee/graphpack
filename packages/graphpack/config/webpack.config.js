const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_WEBPACK = typeof __webpack_modules__ === 'object';
const hasBabelRc = fs.existsSync(path.resolve('babel.config.js'));

if (hasBabelRc && !IS_WEBPACK) {
  console.info('🐠 Using babel.config.js defined in your app root');
}

module.exports = {
  devtool: IS_DEV ? 'sourcemap' : 'none',
  entry: {
    // We take care of setting up entry file under lib/index.js
    index: ['graphpack'],
  },
  // When bundling with Webpack for the backend you usually don't want to bundle
  // its node_modules dependencies. This creates an externals function that
  // ignores node_modules when bundling in Webpack.
  externals: [nodeExternals({ whitelist: [/^graphpack$/] })],
  mode: IS_DEV ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.(gql|graphql)/,
        use: 'graphql-tag/loader',
      },
      {
        test: /\.(js|ts)$/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: true,
              cacheDirectory: true,
              presets: hasBabelRc
                ? undefined
                : [require.resolve('babel-preset-graphpack')],
            },
          },
        ],
      },
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
    ],
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  optimization: { noEmitOnErrors: true },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(process.cwd(), './build'),
    sourceMapFilename: '[name].map',
  },
  performance: {
    hints: false,
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    new webpack.EnvironmentPlugin({
      DEBUG: false,
      GRAPHPACK_SRC_DIR: path.resolve(process.cwd(), 'src'),
      NODE_ENV: 'development',
    }),
    new FriendlyErrorsWebpackPlugin({ clearConsole: IS_DEV }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  stats: 'minimal',
  target: 'node',
};
