'use strict';
const gulp             = require('gulp');
const sass             = require('gulp-sass');
const cleancss         = require('gulp-clean-css');
const autoprefixer     = require('gulp-autoprefixer');
const uglify           = require('gulp-uglify');
const concat           = require('gulp-concat');
const sourcemaps       = require('gulp-sourcemaps');
const add              = require('gulp-add-src');
const gutil            = require('gulp-util');
const nunjucksRender   = require('gulp-nunjucks-render');
const rev              = require('gulp-rev');           // <--- for Laravel elixir helper
const revDel           = require('rev-del');            // <--- for Laravel elixir helper
const browserSync      = require('browser-sync');
const bourbon          = require('node-bourbon');
const reset            = require('node-reset-scss');
const browserify       = require('browserify');
const babelify         = require('babelify');
const vinylStream      = require('vinyl-source-stream');
const vinylBuffer      = require('vinyl-buffer');
const ftp              = require('vinyl-ftp');
const watchify         = require('watchify');
const gulpif           = require('gulp-if');
// CONFIG BASE PATH
const resources = 'resources/';
const assets    = resources + 'assets/';
const build     = 'build/';
const styles    = assets + 'stylesheets/';
const scripts   = assets + 'javascripts/';
const images    = assets + 'images/';
const fonts     = assets + 'fonts/';
// CONFIG ALL PATH
const paths = {
    styles: {
        watch: [
            styles + '**/*.scss',
            styles + '**/*.sass'
        ],
        vendor: styles + 'vendor.css',
        input:  styles + 'sass/application.sass',
        output: build +'css/'
    },
    scripts: {
        watch:          scripts + '**/*.js',
        application:    scripts + 'Application.js',
        output:         build + 'js/'
    },
    images: {
        watch: [
            images + '**/*.jpg',
            images + '**/*.jpeg',
            images + '**/*.png',
            images + '**/*.gif',
            images + '**/*.bmp',
            images + '**/*.svg',
        ],
        input: images + '**/*.*',
        output: build + 'images/'
    },
    html: {
        watch: resources + 'views/**/*.njk',
        input: resources + 'views/pages/*.njk',
        output: 'build/'
    },
    fonts: {
        watch: [
            fonts + '**/*.otf',
            fonts + '**/*.ttf',
            fonts + '**/*.eot',
            fonts + '**/*.woff',
            fonts + '**/*.woff2',
            fonts + '**/*.svg',
            fonts + '**/*.css',
        ],
        input: fonts + '**/*',
        output: build + 'fonts/'
    }
};
function onError(error){
    gutil.log(gutil.colors.red('[Compilation Error]'));
    gutil.log(gutil.colors.red(error));
    this.emit('end');
}
gulp.task('styles', function () {
    return gulp.src(paths.styles.input)
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                includePaths: [
                    'node_modules/',
                    bourbon.includePaths,
                    reset.includePath
                ]
            })
                .on('error', sass.logError)
        )
        .pipe(autoprefixer({browsers: ['> 1%'], cascade: false}))
        .pipe(cleancss())
        .pipe(sourcemaps.write('../map'))
        // .pipe(sourcemaps.write('../map', { sourceMappingURLPrefix: '../..' }))           // <-- for Laravel
        .pipe(gulp.dest(paths.styles.output))
        .pipe(browserSync.stream({ match: "**/*.css" }));
});
gulp.task('watch:styles', ['styles'], function (done) {
    // revVersion();    // <--- for Laravel elixir helper
    done();
});

function scriptsFunc(watch) {
    let bundler, rebundle;
    bundler = browserify({
        extensions: ['.js'],
        entries: paths.scripts.application,
        debug: true,
        //basedir: __dirname,
        cache: {}, // required for watchify
        packageCache: {}, // required for watchify
        fullPaths: watch // required to be true only for watchify
    });
    bundler.transform(babelify.configure({
        presets: ["es2015", 'es2016', 'stage-0']
    }));

    if(watch) {
        bundler = watchify(bundler, {
            delay: 10,
        })
    }

    rebundle = function() {
        gutil.log(gutil.colors.green('[Start Script]'));
        let stream = bundler.bundle();

        return stream.on('error', onError)
            .pipe(vinylStream('application.js'))
            .pipe(vinylBuffer()) // for using other gulp plugins
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(gulpif(!watch, uglify() ))
            .pipe(sourcemaps.write('../map'))
            .pipe(gulp.dest(paths.scripts.output))
            .on('end', function () {
                gutil.log(gutil.colors.green('[Stop Script]'));
            })
            .pipe(browserSync.stream());
    };

    bundler.on('update', rebundle);
    return rebundle();
}
gulp.task('scriptsWatch', function () {
    return scriptsFunc(true);
});

gulp.task('scripts', function () {
    return scriptsFunc(false);
    /*return browserify({
        extensions: ['.js'],
        entries: paths.scripts.application,
        debug: true,
    })
        .transform(babelify.configure({
                presets: ["es2015", 'es2016', 'stage-0']
            })
        )
        .bundle()
        .on("error", onError)
        .pipe(vinylStream('application.js'))
        .pipe(vinylBuffer()) // for using other gulp plugins
        .pipe(sourcemaps.init({ loadMaps: true }))
        //.pipe(add.prepend(require.resolve('babel-polyfill/dist/polyfill')))
        //.pipe(concat('application.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('../map'))
        //.pipe(sourcemaps.write('../map',{ sourceMappingURLPrefix: '../..' }))         <-- for Laravel
        .pipe(gulp.dest(paths.scripts.output));*/
});
gulp.task('watch:scripts', ['scripts'], function (done) {
    // revVersion();        // <--- for Laravel elixir helper
    done();
});
gulp.task('html', function () {
    return gulp.src(paths.html.input)
        .pipe(nunjucksRender({
            path: resources + '/views/'
        }).on('error', onError))
        .pipe(gulp.dest(paths.html.output));
});
gulp.task('images', function () {
    return gulp.src(paths.images.input)
        .pipe(gulp.dest(paths.images.output));
});
gulp.task('fonts', function () {
    return gulp.src(paths.fonts.input)
        .pipe(gulp.dest(paths.fonts.output))
});
gulp.task('watch:html', ['html'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('watch:images', ['images'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('watch:fonts', ['fonts'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: build,
        },
        // proxy: 'LOCAL_HOST'
    });
});
const revVersion = function(){
    return gulp.src([
        build + 'css/*.css',
        build + 'js/*.js'
    ], {base: build })
        .pipe(rev())
        .pipe(gulp.dest( build + 'build'))
        .pipe(rev.manifest())
        .pipe(revDel({ dest : build + 'build' }))
        .pipe(gulp.dest( build + 'build'))
        .pipe(browserSync.stream());
};
gulp.task( 'version' , function () {
    return revVersion();
});
gulp.task('watch', ['browserSync'], function() {
    // styles watcher
    gulp.watch(paths.styles.watch, ['watch:styles']);
    // scripts watcher
    //gulp.watch(paths.scripts.watch, ['watch:scripts']);
    // images
    gulp.watch(paths.images.watch, ['watch:images']);
    // html
    gulp.watch(paths.html.watch, ['watch:html']);
    // php
    // gulp.watch(['resources/**/*.php', 'app/**/*.php'], browserSync.reload);
    // fonts
    gulp.watch(paths.fonts.watch, ['watch:fonts']);
});
gulp.task('server:config', function(){
    return gulp.src( [
        resources + 'server/**/*.*',
        resources + 'server/.htaccess',
    ])
        .pipe(gulp.dest( build ));
});
gulp.task('build', [
    'styles',
    'scripts',
    'images',
    'fonts',
    'html'
    //'server:config'
], function () {
    // revVersion();        // <--- for Laravel elixir helper
});

gulp.task('dev', [
    'styles',
    'scriptsWatch',
    'images',
    'fonts',
    'html'
    //'server:config'
], function(){
    gulp.start('watch');
});

gulp.task('default', ['build']);

gulp.task('deploy', function () {
    const conn = ftp.create({
        host:     'HOST',
        user:     'USER',
        password: 'PASS',
        parallel: 10
    });
    const globs = [
        build + 'fonts/**/*',
        build + 'images/**/*',
        build + 'css/*',
        build + 'js/*',
        build + '*.html',
    ];
    return gulp.src(globs, { base: build, buffer: false })
        .pipe(conn.newer('DIR'))
        .pipe(conn.dest('DIR'));
});