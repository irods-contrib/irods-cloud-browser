/**
 * Created by mconway on 7/20/15.
 */

var gulp = require('gulp');
var gutil = require('gulp-util');
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
    return gulp.task1;
});

gulp.task('task1', function(){
    gutil.log('Hello world from task1!');
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
   // CSS Changes
    gulp.watch("app/*/*.css").on('change', function(){
        gutil.log("CSS save detected");

        // concat
        var css = gulp.src([
            'app/css/*.css',
            'app/app.css',
            'bower_components/html5-boilerplate/css/normalize.css',
            'bower_components/html5-boilerplate/css/main.css',
            'bower_components/angular-message-center/message-center.css',
            'bower_components/codemirror/lib/codemirror.css',
        ])
            .pipe(concat('all.min.css'))
            .pipe(gulp.dest('../irods-cloud-backend/web-app/css'));

        //wait and minify
        setTimeout(function(){
            gulp.src('../irods-cloud-backend/web-app/css/all.min.css')
                .pipe(cleanCSS())
                .pipe(gulp.dest('../irods-cloud-backend/web-app/css')); 
            gutil.log("CSS updated");
        }, 6000);

        // var minCSS = gulp.src('../irods-cloud-backend/web-app/css/all.min.css')
        //     .pipe(cleanCSS())
        //     .pipe(gulp.dest('../irods-cloud-backend/web-app/css'));        
        
        gutil.log("CSS updated");
    });



    // JS Changes
    gulp.watch("app/*/*.js").on('change',function(){
        gutil.log("JS save detected");

        //concat
        var js = gulp.src([
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
            'bower_components/ng-file-upload/ng-file-upload-shim.min.js',
            'bower_components/ng-file-upload/ng-file-upload.min.js',
            'app/*/*.js'
        ])
            .pipe(concat('all.min.js'))
            .pipe(gulp.dest('../irods-cloud-backend/web-app/js'));
        
        //wait and minify
        setTimeout(function(){
            gulp.src('../irods-cloud-backend/web-app/js/all.min.js')
                .pipe(uglify())
                .pipe(gulp.dest('../irods-cloud-backend/web-app/js'));
                gutil.log("JS updated");
        }, 6000);
    });

    // HTML Changes
    gulp.watch("app/*/*.html").on('change',browserSync.reload);
});

gulp.task('minifyCSS', function(){
    return gulp.src('../irods-cloud-backend/web-app/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('../irods-cloud-backend/web-app/css'));
});

// gulp.task('validateCSS', function(){
//     gulp.src('dist/css/*.css')
//         .pipe(validate())
//         .pipe(gulp.dest('dist/css/validate'));
// });

gulp.task('concatJS', function(){
    // add additional files as they are created
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
    return gulp.src('../irods-cloud-backend/web-app/js/all.js')
        .pipe(uglify())
        .pipe(gulp.dest('../irods-cloud-backend/web-app/js'));
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
