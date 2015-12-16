var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    protractor = require("gulp-protractor").protractor,
    program = require('commander'),
    stylish = require('jshint-stylish'),
    debug = false,
    WATCH_MODE = 'watch',
    RUN_MODE = 'run';

var mode = RUN_MODE;

function list(val) {
  return val.split(',');
}

program
  .version('0.0.1')
  .option('-t, --tests [glob]', 'Specify which tests to run')
  .option('-b, --browsers <items>', 'Specify which browsers to run on', list)
  .option('-r, --reporters <items>', 'Specify which reporters to use', list)
  .option('-p, --port [port]', 'Specify which port to use', 8080)
  .parse(process.argv);

gulp.task('lint', function () {
  gulp.src('src/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
});

gulp.task('js', function() {
  var jsTask = gulp.src('src/**/*.js')
    .pipe(concat('ng-context-menu.js'))
    .pipe(gulp.dest('dist'));
  if (!debug) {
    jsTask.pipe(uglify());
  }
  jsTask
    .pipe(rename('ng-context-menu.min.js'))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('connect', function() {
  if (mode === WATCH_MODE) {
    gulp.watch(['index.html'], function() {
      gulp.src(['index.html'])
        .pipe(connect.reload());
    });
  }

  connect.server({
    livereload: mode === WATCH_MODE,
    port: program.port
  });
});

gulp.task('protractor', function(done) {
  gulp.src(["./src/tests/*.js"])
    .pipe(protractor({
      configFile: 'protractor.conf.js',
      args: [
        '--baseUrl', 'http://127.0.0.1:' + program.port,
        '--browser', program.browsers ? program.browsers[0] : 'chrome'
      ]
    }))
    .on('end', function() {
      if (mode === RUN_MODE) {
        connect.serverClose();
      }
      done();
    })
    .on('error', function() {
      if (mode === RUN_MODE) {
        connect.serverClose();
      }
      done();
    });
});

gulp.task('debug', function() {
  debug = true;
});

gulp.task('watch-mode', function() {
  mode = WATCH_MODE;
});

function watch() {
  var jsWatcher = gulp.watch('src/**/*.js', ['js', 'lint']);

  function changeNotification(event) {
    console.log('File', event.path, 'was', event.type, ', running tasks...');
  }

  jsWatcher.on('change', changeNotification);
}

// Removing protractor from default task until phantomjs issue is fixed
// https://github.com/ariya/phantomjs/issues/11429
//gulp.task('default', ['watch-mode', 'js', 'lint', 'protractor'], watch);
gulp.task('default', ['watch-mode', 'js', 'lint'], watch);
gulp.task('server', ['connect', 'default']);
gulp.task('test', ['connect', 'protractor']);