'use strict';

const gulp             = require('gulp');
const sass             = require('gulp-sass');
const cleancss         = require('gulp-clean-css');
const autoprefixer     = require('gulp-autoprefixer');
const include          = require('gulp-include');
const uglify           = require('gulp-uglify');
const concat           = require('gulp-concat');
const sourcemaps       = require('gulp-sourcemaps');
const add              = require('gulp-add-src');
const gutil            = require('gulp-util');
const nunjucksRender   = require('gulp-nunjucks-render');
const rev              = require('gulp-rev');
const revDel           = require('rev-del');
const browserSync      = require('browser-sync');
const bourbon          = require('node-bourbon');
const reset            = require('node-reset-scss');
const browserify       = require('browserify');
const babelify         = require('babelify');
const vinylStream      = require('vinyl-source-stream');
const vinylBuffer      = require('vinyl-buffer');
const ftp              = require('vinyl-ftp');

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
        output: build
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
        input: fonts + 'fonts/**/*.*',
        output: build + 'fonts/'
    }
};

function onError(error){
    gutil.log(gutil.colors.red('[Compilation Error]'));
    gutil.log(gutil.colors.red(error));
    this.emit('end');
}

gulp.task('styles:vendor', function () {
    return gulp.src(paths.styles.vendor)
        .pipe(include())
        .pipe(gulp.dest(paths.styles.output))
        .pipe(browserSync.stream({ match: "**/*.css" }));
});

gulp.task('styles:application', function () {
    return gulp.src(paths.styles.input)
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                includePaths: [
                    bourbon.includePaths,
                    reset.includePath
                ]
            })
            .on('error', sass.logError)
        )
        .pipe(autoprefixer({browsers: ['> 1%'], cascade: false}))
        .pipe(cleancss())
        .pipe(sourcemaps.write('../map'))
        .pipe(gulp.dest(paths.styles.output))
        .pipe(browserSync.stream({ match: "**/*.css" }));
});

gulp.task('watch:styles:vendor', ['styles:vendor'], function (done) {
    // revVersion();
    done();
});
gulp.task('watch:styles:application', ['styles:application'], function (done) {
    // revVersion();
    done();
});

gulp.task('styles', ['styles:vendor', 'styles:application']);

gulp.task('scripts', function () {
    return browserify({
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
        .pipe(gulp.dest(paths.scripts.output));
});

gulp.task('watch:scripts', ['scripts'], function (done) {
    // revVersion();
    browserSync.reload();
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
        }
    });
});

const revVersion = function(){
    return gulp.src([
                 build + 'css/*.css',
                 build + 'js/*.js'
        ], {base: 'public'})
        .pipe(rev())
        .pipe(gulp.dest( build + 'build'))
        .pipe(rev.manifest())
        .pipe(revDel({ dest : build + 'build' }))
        .pipe(gulp.dest( build + 'build'));
}

gulp.task( 'version' , function () {
    return revVersion();
});

gulp.task('watch', ['browserSync'], function() {
    // styles watcher
    gulp.watch(paths.styles.vendor, ['styles:vendor']);
    gulp.watch(paths.styles.watch, ['styles:application']);

    // scripts watcher
    gulp.watch(paths.scripts.watch, ['watch:scripts']);

    // images
    gulp.watch(paths.images.watch, ['watch:images']);

    // html
    gulp.watch(paths.html.watch, ['watch:html']);

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
    'html',
    'images',
    'fonts',
    'server:config'
]);

gulp.task('dev', ['build'], function(){
    gulp.start('watch')
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
        build + '/js/*',
        build + '*.html',
    ];

    return gulp.src(globs, { base: build, buffer: false })
        .pipe(conn.newer('DIR'))
        .pipe(conn.dest('DIR'));

});