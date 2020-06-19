import gulp from "gulp";
import gulppug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import gulpimage from "gulp-image";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

sass.compiler = require("node-sass");

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/*",
    src: "src/scss/styles.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

//task
const clean = () => del(["build"]);

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const pug = () =>
  gulp.src(routes.pug.src).pipe(gulppug()).pipe(gulp.dest(routes.pug.dest));

const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(gulp.dest(routes.scss.dest));

const image = () =>
  gulp.src(routes.img.src).pipe(gulpimage()).pipe(gulp.dest(routes.img.dest));

const webserver = () =>
  gulp.src("build").pipe(
    ws({
      port: 5000,
      livereload: true,
      open: true,
    })
  );

const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

const deployGhPages = () => gulp.src("build").pipe(ghPages());

// build delete for preventing conflict
const prepare = gulp.series([clean, image]);

// pug transcompile
const assets = gulp.series([pug, styles, js]);

// execute webserver deamon
const postDev = gulp.parallel([webserver, watch]);

// package.json에서 script로 사용하기 위해 export
export const dev = gulp.series([prepare, assets, postDev]);
