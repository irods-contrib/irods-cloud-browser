/**
 * Created by mconway on 7/20/15.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');


gulp.task('default', function() {
    // place code for your default task here
});

gulp.task('vendor-scripts', function() {
    return gulp.src(['./bower_components/angular/angular.min.js', './bower_components/jquery/dist/jquery.min.js',
    './bower_components/angular-route/angular-route.js', './bower_components/masonry/dist/masonry.pkgd.min.js',
    './bower_components/jquery-ui/jquery-ui.min.js','./bower_components/bootstrap/dist/js/bootstrap.min.js'])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('./dist/js'));
});
