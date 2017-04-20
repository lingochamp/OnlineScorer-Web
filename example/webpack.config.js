'use strict';

const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');

var env = JSON.stringify(process.env.NODE_ENV);
var localDev = !env || env === 'development';

let libBaseUrl;
if (localDev) {
  libBaseUrl = './lib';
} else {
  libBaseUrl = '//cdn.llscdn.com/hybrid/lls-web-recorder'; // ENV=production
}

const plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.NoErrorsPlugin(),
  new HtmlWebpackPlugin({
    template: 'base.html',
    filename: '../web.html',
    libBaseUrl
  }),
  new webpack.LoaderOptionsPlugin({
    options: {
      postcss: [autoprefixer]
    }
  }),
  new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: env,
    },
  })
];

if (!localDev) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }));
} else {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
  output: {
    filename: '[name]-[hash].js',
    path: path.join(__dirname, "../dist/assets"),
    publicPath: localDev ? 'assets' : '//cdn.llscdn.com/hybrid/lls-web-recorder/'
  },
  cache: true,
  devtool: 'source-map',
  entry: './index.js',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['babel-loader', 'eslint-loader']
    }, {
      test: /\.(css|scss)$/,
      use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
    }]
  },
  plugins: plugins
};
