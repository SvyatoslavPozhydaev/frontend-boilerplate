const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const SERVER_HOST = 'localhost'
const SERVER_PORT = 3000
const ASSET_PATH = IS_PRODUCTION ? '/' : `http://${SERVER_HOST}:${SERVER_PORT}/`

const extractSass = new ExtractTextPlugin({
  filename: 'css/[name].css',
})

const sassExtractor = () => {
  return ['css-hot-loader'].concat(extractSass.extract({
    use: [
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          root: path.resolve(__dirname, 'src'),
          minimize: (process.env.NODE_ENV === 'production'),
        },
      }, {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          plugins: [
            //require('postcss-import')({ root: loader.resourcePath }),
            //require('postcss-cssnext')(),
            autoprefixer({
              browsers: ['ie >= 9', 'last 4 version', '> 1%'],
            }),
            //require('cssnano')()
          ],
        },
      },
      {
        loader: 'resolve-url-loader',
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          includePaths: [
            path.resolve(__dirname, 'node_modules/'),
            path.resolve(__dirname, 'src'),
          ],
        },
      }],
    fallback: 'style-loader',
  }))
}

module.exports = {
  mode: process.env.NODE_ENV,
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: [path.resolve(__dirname, 'src', 'index.js')],
  },
  output: {
    filename: 'js/app.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: ASSET_PATH,
    chunkFilename: '[name]-[chunkhash].js',
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          sourceMap: true,
          output: {
            comments: false,
          }
        }
      })
    ]
  },
  stats: { //object
    assets: true,
    colors: true,
    errors: true,
    errorDetails: true,
    hash: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        },
        exclude: [
          path.resolve(__dirname, 'node_modules'),
        ],
      }, {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name]-[hash:8].[ext]',
            },
          },
        ],
        exclude: [path.resolve(__dirname, 'src', 'fonts')],
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)(\?.*$|$)/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name]-[hash:8].[ext]',
              publicPath: '../',
            },
          },
        ],
        include: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, 'src', 'fonts'),
        ],
      },
      {test: /\.sass$/, use: sassExtractor()},
      {test: /\.scss$/, use: sassExtractor()},
      {test: /\.css$/, use: sassExtractor()},
      {
        test: /\.njk$/,
        //include: [ path.resolve(__dirname, 'src', 'views') ],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].html',
            },
          }, {
            loader: 'extract-loader',
          }, {
            loader: 'html-loader',
            options: {
              ignoreCustomFragments: [/\{\{.*?}}/],
              root: path.resolve(__dirname, 'src'),
              interpolate: 'require',
              attrs: ['img:src'],
            },
          }, {
            loader: 'nunjucks-html-loader',
            options: {
              searchPaths: [
                path.resolve(__dirname, 'src', 'views'),
              ],
              context: {
                hash: (new Date()).getTime().toString('16'),
              },
            },
          },
        ],
      },
      {
        test: /\.pug$/,
        //include: [ path.resolve(__dirname, 'src', 'views') ],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].html'
            }
          }, {
            loader: 'extract-loader'
          }, {
            loader: 'html-loader',
            options: {
              ignoreCustomFragments: [/\{\{.*?}}/],
              root: path.resolve(__dirname, 'src'),
              attrs: ['img:src'],
              interpolate: true
            }
          }, {
            loader: 'pug-html-loader',
            options: {
              basedir: path.resolve(__dirname, 'src', 'views'),
              pretty: '    '
            }
          }
        ]
      }
    ],
  },

  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'src'),
    ],
    extensions: ['.js', '.es6', '.css', '.scss', '.sass'],
  },

  devtool: 'source-map',

  devServer: {
    host: SERVER_HOST,
    port: SERVER_PORT,
    headers: {'Access-Control-Allow-Origin': '*'},
  },

  plugins: [
    extractSass,
    new CleanWebpackPlugin(['build']),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    })
  ],
}
