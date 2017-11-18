'use strict';

const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = JSON.stringify(process.env.NODE_ENV);
const localDev = !env || env === 'development';

const htmlPluginMinify = localDev ?
  {} :
{
  removeComments: true,
  collapseWhitespace: true,
  removeRedundantAttributes: true,
  useShortDoctype: true,
  removeEmptyAttributes: true,
  removeStyleLinkTypeAttributes: true,
  keepClosingSlash: true,
  minifyJS: true,
  minifyCSS: true,
  minifyURLs: true
};

const plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new HtmlWebpackPlugin({
    template: 'example/base.html',
    filename: localDev ? 'index.html' : '../index.html',
    minify: htmlPluginMinify
  })
];

let entry = ['./example/index.js'];

if (localDev) {
  plugins.push(new webpack.NamedModulesPlugin());
  plugins.push(new webpack.HotModuleReplacementPlugin());
  entry = [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:3001',
    'webpack/hot/only-dev-server'
  ].concat(entry);
} else {
  plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: true
  }));
}

module.exports = {
  output: {
    path: path.join(__dirname, 'dist/assets'),
    filename: localDev ? '[name].js' : '[name]-[hash].js',
    publicPath: localDev ? 'http://localhost:3001/' : '//cdn.llscdn.com/hybrid/lls-web-recorder/'
  },
  cache: true,
  devtool: 'eval',
  entry,
  devServer: {
    host: 'localhost',
    port: 3001,
    hot: true,
    contentBase: './example'
  },
  module: {
    rules: [{
      oneOf: [{
        test: /\.worker\.js$/,
        loader: require.resolve('worker-loader'),
        options: {
          inline: true,
          fallback: false
        }
      }, {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: true
        }
      }, {
        test: /\.(css|scss)$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      }]
    }]
  },
  plugins
};
