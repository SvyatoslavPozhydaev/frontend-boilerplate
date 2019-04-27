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
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

/**
 * Webpack server config
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SERVER_HOST = 'localhost';
const SERVER_PORT = 3000;

/**
 * Webpack config variables
 */
const PATH_BASE = '/';
const PATH_ASSET = IS_PRODUCTION ? PATH_BASE : `http://${SERVER_HOST}:${SERVER_PORT}${PATH_BASE}`;
const PATH_SRC = path.resolve(__dirname, 'src');
const PATH_BUILD = path.resolve(__dirname, 'build');
const PATH_PUBLIC = path.resolve(__dirname, 'build');

/**
 * Функция обработки файлов стилей
 *
 * @param {boolean} isLoadResources - флаг использования sass-resources-loader
 * @param {boolean} isSassSyntax - флаг использования синтаксиса sass
 * @returns {any[]}
 */
const styleLoader = (isLoadResources = true, isSassSyntax = true) => {
  const loaders = [
    {
      loader: ExtractCssChunks.loader,
      options: {
        // if you want HMR - we try to automatically inject hot
        // reloading but if it's not working, add it to the config
        hot: !IS_PRODUCTION,
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
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
        indentedSyntax: isSassSyntax,
        includePaths: [
          path.resolve(__dirname, 'node_modules/'),
          PATH_SRC,
        ],
      },
    },
  ];

  if (isLoadResources) {
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
    filename: 'js/[name].js?[hash]',
    chunkFilename: 'js/[name].js?[hash]',
    path: PATH_BUILD,
    publicPath: PATH_ASSET,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          sourceMap: true,
          output: {
            comments: false,
          },
        },
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
        exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file),
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name]-[hash:8].[ext]',
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
              name: 'images/[name]-[hash:8].[ext]',
              publicPath: './',
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
              name: 'fonts/[name]-[hash:8].[ext]',
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
        use: styleLoader(),
      },
      {
        test: /\.scss$/,
        use: styleLoader(true, false),
      },
      {
        test: /\.css$/,
        use: styleLoader(false, false),
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
                },
              }, {
                loader: 'extract-loader',
              }, {
                loader: 'html-loader',
                options: {
                  root: path.resolve(PATH_SRC),
                  attrs: ['img:src'],
                  interpolate: 'require',
                },
              },
              {
                loader: 'pug-html-loader',
                options: {
                  basedir: path.resolve(PATH_SRC),
                  pretty: '    ',
                  data: {
                    hash: (new Date()).getTime().toString('16'),
                  },
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

  devtool: IS_PRODUCTION ? 'none' : 'inline-cheap-source-map',

  stats: {
    // copied from `'minimal'`
    all: false,
    modules: true,
    maxModules: 0,
    errors: true,
    warnings: true,
    // our additional options
    moduleTrace: true,
    errorDetails: true,
  },

  devServer: {
    stats: {
      // copied from `'minimal'`
      all: false,
      modules: true,
      maxModules: 0,
      errors: true,
      warnings: true,
      // our additional options
      moduleTrace: true,
      errorDetails: true,
    },
    clientLogLevel: 'error',
    host: SERVER_HOST,
    port: SERVER_PORT,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: path.resolve(PATH_SRC),
  },

  plugins: [
    new ExtractCssChunks({
      filename: 'css/[name].css?[hash]',
      chunkFilename: 'css/[name].css?[hash]',
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
    new ManifestPlugin({
      fileName: path.resolve(PATH_PUBLIC, 'manifest.json'),
      publicPath: PATH_ASSET,
      writeToFileEmit: true,
    }),
  );
}

module.exports = config;
