'use strict';

const gulp 			= require('gulp');
const sass 			= require('gulp-sass');
const cleancss 		= require('gulp-clean-css');
const autoprefixer 	= require('gulp-autoprefixer');
const babel 		= require('gulp-babel');
const include 		= require('gulp-include');
const uglify 		= require('gulp-uglify');
const concat        = require('gulp-concat');
const sourcemaps    = require('gulp-sourcemaps');
const commonJs      = require('gulp-wrap-commonjs');
const add           = require('gulp-add-src');
const browserSync 	= require('browser-sync');
const bourbon       = require('node-bourbon');
const rev			= require('gulp-rev');
const revDel 		= require('rev-del');

// CONFIG BASE PATH
const resources = 'resources/';
const assets    = resources + 'assets/';
const build     = 'public/';
const styles    = assets + 'stylesheets/';
const scripts   = assets + 'javascripts/';
const images    = assets + 'images/';

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
        watch:          scripts + 'src/**/*.js',
        application:    scripts + 'src/**/*.js',
        vendor:         scripts + 'vendor.js',
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
    fonts: {
        watch: resources + 'fonts/**/*',
        input: resources + 'fonts/**/*',
        output: build + 'fonts/'
    }
};

gulp.task('styles:vendor', function () {
    return gulp.src(paths.styles.vendor)
        .pipe(include())
        .pipe(gulp.dest(paths.styles.output))
        .pipe(browserSync.stream());
});

gulp.task('styles:application', function () {
    return gulp.src(paths.styles.input)
        .pipe(sourcemaps.init())
        .pipe(
			sass({
				includePaths: [
					bourbon.includePaths
				]
			})
			.on('error', sass.logError)
		)
        .pipe(autoprefixer({browsers: ['> 1%'], cascade: false}))
        .pipe(cleancss())
        .pipe(sourcemaps.write('../map'))
        .pipe(gulp.dest(paths.styles.output))
        .pipe(browserSync.stream());
});

gulp.task('styles', ['styles:vendor', 'styles:application']);

gulp.task('scripts:vendor', function () {
    return gulp.src(paths.scripts.vendor)
        .pipe(include())
        .pipe(uglify())
        .pipe(gulp.dest(paths.scripts.output));
});

gulp.task('scripts:application', function () {
    return gulp.src(paths.scripts.application)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015', 'stage-0'],
            plugins: [
                'transform-es2015-modules-commonjs',
                'transform-decorators-legacy'
            ]
        }))
        .pipe(commonJs({
            pathModifier: path => {
                var namespace = path
                    .replace(/.js$/, '')
                    .replace(/\\/g, '/')
                    .replace(/.*?resources\/assets\/javascripts\/src\//, '')
                    .replace(/.*?node_modules\/raid-([a-z]+)\/src\//, (ctx, m) => {
                        return m[0].toUpperCase() + m.substr(1) + '/';
                    });
                console.warn(`    ${path.replace(__dirname + '/resources/javascripts/src/', '')} > ${namespace}`);
                return namespace;
            }
        }))
        .pipe(add.prepend(require.resolve('commonjs-require/commonjs-require')))
        .pipe(add.prepend(require.resolve('babel-polyfill/dist/polyfill')))
        .pipe(concat('application.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('../map'))
        .pipe(gulp.dest(paths.scripts.output));
});

gulp.task('watch:scripts:vendor', ['scripts:vendor'], function (done) {
    gulp.start('version');
    browserSync.reload();
    done();
});
gulp.task('watch:scripts:application', ['scripts:application'], function (done) {
    gulp.start('version');
    browserSync.reload();
    done();
});

gulp.task('scripts', ['scripts:vendor', 'scripts:application']);

gulp.task('html', function () {
    return gulp.src(paths.html.input)
        .pipe(html({ annotations: true, verbose: false }))
        .pipe(gulp.dest(paths.html.output))
});

gulp.task('images', function () {
    return gulp.src(paths.images.input)
        .pipe(gulp.dest(paths.images.output));
});

gulp.task('fonts', function () {
    return gulp.src(paths.fonts.input)
        .pipe(gulp.dest(paths.fonts.output))
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
        proxy: "YOUR_LOCAL_DOMAIN/"
    });
});

gulp.task( 'version' , function () {
    return gulp.src([
                 build + 'css/*.css',
                 build + 'js/*.js'
        ], {base: 'public'})
        .pipe(rev())
        .pipe(gulp.dest( build + 'build'))
        .pipe(rev.manifest())
		.pipe(revDel({ dest : build + 'build' }))
        .pipe(gulp.dest( build + 'build'));
});

gulp.task('watch', ['browserSync'], function() {
    // styles watcher
    gulp.watch(paths.styles.vendor, ['styles:vendor']);
    gulp.watch(paths.styles.watch, ['styles:application']);

    // scripts watcher
    gulp.watch(paths.scripts.vendor, ['watch:scripts:vendor']);
    gulp.watch(paths.scripts.watch, ['watch:scripts:application']);

    // images
    gulp.watch(paths.images.watch, ['watch:images']);

    // php
    gulp.watch(['app/**/*.php','resources/**/*.php'], browserSync.reload);

    // fonts
    gulp.watch(paths.fonts.watch, ['watch:fonts']);
});

gulp.task('build', [
    'styles',
    'scripts',
    'images',
    'fonts'
], function () {
    gulp.start('version')
});

gulp.task('dev', ['build'], function () {
    gulp.start('watch')
});

gulp.task('default', ['build']);