'use strict';

const webpack = require('webpack');
const path = require('path');

const plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.optimize.UglifyJsPlugin({minimize: true})
];

const version = 'v1.0.3';

module.exports = {
  output: {
    filename: '[name]-' + version + '.js',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    library: '[name]',
    path: path.join(__dirname, 'dist/assets')
  },
  entry: {
    llsRecorder: './src/index.js'
  },
  module: {
    rules: [{
      test: /\.worker\.js$/,
      exclude: /node_modules/,
      loader: require.resolve('worker-loader'),
      options: {
        inline: true
      }
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: require.resolve('babel-loader'),
      options: {
        cacheDirectory: true
      }
    }]
  },
  plugins
};
