'use strict';

const webpack = require('webpack');
const path = require('path');

const plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: true
    }
  }),
  new webpack.optimize.UglifyJsPlugin({minimize: true})
];

const version = 'v1.0.1';

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
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['babel-loader', 'eslint-loader']
    }]
  },
  plugins
};
