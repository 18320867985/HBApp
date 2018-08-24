//1. 全局安装 gulp： $ npm install --global gulp
//2. 作为项目的开发依赖（devDependencies）安装：$ npm install --save-dev gulp
//3. 在项目根目录下创建一个名为 gulpfile.js 的文件：var gulp = require('gulp');
//4. gulp.task('default', function() {
// 将你的默认的任务代码放在这
//});

var gulp = require('gulp');
var del = require("del");
var minCss = require('gulp-clean-css'); //gulp-minify-css:压缩css文件 npm install gulp-clean-css
var connect = require('gulp-connect'); //gulp-connect 创建服务器  npm install --save-dev gulp-connect
var minJs = require('gulp-uglify'); //压缩javascript文件  npm install gulp-uglify
var img = require('gulp-imagemin'); //gulp-imagemin:压缩png、jpj、git、svg格式图片 npm install --save-dev gulp-imagemin
var rename = require("gulp-rename"); // npm install gulp-rename --save-dev  重命名文件，把一个文件储存不同版本时使用
var concat = require('gulp-concat'); //npm install gulp-concat --save-dev  整合文件
var minHtml = require('gulp-htmlmin'); //npm install gulp-htmlmin --save-dev 压缩html，可以压缩页面javascript、css，去除页面空格、注释，删除多余属性等操作

var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var uglify = require('rollup-plugin-uglify');
var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');


/*
 * .pipe(postcss([autoprefixer]))  // 自动添加css3缀-webkit-  适合用于手机端 
 * */
var postcss = require("gulp-postcss"); // 手机端自动补全css3前缀  cnpm install --save-dev gulp-postcss
var autoprefixer = require('autoprefixer'); // npm install --save-dev autoprefixer

/*
 *	cnpm install node-sass --save-dev
 * cnpm install gulp-sass --save-dev 
 * 使用：sass().on('error', sass.logError)
 */
var sass = require('gulp-sass');
var img = require('gulp-imagemin'); //gulp-imagemin:压缩png、jpj、git、svg格式图片 npm install --save-dev gulp-imagemin
var eslint = require("gulp-eslint"); // 检查es5 ees6 js gulp-eshint

// 文件路径
var paths = {

	// sass文件
	scssPath: ['./app/unpackage/css-dev/scss/**/*.scss'],

	allscss: ['./app/unpackage/css-dev/scss/all.scss'],
	
	jsPath:['./app/unpackage/js-dev/**/*.js'],

	htmlPath: ['./app/unpackage/**/*.html'],

}

// 清空目录gulp-del
gulp.task('del', function(cd) {
	// gulp.src('./dist',{read:false}).pipe(clean()); //gulp-clean

	del(["./dist"], cd); //gulp-del
});

/******发布文件*******/

gulp.task('release', ["scss", "js"]);


// sass合并压缩css文件
gulp.task("scss", function() {
	
		gulp.src(paths.allscss)
		.pipe(sass().on('error', sass.logError)) // sass编译
		.pipe(postcss([autoprefixer])) // 自动添加css3缀-webkit-  适合用于手机端 
		.pipe(minCss())                // 压缩css文件
		.pipe(rename("mobile.css")) 
		.pipe(gulp.dest('./app/css'));		
	
});

gulp.task("unscss", function() {
	
		gulp.src(paths.allscss)
		.pipe(sass().on('error', sass.logError)) // sass编译
		.pipe(postcss([autoprefixer])) // 自动添加css3缀-webkit-  适合用于手机端 
		//.pipe(minCss())                // 压缩css文件
		.pipe(rename("mobile.css")) 
		.pipe(gulp.dest('./app/css'));
		
		gulp.src(paths.scssPath).pipe(connect.reload());
		
	
});





//开启http服务器
gulp.task('connect', function() {
	connect.server({
		root: 'app',
		livereload: true,
		port: 8888
	});
});

/*
 * watch监听
 * gulp.watch参数说明
 * 1. gulp.watch(path,task);
 * 2.gulp.watch(path,function(){});
 */
gulp.task("watch", ['connect'], function() {

	//合拼压缩js文件
	gulp.watch(paths.jsPath, ["js"]);

	//sass合并压缩css文件
	gulp.watch(paths.scssPath, ['unscss']);

	//监听html
	gulp.watch(paths.htmlPath, function() {
		//重启服务器	
		gulp.src(paths.htmlPath).pipe(connect.reload());

	});

});

// 检查js
gulp.task('t_eslint', function() {
	//gulp.src(paths.jsBabel).pipe(eslint()).pipe(eslint.format());
});

gulp.task('js', async function() {
	const bundle = await rollup.rollup({
		input: './app/unpackage/js-dev/app.js',

		/* 默认情况下，模块的上下文 - 即顶级的this的值为undefined。您可能需要将其更改为其他内容，如 'window'。*/
		context: "window",

		plugins: [

			/*commonjs 转换 es6*/
			//			resolve(),
			//			commonjs(),  

			babel({
				exclude: 'node_modules/**',
				presets: ["es2015-rollup"],

			}),
			
			/* 使用uglify压缩js 不能output 输出 format: 'es' 格式 否会报错*/
			uglify(), 

		],
	});

	await bundle.write({
		file: './app/js/mobile.js',
		format: 'umd',
		name: 'libs',
		//sourcemap: true,
		strict: false, //在生成的包中省略`"use strict";`

	});

});