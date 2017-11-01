'use strict';
const path              = require('path');
const gulp              = require('gulp');
const gutil             = require('gulp-util');
const webpack           = require('webpack');
const webpackDevServer  = require('webpack-dev-server');
const ftp               = require('vinyl-ftp');


const config = {
    build: 'build',
    src: 'resources',

    deploy: {
        dev: {
            host:       'HOST',
            user:       'USER',
            password:   'PASS',
            dir:        'DIR'
        },
        prod:{
            host:       'HOST',
            user:       'USER',
            password:   'PASS',
            dir:        'DIR'
        }
    }
};

gulp.task("webpack", function(callback) {
    // run webpack
    process.env.NODE_ENV = 'production';
    process.env.ASSET_PATH = './';

    let webpackConfig     = require('./webpack.config');

    let prodWebpackConfig = Object.create(webpackConfig);
    prodWebpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: 'source-map'
        })
    );

    webpack(webpackConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});

gulp.task("webpack-dev-server", function(callback) {

    let SERVER_HOST = 'localhost';
    let SERVER_PORT = 3000;

    process.env.NODE_ENV = 'development';
    process.env.ASSET_PATH = `http://${SERVER_HOST}:${SERVER_PORT}/`;

    let webpackConfig     = require('./webpack.config');

    // modify some webpack config options
    let devWebpackConfig = Object.create(webpackConfig);
    devWebpackConfig.devtool = "eval";
    devWebpackConfig.entry.app.unshift(`webpack-dev-server/client?http://${SERVER_HOST}:${SERVER_PORT}/`);
    devWebpackConfig.entry.app.unshift("webpack/hot/dev-server");
    devWebpackConfig.plugins.push( new webpack.HotModuleReplacementPlugin() );

    let compiler = webpack(devWebpackConfig);

    // Start a webpack-dev-server
    new webpackDevServer(compiler, {
        // server and middleware options
        inline: true,
        hot: true,
        contentBase: path.resolve(__dirname, 'resources'),
        stats: {
            colors: true
        }
    }).listen(SERVER_PORT, SERVER_HOST, function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        // Server listening
        gutil.log("[webpack-dev-server]", `http://${SERVER_HOST}:${SERVER_PORT}/`);

        // keep the server alive or continue?
        // callback();
    });
});

gulp.task('dev', ['webpack-dev-server']);

gulp.task('build', ['webpack']);

gulp.task('deploy:dev', ['build'], function () {
    const conn = ftp.create({
        host:     config.deploy.dev.host,
        user:     config.deploy.dev.user,
        password: config.deploy.dev.password,
        parallel: 10
    });
    const globs = [
        config.build + '/**/*',
    ];
    return gulp.src(globs, { base: build, buffer: false })
        .pipe(conn.newer(config.deploy.dev.dir))
        .pipe(conn.dest(config.deploy.dev.dir));
});

gulp.task('deploy:prod', ['build'], function () {
    const conn = ftp.create({
        host:     config.deploy.prod.host,
        user:     config.deploy.prod.user,
        password: config.deploy.prod.password,
        parallel: 10
    });
    const globs = [
        config.build + '/**/*',
    ];
    return gulp.src(globs, { base: build, buffer: false })
        .pipe(conn.newer(config.deploy.prod.dir))
        .pipe(conn.dest(config.deploy.prod.dir));
});