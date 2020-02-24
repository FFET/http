const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    index: "./example/src/index"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src/")
    },
    extensions: [".js"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./example/src/index.html"
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    host: "0.0.0.0",
    port: 9000,
    useLocalIp: true,
    hot: true,
    hotOnly: true,
    open: true,
    disableHostCheck: true,
    historyApiFallback: true
  }
};
