"use strict";

// Include gulp
let gulp = require('gulp');

let uglify = require('gulp-uglify');
let babel = require('gulp-babel');
let uglifycss = require('gulp-uglifycss');
let concat = require('gulp-concat');

gulp.task('dist', async function() {
  gulp.src(['src/js/common/*.js', 'src/js/widget/*.js'])
    .pipe(concat('./gux.mobile.js'))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/js/common/*.js', 'src/js/widget/*.js'])
    .pipe(babel({
      presets: [['@babel/preset-env', {modules: false}]]
    }))
    .pipe(concat('./gux.mobile.min.js'))
    .pipe(uglify({}))
    .pipe(gulp.dest('./dist/'));

  // desktop css
  gulp.src(['src/css/*.css'])
    .pipe(concat('./gux.mobile.css'))
    .pipe(gulp.dest('./dist/'));

  gulp.src(['src/css/*.css'])
      .pipe(concat('./gux.mobile.min.css'))
      .pipe(uglifycss())
      .pipe(gulp.dest('./dist/'));
});

gulp.task('dist');