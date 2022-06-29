const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { DefinePlugin } = require('webpack');

const dependencies = ['react', 'react-router-dom', 'styled-components', 'swr'];

module.exports = ({ port }, { mode }) => ({
  mode,
  devtool: 'source-map',
  devServer: {
    compress: true,
    hot: true,
    port
  },
  entry: {
    ...(dependencies.reduce(
      (result, package) => ({ ...result, [package]: package}),
      {}
    )),
    index: {
      import: path.resolve(__dirname, 'src/index.jsx'),
      dependOn: dependencies
    }
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[id]_[hash].js'
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json', '.html'],
    alias: {
      'clsx'              : path.resolve(__dirname, 'node_modules/clsx/'),
      'lodash'            : path.resolve(__dirname, 'node_modules/lodash/'),
      'prop-types'        : path.resolve(__dirname, 'node_modules/prop-types/'),
      'react'             : path.resolve(__dirname, 'node_modules/react/'),
      'react-dom'         : path.resolve(__dirname, 'node_modules/react-dom/'),
      'react-router-dom'  : path.resolve(__dirname, 'node_modules/react-router-dom/'),
      'styled-components' : path.resolve(__dirname, 'node_modules/styled-components/'),

      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  },
  optimization: {
    runtimeChunk: 'single'
  },
  plugins: [
    ...(mode === 'production' ? [] : [new ReactRefreshWebpackPlugin({  })]),
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html')
    }),
    new DefinePlugin({

    })
  ],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: [/(node_modules)/],
      use: [{
        loader: 'babel-loader',
        ...(mode !== 'production' && {
          options: {
            plugins: ['react-refresh/babel']
          }
        })
      }]
    }, {
      test: /\.(eot|ttf|woff|woff2|svg|svgz|ico)(\?.+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[hash:8].[ext]'
        }
      }]
    }]
  }
});
