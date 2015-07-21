/**
 * Created by mconway on 7/20/15.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var flatten = require('gulp-flatten');

gulp.task('default', function () {
    // place code for your default task here
});

/**
 * Create a dist subdirectory that has the assembled javascript, css, images, html assets
 */
gulp.task('dist', function () {
    gulp.start('clean', 'vendor-scripts', 'app-scripts', 'css', 'images');

});

gulp.task('clean', function () {
    del(['./dist'], function (err, paths) {
        if (paths) {
            console.log('Deleted files/folders:\n', paths.join('\n'));
        }
    });
});

/**
 * assemble all vendor javascripts into a 'vendor.js'
 */
gulp.task('vendor-scripts', function () {
    return gulp.src(['./bower_components/angular/angular.min.js', './bower_components/jquery/dist/jquery.min.js',
        './bower_components/angular-route/angular-route.js', './bower_components/masonry/dist/masonry.pkgd.min.js',
        './bower_components/jquery-ui/jquery-ui.min.js',
        './bower_components/jquery-mobile/jquery.mobile.js',
        './bower_components/bootstrap/dist/js/bootstrap.min.js',
        './bower_components/angular-animate/angular-animate.min.js', './bower_components/angular-message-center/dist/message-center.min.js',
        './bower_components/angular-message-center/message-center-templates.jss',
        './bower_components/ng-file-upload/ng-file-upload-shim.min.js',
        './bower_components/ng-file-upload/ng-fil-upload.min.js'])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('./dist/js'));
});

/**
 * assemble all application code javascripts into an 'app.js'
 */
gulp.task('app-scripts', function () {
    return gulp.src(['./app/components/*.js',
        './app/home/*.js', './app/login/*.js', './app/metadata/*.js',
        './app/profile/*.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./dist/js'));
});

/**
 * assemble and minify all css assets
 */

gulp.task('css', function () {
        return gulp.src(['./app/app.css',
            './bower_components/html5-boilerplate/css/*.css',
            './bower_components/angular-message-center/message-center.css',
            './bower_components/bootstrap/dist/css/bootstrap.min.css',
            './app/sb-admin.css',
            './app/css/main.css'
        ])
            .pipe(concat('app.css'))
            .pipe(gulp.dest('./dist/css'));

});

/**
 * assemble all images into the images dir in the dist */
gulp.task('images', function () {
    // the base option sets the relative root for the set of files,
    // preserving the folder structure
    var filesToMove = [
        './app/images/*.*'
    ];
    return gulp.src(filesToMove, { base: './' }).pipe(flatten())
        .pipe(gulp.dest('./dist/images'));
});
