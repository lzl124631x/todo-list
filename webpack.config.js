var path = require('path');

module.exports = {
  context: path.join(__dirname, 'public/scripts'),
  entry: './todo-list.js',
  output: {
    path: path.join(__dirname, 'public/scripts'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
    {
      test: /\.js|jsx$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react']
      }
    }
    ]
  }
}