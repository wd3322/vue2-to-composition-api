const path = require('path')
const webpack = require('webpack')
 
module.exports = {
  devtool: false,
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, './lib'),
    publicPath: '/lib/',
    filename: 'index.js',
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
  ],
  target: ['web', 'es5']
}