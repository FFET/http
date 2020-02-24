/**
 * webpack config
 */
const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const ENV = process.env.NODE_ENV || "development";

module.exports = {
  mode: ENV,
  entry: {
    index: "./src/index.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "lib"),
    libraryTarget: "commonjs2"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src/")
    },
    extensions: [".js"]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  },
  plugins: [new webpack.ProgressPlugin(), new CleanWebpackPlugin()]
};
