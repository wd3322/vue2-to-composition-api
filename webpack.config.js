const path = require('path')
const webpack = require('webpack')
 
module.exports = {
  devtool: 'source-map',
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'main.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [{
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader', /* https://github.com/TypeStrong/ts-loader */
        options: {
          configFile: path.resolve(__dirname, './tsconfig.json'),
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true, 
        }
      }]
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
}