var bower       = require('main-bower-files');
var browserSync = require('browser-sync').create();
var compass     = require('gulp-compass');
var concat      = require('gulp-concat');
var cssnano     = require('gulp-cssnano');
var del         = require('del');
var gulp        = require('gulp');
var modernizr   = require('gulp-modernizr');
var pug         = require('gulp-pug');
var sourcemaps  = require('gulp-sourcemaps');
var uglify      = require('gulp-uglify');

gulp.task('modernizr', function() {
    var modernizrOptions = 
    {
        // Added all options available, this should be "trimmed" to use only
        // what's really required.
        options:
        [
            "domPrefixes",
            "prefixes",
            "addTest",
            "atRule",
            "hasEvent",
            "html5shiv",
            "mq",
            "prefixed",
            "prefixedCSS",
            "prefixedCSSValue",
            "testAllProps",
            "testProp",
            "testStyles",
            "html5shiv",
            "setClasses"
        ],
        tests : [],         // Will include tests that were not automatically added.
        excludeTests: [],   // Will remove tests that are auto added by mistake or just unwanted.
        customeTests: [],   // Currently unavailable @see https://github.com/Modernizr/customizr/issues/22
        crawl: true,        // Enables this plugin to automatically add feature tests by checking JS and SASS files.
        useBuffers: true,
        files:
        {
            src: ['app/scripts/**/*.js', 'app/scripts/sass/**/*.scss']
        }
    }
    return gulp.src('app/scripts/**/*.js')
        .pipe(modernizr(modernizrOptions))
        .pipe(gulp.dest("app/tmp/js/"));
});

//
// concat *.js to vendor.js
//
gulp.task('bower-js', function() {
    return gulp.src(bower(['**/*.js']))
        .pipe(sourcemaps.init())
            .pipe(concat('vendor.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/tmp/js/'));
});

//
// concat *.css to vendor.css
//
gulp.task('bower-css', function() {
    return gulp.src(bower('**/*.css'))
        .pipe(sourcemaps.init())
            .pipe(concat('vendor.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/tmp/css/'));
});

gulp.task('bower', ['bower-css', 'bower-js']);

// process JS files and return the stream.
gulp.task('js', ['modernizr'], function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe(sourcemaps.init())
            .pipe(concat('main.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/tmp/js/'));
});

// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('js-watch', ['js'], browserSync.reload);

gulp.task('compass', function() {
  gulp.src('app/sass/**/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      sass: 'app/sass',
      css: 'app/tmp/css',
      fonts: 'app/fonts',
      images: 'app/images'
    }))
    .pipe(browserSync.stream());
});

gulp.task('pug', function() {
    var pugOptions = {
        filename : '',
        compileDebug : true,
        pretty : true
    }
    return gulp.src('app/views/**.pug')
        .pipe(pug(pugOptions))
        .pipe(gulp.dest('app/tmp/'));
});

gulp.task('pug-watch', ['pug'], function() {
    browserSync.reload();
});

gulp.task('clean', function () {
  return del([
    'app/tmp/**/*'
  ]);
});

// Static Server + watching scss/html files
gulp.task('serve', ['pug', 'compass', 'bower', 'js'], function() {

    browserSync.init({
        server : {
            baseDir: 'app/tmp'
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    // gulp.watch("app/scripts/modernizrCustomTests/*.js", ['js-watch']);
    gulp.watch("app/scripts/**/*.js", ['js-watch']);
    gulp.watch("app/sass/**/*.scss", ['compass']);
    gulp.watch("app/views/*.pug", ['pug-watch']);
});

gulp.task('default', ['clean'], function() {
    gulp.start('serve');
});
