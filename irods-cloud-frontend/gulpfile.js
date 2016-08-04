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
var war = require('gulp-war');
var zip = require('gulp-zip');
var shell = require('gulp-shell')

var del = require('del');
var mkdirp = require('mkdirp');

var flatten = require('gulp-flatten');
var rename = require("gulp-rename");


// **************
// *  DEFAULT   *
// *  GULP TASK *
// **************
gulp.task('default', function () {
    gutil.log("Gulp is working!");
    gutil.log("$ gulp help for list of commands");
});


// **************
// *  HELP TASK *
// **************
gulp.task('help', function(){
    gutil.log("$ gulp...");
    gutil.log("backend-clean........cleans backend web-app directory.");
    gutil.log("backend-build........builds backend web-app directory.");
    gutil.log("backend-refresh......refreshes backend web-app directory.");
    gutil.log("backend-sync.........listens for frontend changes and syncs with backend web-app directory.");
    gutil.log("gen-frontend-zip.....generates zip from frontend app directory.");
    gutil.log("gen-war..............generates WAR file from backend web-app directory, and saves it in /build directory.");
    gutil.log("concatCSS............concatinates all CSS files to all.css in the frontend app directory.");
    gutil.log("minifyCSS............minifies all.css file as all.min.css in frontend app directory.");
    gutil.log("concatJS.............concatinates all JS files to all.js in the frontend app directory.");
    gutil.log("minifyJS.............minifies all.js file as all.min.js in the frontend app directory.");
    gutil.log("validateJS...........validates all.js file.");
});


// **************
// *  BACKEND   *
// *  CLEAN     *
// **************
gulp.task('backend-clean', function(){
    return del([
        '../irods-cloud-backend/web-app/*', 
        '../irods-cloud-backend/web-app/*/', 
        '!../irods-cloud-backend/web-app/WEB-INF',
        '!../irods-cloud-backend/web-app/index.html'
    ], {force:true});
});


// **************
// *  BACKEND   *
// *  BUILD     *
// **************
gulp.task('backend-build', function(){
    gulp.src([
        'app/**/*',
        '!app/indexMin/',
        '!app/**/*.js',
        '!app/**/*.css',
        '!app/index.html',
    ]).pipe(gulp.dest('../irods-cloud-backend/web-app'));

    //move CSS files
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
    }, 6000);

    // move JS f
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
    }, 6000);

    gulp.src("../irods-cloud-backend/")
        .pipe(shell([
            'jar -cvf cloudBrowser.war *'
        ],{
            cwd:'../irods-cloud-backend/'
        }));

    setTimeout(function(){
            gulp.src("../irods-cloud-backend/cloudBrowser.war")
                .pipe(gulp.dest('../build/'));
    }, 5000);

    gutil.log("Build complete");

});


// **************
// *  BACKEND   *
// *  REFRESH   *
// **************
gulp.task('backend-refresh', function(){
    // Clear current backend web-app
    del([
        '../irods-cloud-backend/web-app/*', 
        '../irods-cloud-backend/web-app/*/', 
        '!../irods-cloud-backend/web-app/WEB-INF',
        '!../irods-cloud-backend/web-app/index.html'
    ], {force:true});

    setTimeout(function(){},5000);

    // rebuild backend web-app
    gulp.src([
        'app/**/*',
        '!app/indexMin/',
        '!app/**/*.js',
        '!app/**/*.css',
        '!app/index.html',
    ]).pipe(gulp.dest('../irods-cloud-backend/web-app'));

    //move CSS files
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
    }, 6000);

    // move JS f
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
    }, 6000);

    gulp.src("../irods-cloud-backend/web-app/cloudBrowser.war")
        .pipe(shell([
            'jar -cvf cloudBrowser.war *'
        ],{
            cwd:'../irods-cloud-backend/web-app'
        }))
        .pipe(gulp.dest('../build/'));


    gulp.src("../irods-cloud-backend/")
        .pipe(shell([
            'jar -cvf cloudBrowser.war *'
        ],{
            cwd:'../irods-cloud-backend/'
        }));

    setTimeout(function(){
            gulp.src("../irods-cloud-backend/cloudBrowser.war")
                .pipe(gulp.dest('../build/'));
    }, 5000);

});



// **************
// *  BACKEND   *
// *  SYNC      *
// **************
gulp.task('backend-sync', function() {
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


// **************
// *  GENERATE  *
// *  ZIP       *
// **************
gulp.task('gen-frontend-zip', function(){
    gulp.src(["app/*"])
        .pipe(zip('frontEnd.zip'))
        .pipe(gulp.dest("../build"));
});


// **************
// *  GENERATE  *
// *  WAR       *
// **************
gulp.task('gen-war', function(){
    gulp.src("../irods-cloud-backend/")
        .pipe(shell([
            'jar -cvf cloudBrowser.war *'
        ],{
            cwd:'../irods-cloud-backend/'
        }));

        setTimeout(function(){
            gulp.src("../irods-cloud-backend/cloudBrowser.war")
                .pipe(gulp.dest('../build/'));
        }, 5000);
    
});


// **************
// *  CONCAT    *
// *  CSS       *
// **************
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


// **************
// *  MINIFY    *
// *  CSS       *
// **************
gulp.task('minifyCSS', function(){
    return gulp.src('dist/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'));
});


// **************
// *  VALIDATE  *
// *  CSS       *
// **************
// gulp.task('validateCSS', function(){
//     gulp.src('dist/css/*.css')
//         .pipe(validate())
//         .pipe(gulp.dest('dist/css/validate'));
// });


// **************
// * CONCAT     *
// * JAVASCRIPT *
// **************
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


// **************
// *  MINIFY    *
// *  JS        *
// **************
gulp.task('minifyJS', function(){
    return gulp.src('../irods-cloud-backend/web-app/js/all.js')
        .pipe(uglify())
        .pipe(gulp.dest('../irods-cloud-backend/web-app/js'));
});


// **************
// *  VALIDATE  *
// *  JS        *
// **************
gulp.task('validateJS', function(){
    return gulp.src('dist/js/*.js')
        .pipe(jsValidate());
});


