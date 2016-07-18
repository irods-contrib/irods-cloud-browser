/**
 * Created by mconway on 7/20/15.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
// var validate = require('gulp-w3c-css');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var jsValidate = require('gulp-jsvalidate');
var browserSync = require('browser-sync').create();

var del = require('del');
var flatten = require('gulp-flatten');
var rename = require("gulp-rename");

gulp.task('default', function () {

});

gulp.task('concatCSS', function(){
    return gulp.src([
        'app/css/*.css',
        'app/app.css',
        'bower_components/html5-boilerplate/css/normalize.css',
        'bower_components/html5-boilerplate/css/main.css',
        'bower_components/angular-message-center/message-center.css',
        'bower_components/codemirror/lib/codemirror.css',
    ])
        .pipe(concat('all.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('browser-sync', function() {
    // For static server, 
    browserSync.init({
        server: {
            baseDir: "./app/"
        }
    });
    gulp.watch("app/*/*.css");
    gulp.watch("app/*/*.js");
    gulp.watch("app/*/*.html").on('change',browserSync.reload);
});

gulp.task('minifyCSS', function(){
    return gulp.src('dist/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'));
});

// gulp.task('validateCSS', function(){
//     gulp.src('dist/css/*.css')
//         .pipe(validate())
//         .pipe(gulp.dest('dist/css/validate'));
// });

gulp.task('concatJS', function(){
    return gulp.src([
        'bower_components/codemirror/lib/codemirror.js',
        'bower_components/codemirror/mode/javascript/javascript.js',
        'bower_components/codemirror/mode/xml/xml.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/angular-message-center/message-center.js',
        'bower_components/ng-context-menu/dist/ng-context-menu.js',
        'bower_components/angular-message-center/message-center-templates.js',
        'bower_components/angular-ui-codemirror/ui-codemirror.min.js',
        'app/js/jquery.js',
        'app/js/masonry.min.js',
        'app/js/jquery-ui.js',
        'app/js/js/uuid.js',
        'app/js/bootstrap.min.js',
        'app/app.js',
        'app/home/home.js',
        'app/dashboard/dashboard.js',
        'app/search/search.js',
        'app/home/fileServices.js',
        'app/login/login.js',
        'app/metadata/metadata.js',
        'app/profile/profile.js',
        'app/edit/edit.js',
        'app/components/globals.js',
        'app/components/httpInterceptors.js',
        'bower_components/ng-file-upload/ng-file-upload-shim.min.js',
        'bower_components/ng-file-upload/ng-file-upload.min.js'
    ])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('minifyJS', function(){
    return gulp.src('dist/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('validateJS', function(){
    return gulp.src('dist/js/*.js')
        .pipe(jsValidate());
});


/**
 * Package the web artifacts for deployment within the cloud browser backend war file
 */
gulp.task('distToWar', ['dist'], function () {
    /*
    dist has been created, copy contents of dist up to war file via relative paths
     */
   return gulp.src(['./dist/**'])//.pipe(flatten({ includeParents: 1} ))
        .pipe(gulp.dest('../irods-cloud-backend/web-app'));
});


/**
 * assemble all images into the images dir in the dist
 */
gulp.task('images',  ['clean'], function () {
    // the base option sets the relative root for the set of files,
    // preserving the folder structure
    var filesToMove = [
        './app/images/*.*'
    ];

    return gulp.src(filesToMove, {base: './'}).pipe(flatten())
        .pipe(gulp.dest('./dist/images'));
});
