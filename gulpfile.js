var gulp = require('gulp');
var s3 = require('gulp-s3');
var gulpIf = require('gulp-if');
var fileRev = require('gulp-file-rev');
var clean = require('gulp-clean');

gulp.task('buildCryptoTracky', function(){
  var revision = fileRev();
  return gulp.src('app/**/*')
    .pipe(gulpIf('*/**/*', revision))
    .pipe(gulpIf('**/*.{html,css,js}', revision.replace))
    .pipe(gulp.dest('dist/'))
});

gulp.task('cleanDist', function() {
  return gulp.src('dist/*', {read: false})
       .pipe(clean());
});

gulp.task('default', [ 'cleanDist', 'buildCryptoTracky' ]);
// gulp.task('default', [ 'cleanDist']);

gulp.task("build", ["default"]);
