const path = require('path');
const webpack = require('webpack');

/**
 * PostCSS plugins
 */
const postCssCssNano = require('cssnano');
const postCssAutoprefixer = require('autoprefixer');
const postCssUrl = require('postcss-url');
const postCssPresetEnv = require('postcss-preset-env');
const postCssFlexBugsFixes = require('postcss-flexbugs-fixes');

/**
 * Webpack plugins
 */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const PugHtmlPreprocessor = require('./pug-html-preprocessor');

/**
 * Webpack server config
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SERVER_HOST = 'localhost';
const SERVER_PORT = 3000;

/**
 * Webpack config variables
 */
const IS_LOCAL_BUILD = true;
const PATH_SRC = path.resolve(__dirname, 'src');
const PATH_BUILD = path.resolve(__dirname, 'build');
const PATH_BASE = 'webpack/';
const PATH_PUBLIC_BUILD = IS_LOCAL_BUILD ? '../../' : '/';
const PATH_PUBLIC = IS_PRODUCTION ? PATH_PUBLIC_BUILD : `http://${SERVER_HOST}:${SERVER_PORT}/`;

/**
 * Функция обработки файлов стилей
 *
 * @param {'css'|'sass'|'scss'} syntax
 * @returns {any[]}
 */
const styleLoader = (syntax) => {
  const loaders = [
    {
      loader: ExtractCssChunks.loader,
      options: {
        // if you want HMR - we try to automatically inject hot
        // reloading but if it's not working, add it to the config
        hmr: !IS_PRODUCTION,
        // modules: true, // if you use cssModules, this can help.
        // reloadAll: true, // when desperation kicks in - this is a brute force HMR flag
      },
    },
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
      },
    }, {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        postcssOptions: {
          plugins: ((() => {
            const plugins = [];
            plugins.push(
              postCssFlexBugsFixes(),
              postCssPresetEnv(),
              postCssUrl(),
              postCssAutoprefixer(),
            );
            if (IS_PRODUCTION) {
              plugins.push(
                postCssCssNano(),
              );
            }
            return plugins;
          })()),
        },
      },
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
        sassOptions: {
          fiber: false,
          indentedSyntax: syntax === 'sass',
          includePaths: [
            path.resolve(__dirname, 'node_modules/'),
            PATH_SRC,
          ],
        },
      }
      ,
    },
  ];

  if (syntax !== 'css') {
    loaders.push({
      loader: 'sass-resources-loader',
      options: {
        sourceMap: true,
        resources: path.resolve(PATH_SRC, 'common', 'index.scss'),
      },
    });
  }

  return loaders;
};

const config = {
  mode: process.env.NODE_ENV,
  context: PATH_SRC,
  entry: {
    app: [path.resolve(PATH_SRC, 'index.js')],
  },
  output: {
    filename: `${PATH_BASE}js/[name].js?[hash]`,
    chunkFilename: `${PATH_BASE}js/[name].js?[hash]`,
    path: PATH_BUILD,
    publicPath: PATH_PUBLIC,
  },
  optimization: {
    minimize: IS_PRODUCTION,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: 1,
          name: 'vendors',
          chunks: 'initial',
          enforce: true,
        },
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.(js|jsx|es6)$/,
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, 'babel.config.js'),
        },
        exclude: (file) => /node_modules/.test(file) && !/\.vue\.js/.test(file),
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `${PATH_BASE}images/[name]-[hash:8].[ext]`,
              esModule: false,
            },
          },
        ],
        exclude: [
          path.resolve(PATH_SRC, 'fonts'),
          path.resolve(PATH_SRC, 'images'),
          /inline/i,
        ],
      },
      {
        // Контентные картинки
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `${PATH_BASE}images/[name]-[hash:8].[ext]`,
              publicPath: IS_PRODUCTION ? './' : undefined,
              esModule: false,
            },
          },
        ],
        include: [
          path.resolve(PATH_SRC, 'images'),
        ],
        exclude: [
          /inline/i,
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-inline-loader',
          },
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                { removeViewBox: false },
              ],
            },
          },
        ],
        include: [
          /inline/i,
        ],
      },
      {
        test: /\.(woff|woff2|eot|otf|ttf|svg)(\?.*$|$)/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `${PATH_BASE}fonts/[name]-[hash:8].[ext]`,
              esModule: false,
            },
          },
        ],
        include: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(PATH_SRC, 'fonts'),
        ],
        exclude: [
          /inline/i,
        ],
      },
      {
        test: /\.sass$/,
        use: styleLoader('sass'),
      },
      {
        test: /\.scss$/,
        use: styleLoader('scss'),
      },
      {
        test: /\.css$/,
        use: styleLoader('css'),
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        include: [
          /inline/i,
        ],
      },
      {
        test: /\.pug$/,
        exclude: [
          /inline/i,
        ],
        oneOf: [
          {
            resourceQuery: /^\?vue/,
            use: ['pug-plain-loader'],
          },
          {
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].html',
                  esModule: false,
                },
              }, {
                loader: 'extract-loader',
              },
              {
                loader: 'html-loader',
                options: {
                  preprocessor: PugHtmlPreprocessor({
                    basedir: PATH_SRC,
                    locals: {
                      hash: (new Date()).getTime()
                        .toString('16'),
                    },
                  }),
                  sources: false,
                  minimize: false,
                  esModule: false,
                },
              },
            ],
          },
        ],
      },
    ],
  },

  resolve: {
    modules: [
      'node_modules', // нужно чтоб правильно разрешались зависимости в пакетах, если пакет требудет другую версию
      path.resolve(__dirname, 'node_modules'),
      path.resolve(PATH_SRC),
    ],
    // alias: {
    //   vue$: 'vue/dist/vue.common.js',
    // },
    extensions: ['*', '.js', '.es6', '.jsx', '.vue', '.css', '.scss', '.sass'],
  },

  devtool: IS_PRODUCTION ? false : 'inline-source-map',

  stats: {
    // copied from `'minimal'`
    all: false,
    modules: true,
    errors: true,
    warnings: true,
    // our additional options
    moduleTrace: true,
    errorDetails: true,
  },

  devServer: {
    static: PATH_SRC, // https://github.com/webpack/webpack-dev-server/issues/2958#issuecomment-757141969
    host: SERVER_HOST,
    port: SERVER_PORT,
    hot: true,
    liveReload: false,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },

  plugins: [
    new ExtractCssChunks({
      filename: `${PATH_BASE}css/[name].css?[hash]`,
      chunkFilename: `${PATH_BASE}css/[name].css?[hash]`,
    }),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new VueLoaderPlugin(),
  ],
};

if (IS_PRODUCTION) {
  config.plugins.push(
    new CleanWebpackPlugin(),
    new WebpackManifestPlugin({
      fileName: path.resolve(PATH_BUILD, 'manifest.json'),
      // basePath: PATH_BASE,
      publicPath: '/',
      writeToFileEmit: true,
      filter: (fileDescr) => fileDescr.isInitial,
    }),
  );
}

module.exports = config;
