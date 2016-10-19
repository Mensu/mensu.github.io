var webpack = require('webpack');
var path = require('path');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
module.exports = {
  entry: {
    "diff-demo": path.join(__dirname, 'js', 'entry.js')
  },
  output: {
    path: path.join(__dirname),
    filename: '[name].js',
    chunkFilename: 'common-async-[id].js'
  },
  module: {
    // loaders: [
    //   {test: /\.css$/, loader: 'style!css'}
    // ]
  },
  plugins: [
    // new CommonsChunkPlugin({
    //     filename: "commons-sync.js",
    //     name: "commons",
    //     chunks: ['front', 'back']
    // })
  ]
}
