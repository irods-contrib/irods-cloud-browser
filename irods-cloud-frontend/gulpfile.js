/**
 * Created by mconway on 7/20/15.
 */

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
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
    gutil.log("backend-sync.........listens for frontend changes and syncs with backend web-app directory.");
    gutil.log("gen-war..............builds project and generates .war file to be deployed on web server.");
    gutil.log("gen-zip..............generates zip from frontend app directory.");
    gutil.log("concatCSS............concatinates all CSS files to all.css in the frontend app directory.");
    gutil.log("minifyCSS............minifies all.css file as all.min.css in frontend app directory.");
    // gutil.log("concatJS.............concatinates all JS files to all.js in the frontend app directory.");
    // gutil.log("minifyJS.............minifies all.js file as all.min.js in the frontend app directory.");
    // gutil.log("validateJS...........validates all.js file.");
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
    del([
        '../irods-cloud-backend/web-app/*', 
        '../irods-cloud-backend/web-app/*/', 
        '!../irods-cloud-backend/web-app/WEB-INF',
        '!../irods-cloud-backend/web-app/index.html'
    ], {force:true});

    setTimeout(function(){
        // move files from front-end app
        gulp.src([
            'app/**/*',
            '!app/indexMin/',
            '!app/index.html',
            'bower_components/'
        ]).pipe(gulp.dest('../irods-cloud-backend/web-app'));

        gulp.src(['bower_components/**/*'],{base:'./'})
            .pipe(gulp.dest('../irods-cloud-backend/web-app/'));

        gulp.src('../irods-cloud-backend/*/*.css')
            .pipe(cleanCSS())
            .pipe(gulp.dest('../irods-cloud-backend/**/*'));

        // concat CSS files
        setTimeout(function(){
            gulp.src([
                '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/normalize.css',
                '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/main.css',
                '../irods-cloud-backend/web-app/bower_components/angular-message-center/message-center.css',
                '../irods-cloud-backend/web-app/bower_components/codemirror/lib/codemirror.css',
            ])
                .pipe(concat('allBower.css'))
                .pipe(gulp.dest('../irods-cloud-backend/web-app/css/'));
        }, 1500);
        gutil.log("Build complete");
    },5000);
    

});


// **************
// *  BACKEND   *
// *  SYNC      *
// **************
gulp.task('backend-sync', function() {
   // CSS Changes
    gulp.watch("app/**/*.css").on('change', function(){
        gutil.log("CSS save detected");
        // Clear current backend web-app
        del([
            '../irods-cloud-backend/web-app/*', 
            '../irods-cloud-backend/web-app/*/', 
            '!../irods-cloud-backend/web-app/WEB-INF',
            '!../irods-cloud-backend/web-app/index.html'
        ], {force:true});

        // rebuild backend web-app
        setTimeout(function(){
            gulp.src([
                'app/**/*',
                '!app/indexMin/',
                '!app/index.html',
                'bower_components/'
            ]).pipe(gulp.dest('../irods-cloud-backend/web-app'));

            gulp.src(['bower_components/**/*'],{base:'./'})
                .pipe(gulp.dest('../irods-cloud-backend/web-app/'));

            gulp.src('../irods-cloud-backend/*/*.css')
                .pipe(cleanCSS())
                .pipe(gulp.dest('../irods-cloud-backend/**/*'));

            // concat CSS files
            setTimeout(function(){
                gulp.src([
                    '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/normalize.css',
                    '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/main.css',
                    '../irods-cloud-backend/web-app/bower_components/angular-message-center/message-center.css',
                    '../irods-cloud-backend/web-app/bower_components/codemirror/lib/codemirror.css',
                ])
                    .pipe(concat('allBower.css'))
                    .pipe(gulp.dest('../irods-cloud-backend/web-app/css/'));
            },1000);
        }, 1000);
        gutil.log("Build complete");
    });



    // JS Changes
    gulp.watch("app/**/*.js").on('change',function(){
        gutil.log("JS save detected");
        // Clear current backend web-app
        del([
            '../irods-cloud-backend/web-app/*', 
            '../irods-cloud-backend/web-app/*/', 
            '!../irods-cloud-backend/web-app/WEB-INF',
            '!../irods-cloud-backend/web-app/index.html'
        ], {force:true});

        // rebuild backend web-app
        setTimeout(function(){
            gulp.src([
                'app/**/*',
                '!app/indexMin/',
                '!app/index.html',
                'bower_components/'
            ]).pipe(gulp.dest('../irods-cloud-backend/web-app'));

            gulp.src(['bower_components/**/*'],{base:'./'})
                .pipe(gulp.dest('../irods-cloud-backend/web-app/'));

            gulp.src('../irods-cloud-backend/*/*.css')
                .pipe(cleanCSS())
                .pipe(gulp.dest('../irods-cloud-backend/**/*'));

            // concat CSS files
            setTimeout(function(){
                gulp.src([
                    '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/normalize.css',
                    '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/main.css',
                    '../irods-cloud-backend/web-app/bower_components/angular-message-center/message-center.css',
                    '../irods-cloud-backend/web-app/bower_components/codemirror/lib/codemirror.css',
                ])
                    .pipe(concat('allBower.css'))
                    .pipe(gulp.dest('../irods-cloud-backend/web-app/css/'));
                },1000);
            }, 1000);
        gutil.log("Build complete");
    });

    gulp.watch("app/**/*.html").on('change', function(){
        gutil.log("HTML Save Detected");
        // Clear current backend web-app
        del([
            '../irods-cloud-backend/web-app/*', 
            '../irods-cloud-backend/web-app/*/', 
            '!../irods-cloud-backend/web-app/WEB-INF',
            '!../irods-cloud-backend/web-app/index.html'
        ], {force:true});

        // rebuild backend web-app
        setTimeout(function(){
            gulp.src([
                'app/**/*',
                '!app/indexMin/',
                '!app/index.html',
                'bower_components/'
            ]).pipe(gulp.dest('../irods-cloud-backend/web-app'));

            gulp.src(['bower_components/**/*'],{base:'./'})
                .pipe(gulp.dest('../irods-cloud-backend/web-app/'));

            gulp.src('../irods-cloud-backend/*/*.css')
                .pipe(cleanCSS())
                .pipe(gulp.dest('../irods-cloud-backend/**/*'));

            // concat CSS files
            setTimeout(function(){
                gulp.src([
                    '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/normalize.css',
                    '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/main.css',
                    '../irods-cloud-backend/web-app/bower_components/angular-message-center/message-center.css',
                    '../irods-cloud-backend/web-app/bower_components/codemirror/lib/codemirror.css',
                ])
                    .pipe(concat('allBower.css'))
                    .pipe(gulp.dest('../irods-cloud-backend/web-app/css/'));
            }, 1000);
        },2000);
        
        gutil.log("Build complete");
    });
});


// **************
// *  GENERATE  *
// *  WAR FILE  *
// **************
gulp.task('gen-war', function(){
    // Clear current backend web-app
    del([
        '../irods-cloud-backend/web-app/*', 
        '../irods-cloud-backend/web-app/*/', 
        '!../irods-cloud-backend/web-app/WEB-INF',
        '!../irods-cloud-backend/web-app/index.html'
    ], {force:true});

    // rebuild backend web-app
    setTimeout(function(){
        gulp.src([
            'app/**/*',
            '!app/indexMin/',
            '!app/index.html',
            'bower_components/'
        ]).pipe(gulp.dest('../irods-cloud-backend/web-app'));

        gulp.src(['bower_components/**/*'],{base:'./'})
            .pipe(gulp.dest('../irods-cloud-backend/web-app/'));

        gulp.src('../irods-cloud-backend/*/*.css')
            .pipe(cleanCSS())
            .pipe(gulp.dest('../irods-cloud-backend/**/*'));

        // concat CSS files
        setTimeout(function(){
            gulp.src([
                '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/normalize.css',
                '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/main.css',
                '../irods-cloud-backend/web-app/bower_components/angular-message-center/message-center.css',
                '../irods-cloud-backend/web-app/bower_components/codemirror/lib/codemirror.css',
            ])
                .pipe(concat('allBower.css'))
                .pipe(gulp.dest('../irods-cloud-backend/web-app/css/'));
        }, 1000);
    },2000);
    
    setTimeout(function(){
        shell.task([
            'grails war irods-cloud.war'
        ]);

        setTimeout(function(){
             gulp.src("../irods-cloud-backend/irods-cloud.war")
                .pipe(gulp.dest('../build/'));
            gutil.log("Build complete");
            gutil.log("irods-cloud.war is located in /build/ directory.");
        },5000);
    },10000);
});


// **************
// *  GENERATE  *
// *  ZIP       *
// **************
gulp.task('gen-zip', function(){
    // Generate frontend zip
    gulp.src(["app/*"])
        .pipe(zip('frontEnd.zip'))
        .pipe(gulp.dest("../build"));

    // Clean backend
    del([
        '../irods-cloud-backend/web-app/*', 
        '../irods-cloud-backend/web-app/*/', 
        '!../irods-cloud-backend/web-app/WEB-INF',
        '!../irods-cloud-backend/web-app/index.html'
    ], {force:true});

    setTimeout(function(){
        shell.task([
            'grails war irods-cloud-empty.war'
        ]);

        setTimeout(function(){
             gulp.src("../irods-cloud-backend/irods-cloud-backend.war")
                .pipe(gulp.dest('../build/'));
            gutil.log("Build complete");
            gutil.log("irods-cloud-backend.war is located in /build/ directory.");
        },5000);
    }, 5000);

});


// **************
// *  CONCAT    *
// *  CSS       *
// **************
gulp.task('concatCSS', function(){
    gulp.src([
        '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/normalize.css',
        '../irods-cloud-backend/web-app/bower_components/html5-boilerplate/css/main.css',
        '../irods-cloud-backend/web-app/bower_components/angular-message-center/message-center.css',
        '../irods-cloud-backend/web-app/bower_components/codemirror/lib/codemirror.css',
    ])
        .pipe(concat('allBower.css'))
        .pipe(gulp.dest('../irods-cloud-backend/web-app/css/'));

    gulp.src([
        '../irods-cloud-backend/web-app/css/sb-admin.css',
        '../irods-cloud-backend/web-app/css/main.css',
        '../irods-cloud-backend/web-app/app.css'
    ])
        .pipe(concat('allCustom.css'))
        .pipe(gulp.dest('../irods-cloud-backend/web-app/css'));
});


// **************
// *  MINIFY    *
// *  CSS       *
// **************
gulp.task('minifyCSS', function(){
    gulp.src('../irods-cloud-backend/web-app/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('../irods-cloud-backend/web-app/'));

    gulp.src('../irods-cloud-backend/web-app/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('../irods-cloud-backend/web-app/css/'));
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
// gulp.task('concatJS', function(){
//     // add additional files as they are created
//     return gulp.src([
//         'bower_components/codemirror/lib/codemirror.js',
//         'bower_components/codemirror/mode/javascript/javascript.js',
//         'bower_components/codemirror/mode/xml/xml.js',
//         'bower_components/angular/angular.js',
//         'bower_components/angular-route/angular-route.js',
//         'bower_components/angular-animate/angular-animate.js',
//         'bower_components/angular-message-center/message-center.js',
//         'bower_components/ng-context-menu/dist/ng-context-menu.js',
//         'bower_components/angular-message-center/message-center-templates.js',
//         'bower_components/angular-ui-codemirror/ui-codemirror.min.js',
//         'app/js/jquery.js',
//         'app/js/masonry.min.js',
//         'app/js/jquery-ui.js',
//         'app/js/js/uuid.js',
//         'app/js/bootstrap.min.js',
//         'app/app.js',
//         'app/home/home.js',
//         'app/dashboard/dashboard.js',
//         'app/search/search.js',
//         'app/home/fileServices.js',
//         'app/login/login.js',
//         'app/metadata/metadata.js',
//         'app/profile/profile.js',
//         'app/edit/edit.js',
//         'app/components/globals.js',
//         'app/components/httpInterceptors.js',
//         'bower_components/ng-file-upload/ng-file-upload-shim.min.js',
//         'bower_components/ng-file-upload/ng-file-upload.min.js'
//     ])
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest('dist/js'));
// });


// // **************
// // *  MINIFY    *
// // *  JS        *
// // **************
// gulp.task('minifyJS', function(){
//     return gulp.src()
//         .pipe(uglify())
//         .pipe(gulp.dest('../irods-cloud-backend/web-app/js/'));
// });


// // **************
// // *  VALIDATE  *
// // *  JS        *
// // **************
// gulp.task('validateJS', function(){
//     return gulp.src('dist/js/*.js')
//         .pipe(jsValidate());
// });


