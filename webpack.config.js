var webpack = require('webpack');
var path = require('path');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
module.exports = {
  entry: {
    "commonpage": path.join(__dirname, 'js', 'commonpage_entry.js'),
    "post": path.join(__dirname, 'js', 'post_entry.js')
  },
  output: {
    path: path.join(__dirname, 'js', 'outputs'),
    filename: '[name].min.js',
    chunkFilename: 'common-async-[id].min.js'
  },
  module: {
    // loaders: [
    //   {test: /\.css$/, loader: 'style!css'}
    // ]
  },
  plugins: [
    new CommonsChunkPlugin({
      filename: "commons-sync.min.js",
      name: "commons",
      chunks: ['commonpage', 'post']
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}
