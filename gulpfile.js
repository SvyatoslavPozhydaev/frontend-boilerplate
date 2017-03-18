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
const ftp 			= require('vinyl-ftp');
const bourbon       = require('node-bourbon');
const reset         = require('node-reset-scss');
const gutil         = require('gulp-util');
const nunjucksRender 	= require('gulp-nunjucks-render');
const rev			= require('gulp-rev');
const revDel 		= require('rev-del');

// CONFIG BASE PATH
const resources = 'resources/';
const assets    = resources + 'assets/';
const build     = 'build/';
const styles    = assets + 'stylesheets/';
const scripts   = assets + 'javascripts/';
const images    = assets + 'images/';
const fonts 	= assets + 'fonts/';

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
    html: {
        watch: resources + 'views/**/*.html',
        input: resources + 'views/pages/*.html',
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
        })
        .on('error', function (error) {
            gutil.log(gutil.colors.red('[Compilation Error]'));
            gutil.log(gutil.colors.red(error));
            this.emit('end');
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
    // revVersion();
    browserSync.reload();
    done();
});
gulp.task('watch:scripts:application', ['scripts:application'], function (done) {
    // revVersion();
    browserSync.reload();
    done();
});

gulp.task('scripts', ['scripts:vendor', 'scripts:application']);

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
    gulp.watch(paths.scripts.vendor, ['watch:scripts:vendor']);
    gulp.watch(paths.scripts.watch, ['watch:scripts:application']);

    // images
    gulp.watch(paths.images.watch, ['watch:images']);

    // html
    gulp.watch(paths.html.watch, ['watch:html']);

    // fonts
    gulp.watch(paths.fonts.watch, ['watch:fonts']);
});

gulp.task('build', [
    'styles',
    'scripts',
    'html',
    'images',
    'fonts'
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