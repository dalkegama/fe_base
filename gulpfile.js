var gulp = require('gulp'),
    sass = require('gulp-sass'),
    clean = require('gulp-rimraf'),
    rename = require('gulp-rename'),
    minify = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    browser_sync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify');

var bases = {
    app: 'src/',
    dist: 'dist/'
};

var paths = {
    scripts: [
        'src/js/*.js'
    ],
    libs: [
        'components/jquery/dist/jquery.js'
    ],
    styles: [
        'src/scss/*.scss'
    ],
    images: [
        'src/images/*'
    ]
};

// Delete the dist directory
gulp.task('clean', function() {
    return gulp.src(bases.dist)
        .pipe(clean());
});

/*
Compiling all the Stylesheets of the project
 */
gulp.task('styles',function(){
    return gulp.src(paths.styles)
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler: notify.onError("\n SCSS Error: <%= error.message %>,\n Line: <%= error.line %> : Col: <%= error.column %> ",function(){
                this.emit('end');
            })
        }))
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(notify({
            message: "Style task completed"
        }))
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest(bases.dist+'/css'))
        .pipe(browser_sync.stream());
});

/*
 Compiling all the scripts of the project and concat them
 */
gulp.task('scripts',function(){
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(plumber({
            errorHandler: notify.onError("\n JS Error: <%= error.message %> ",function(){
                this.emit('end');
            })
        }))
        //.pipe(jshint('.jshintrc'))
        //.pipe(jshint.reporter('default'))
        .pipe(notify({
            message:"JavaScript task completed"
        }))
        .pipe(sourcemaps.write('/'))
        //.pipe(concat())
        .pipe(gulp.dest(bases.dist+'/js'))
});

/*
 Minify PNG, JPEG, GIF and SVG images
 */
gulp.task('imagemin', function () {
    return gulp.src(paths.images)
        .pipe(plumber({
            errorHandler: notify.onError("\n Image Min Error: <%= error.message %> ",function(){
                this.emit('end');
            })
        }))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(notify({
            message:"Image Min task completed"
        }))
        .pipe(gulp.dest(bases.dist+'/images'));
});

/*
 Minification of CSS and JS files
 */
gulp.task('minify',function(){
    gulp.src('dist/css/*.css')
        .pipe(minify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({
            message:"CSS minification completed"
        }));

    gulp.src('dist/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({
            message:"JavaScript minification completed"
        }));
});

/* Prepare Browser-sync for localhost */
gulp.task('browser-sync', function() {
    browser_sync.init(['dist/css/*.css', 'dist/js/*.js'], {

        proxy: 'arf.local'
        /* For a static server you would use this: */
        /*
         server: {
         baseDir: './'
         }
         */
    });
});

/*
 Watching for changes within the project(SCSS,JS and Images)
 */
gulp.task('watch',['styles','browser-sync'],function(){
    // Watch .scss files
    gulp.watch(paths.styles,['styles']);

    // Watch .js files
    gulp.watch(paths.scripts,['scripts']);

    // Watch image files
    gulp.watch(paths.images,['images']);

    /* Watch .html files, run the bs-reload task on change. */
    gulp.watch("*.html").on('change', browser_sync.reload);
});

/*
 Gulp default tasks
 */
gulp.task('default', ['styles'], function() {

});