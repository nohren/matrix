const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, "./src/index.js"),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
         test: /\.(png|j?g|svg|gif)?$/,
         use: 'file-loader'
      }
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].bundle.js",
    clean: true
  },
  devtool: 'inline-source-map',
  plugins: [ 
    new HtmlWebpackPlugin({
        template: path.resolve( __dirname, 'public/index.html' ),
        filename: 'index.html'
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, "./dist"),
    compress: true,
    hot: true,
    open: true,
    port: 3000
  },
};