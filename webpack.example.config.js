'use strict';

const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = JSON.stringify(process.env.NODE_ENV);
const localDev = !env || env === 'development';

const plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new HtmlWebpackPlugin({
    template: 'example/base.html',
    filename: localDev ? 'index.html' : '../index.html'
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: env
    }
  })
];

if (localDev) {
  plugins.push(new webpack.NamedModulesPlugin());
  plugins.push(new webpack.HotModuleReplacementPlugin());
} else {
  plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
}

module.exports = {
  output: {
    path: path.join(__dirname, 'dist/assets'),
    filename: localDev ? '[name].js' : '[name]-[hash].js',
    publicPath: localDev ? 'http://localhost:3001/' : '//cdn.llscdn.com/hybrid/lls-web-recorder/'
  },
  cache: true,
  devtool: 'eval',
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:3001',
    'webpack/hot/only-dev-server',
    './example/index.js'
  ],
  devServer: {
    host: 'localhost',
    port: 3001,
    hot: true,
    contentBase: './example'
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }, {
      test: /\.(css|scss)$/,
      use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
    }]
  },
  plugins
};
