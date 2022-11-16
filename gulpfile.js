console.time("Loading plugins");

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const runSequence = require('gulp4-run-sequence');
const fs = require('fs');

var browserSync = require('browser-sync').create();

console.timeEnd("Loading plugins");

var gulp_src = gulp.src;
gulp.src = function() {
  return gulp_src.apply(gulp, arguments)
    .pipe(plugins.plumber(function(error) {
      plugins.util.log(plugins.util.colors.red('Error (' + error.plugin + '): ' + error.message));
      this.emit('end');
    })
  );
};


gulp.task('server', function() {

	// server part via browser-sync
   browserSync.init({
      server: {
         baseDir: 'dist'
      }
   });

   	// watcher part
	gulp.watch('app/sass/**/*.+(scss|sass)', { events: 'all' }, function(cb) {
	    console.log("Change in SASS file");
	    runSequence('compass', 'html');
	});

	gulp.watch('app/jade/**/*.jade', { events: 'all' }, function(cb) {
	    console.log("Change in JADE file");
	    runSequence('jade', 'html');
	});

	gulp.watch('app/js/**/*.js', { events: 'all' }, function(cb) {
	    console.log("Change in JS file");
	    runSequence('html');
	});

})

gulp.task('compass', async function() {
  return gulp.src('app/sass/**/*.+(scss|sass)')
    .pipe(plugins.compass({
      css: 'app/css',
      sass: 'app/sass',
      image: 'app/images',
      font: 'app/fonts'
     }))
    .pipe(gulp.dest('app/css'));
});

gulp.task('jade', async function() {
	var template_vars = {};
	return gulp.src(['app/jade/*.jade', '!app/jade/_*.jade'])
	.pipe(plugins.jade({
		locals: template_vars,
		pretty: true
	}))
	.pipe(gulp.dest('app'));
});

gulp.task('html', async function() {
	//htmlValidate();
	return gulp.src('app/**/*.html')
	.pipe(plugins.wiredep())
	.pipe(plugins.useref())
	.pipe(gulp.dest('dist'))
	.pipe(browserSync.reload({stream:true}));
});

gulp.task('html-minify', async function() {
	//htmlValidate();
	return gulp.src('app/**/*.html')
	.pipe(plugins.wiredep())
	.pipe(plugins.useref())
	.pipe(plugins.if('*.js', plugins.uglify()))
	.pipe(plugins.if('*.css', plugins.cssnano()))
	.pipe(plugins.if('*.html', plugins.htmlmin({collapseWhitespace: true})))
	.pipe(gulp.dest('dist'));
});



gulp.task('images', async function() {
	return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg|ico)')
	.pipe(gulp.dest('dist/images'));
});


gulp.task('images-min', async function() {
	return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg|ico)')
	.pipe(plugins.cache(plugins.imagemin({

	})))
	.pipe(gulp.dest('dist/images'));
});


gulp.task('fonts', async function() {
	return gulp.src('app/fonts/*.*')
	pipe(gulp.dest('dist/fonts/'));
});

gulp.task('fonts-min', async function() {
	runSequence('fonts-subset', 'fonts-multiply');
});

gulp.task('fonts-subset', async function() {
	const Fontmin = require('fontmin');

	var fontmin = new Fontmin()
		.src('app/fonts/*.*')
	    .use(Fontmin.glyph({
	    	text: 'aábcčdďeěéfghiíjklmnoópqrřsštťuúůvwxyýzžAÁBCČDĎEÉĚFGHIÍJKLMNOÓPQRŘSŠTŤUÚŮVWXYÝZŽ0123456789.,?!@#$%^&*()_+-=±§`~}{|\'":<>/\\∞»‼︎',
			hinting: false
	    }))
		.dest('dist/fonts/');

	fontmin.run(function (err, files) {
		if (err) {
			throw err;
		}
	});
});

gulp.task('fonts-multiply', async function() {
	const Fontmin = require('fontmin');

	var ttfSubset = new Fontmin()
	    .src('dist/fonts/*.ttf')
	    .dest('dist/fonts/');

	ttfSubset.run(function(err, files) {
		if (err) {
			throw err;
		}
	});
})

gulp.task('clean:dist', async function() {
	const del = require('del');
	return del.sync('dist');
});

gulp.task('cache:clear', async function (callback) {
	return plugins.cache.clearAll(callback);
});

gulp.task('css-postproces', async function() {
	runSequence('css-base-64', 'critical-css');
});

gulp.task('css-base-64', async function() {
	return gulp.src('dist/css/**/*.css')
		.pipe(plugins.cssBase64({
			maxWeightResource: 60000
		}))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('build-development', async function (callback) {
	runSequence('clean:dist',
		['compass','jade', 'images', 'fonts'],
		'html',
		callback
	);
});

/*gulp.task('build-full', function(callback) {
	['build'],
	'css-postproces',
	callback
});*/

gulp.task('build-production', async function (callback) {
	runSequence('clean:dist',
		['compass','jade', 'images-min', 'fonts-min'],
		'html-minify',
		callback
	);
});

gulp.task('default', async function (callback) {
	runSequence(
		['build-development'],
		callback
	);
});

// Custom node js scripts -- like shell scripts
//
String.prototype.endsWith = function(suffix) {
    suffix = suffix || '';
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getFiles (dir, files_, suffix){
    dir = dir || __dirname;
    files_ = files_ || [];
    suffix = suffix || '';
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_, suffix);
        } else {
            if(name.endsWith(suffix)) {
                files_.push(name);
            }
        }
    }
    return files_;

}

	//HTML validation
	//
	//
function htmlValidate() {

	const w3cHtmlValidator = require('html-validator');

	var htmlFiles = getFiles('app', [], '.html'),
		validationOptions = {
			'format': 'text'
		};

	for(var i in htmlFiles) {
		fs.readFile(htmlFiles[i], function(err, data) {
			if(err) {
				console.log("Chyba pri cteni html souboru.");
			}
			validationOptions.data = data.toString();
			w3cHtmlValidator(validationOptions, function(err, message) {
				if(err) {
					console.log("Chyba validatoru.");
				}
				console.log("HTML Validation: " + message);
			});
		});
	}
}

gulp.task('critical-css', async function() {
	const critical = require('critical').stream;
	return gulp.src('dist/**/*.html')
		.pipe(critical({
			minify: true,
			ignore: ['@font-face', /url\(/, ':hover', ':focus', ':active'],
			base: 'dist/',
			inline: true,
			css: ['dist/css/app.min.css']
		}))
		.pipe(gulp.dest('dist'));

});
