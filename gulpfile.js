//==============//
// DEPENDENCIES //
//==============//

// Local dependencies.
var pkg = require('./package.json');

// Node dependencies.
var fs = require('fs');

// Third-party dependencies.
var del = require('del');
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var header = require('gulp-header');
var runSequence = require('run-sequence');
var KarmaServer = require('karma').Server;
var htmlmin = require('gulp-htmlmin');


//=========//
// GLOBALS //
//=========//


//=======//
// CLEAN //
//=======//

gulp.task('clean', function (callback) {
  del(['dist'], callback);
});


//=======//
// BUILD //
//=======//

gulp.task('build', function (done) {
  runSequence('clean', ['build:scripts', 'build:templates'], done);
});


gulp.task('build:scripts', function () {
  var headerContent = fs.readFileSync('src/scripts/header.js', 'utf8');
  return gulp
    .src([
      './src/scripts/module.js'
    ])
    .pipe(concat('betsol-ng-entity-list.js'))
    .pipe(ngAnnotate({
      'single_quotes': true
    }))
    .pipe(header(headerContent, { pkg : pkg } ))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(uglify())
    .pipe(header(headerContent, { pkg : pkg } ))
    .pipe(rename('betsol-ng-entity-list.min.js'))
    .pipe(gulp.dest('dist/scripts'))
    .on('error', gutil.log)
  ;
});


gulp.task('build:templates', function () {
  var headerContent = fs.readFileSync('src/templates/header.html', 'utf8');
  return gulp
    .src([
      './src/templates/entity-list.html'
    ])
    .pipe(header(headerContent, { pkg : pkg } ))
    .pipe(gulp.dest('dist/templates'))
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeRedundantAttributes: true,
      caseSensitive: true
    }))
    .pipe(rename('entity-list.min.html'))
    .pipe(header(headerContent, { pkg : pkg } ))
    .pipe(gulp.dest('dist/templates'))
    .on('error', gutil.log)
  ;
});


//======//
// TEST //
//======//

gulp.task('test', ['test:unit']);

gulp.task('test:unit', function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});


//==============//
// DEFAULT TASK //
//==============//

gulp.task('default', function (done) {
  runSequence('build', 'test', done);
});
