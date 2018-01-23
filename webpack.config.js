const path = require('path');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const ASSET_PATH = process.env.ASSET_PATH;


const extractSass = new ExtractTextPlugin({
    filename: 'css/[name].css',
    disable: (process.env.NODE_ENV === 'development')
});

const sassExtractor = () => {
    return ['css-hot-loader'].concat(extractSass.extract({
        use: [{
            loader: "css-loader",
            options: {
                sourceMap: true,
                root: path.resolve(__dirname, 'resources'),
                minimize: (process.env.NODE_ENV === 'production')
            }
        }, {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
            plugins: [
              //require('postcss-import')({ root: loader.resourcePath }),
              //require('postcss-cssnext')(),
              autoprefixer({
                browsers:['ie >= 9', 'last 4 version', "> 1%"]
              }),
              //require('cssnano')()
            ]
          }
        }, {
            loader: "sass-loader",
            options: {
                sourceMap: true,
                includePaths: [
                    'node_modules/',
                    require('node-bourbon').includePaths,
                    require('node-reset-scss').includePath
                ]
            }
        }],
        fallback: "style-loader"
    }))
};

module.exports = {
    context: path.resolve(__dirname, 'resources'),
    entry: {
        app: [ path.resolve(__dirname, 'resources', 'index.js') ]
    },
    output: {
        filename: 'js/app.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: ASSET_PATH
    },
    stats: { //object
        assets: true,
        colors: true,
        errors: true,
        errorDetails: true,
        hash: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ["env"]
                }
            },{
                test: /\.(jpe?g|png|gif|svg|ico)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]'
                        }
                    }
                ],
                exclude: [path.resolve(__dirname, 'resources', 'assets', 'fonts')]
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)(\?.*$|$)/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'fonts/[name].[ext]',
                            publicPath: '../'
                        }
                    }
                ],
                include: [
                    path.resolve(__dirname, 'node_modules'),
                    path.resolve(__dirname, 'resources', 'assets', 'fonts')
                ]
            },
            {test: /\.sass$/, use: sassExtractor()},
            {test: /\.scss$/, use: sassExtractor()},
            {test: /\.css$/, use: sassExtractor()},
            {
                test: /\.njk$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].html'
                        }
                    }, {
                        loader: 'extract-loader'
                    }, {
                        loader: "html-loader",
                        options: {
                            ignoreCustomFragments: [/\{\{.*?}}/],
                            root: path.resolve(__dirname, 'resources'),
                            interpolate: 'require',
                            attrs: ['img:src']
                        }
                    }, {
                        loader: 'nunjucks-html-loader',
                        query: {
                            searchPaths:  [
                                path.resolve(__dirname, 'resources', 'views')
                            ],
                            context:{
                                hash: (new Date()).getTime().toString('16')
                            }
                        }
                    }
                ]
            }
        ]
    },

    resolve: {
        // options for resolving module requests
        // (does not apply to resolving to loaders)

        modules: [
            path.resolve(__dirname, "node_modules"),
            path.resolve(__dirname, "resources")
        ],
        // directories where to look for modules

        extensions: ['.js','.es6', '.css', '.scss', '.sass']
    },

    devtool: "source-map",

    plugins: [
        extractSass,
        new CleanWebpackPlugin(['build'])
    ]
};
