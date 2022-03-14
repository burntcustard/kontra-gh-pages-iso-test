import browserSync from "browser-sync";
import esbuild from "esbuild";
import kontra from "kontra";
import { copyFile, mkdirSync } from 'fs';

const bs = browserSync.create();
const DEVMODE = process.argv.slice(2).includes('--watch');

async function copyFileToDist(filename) {
  copyFile(`src/${filename}`, `dist/${filename}`, (error) => {
    if (error) {
      throw new Error(error);
    }
  });
}

async function build() {
  const buildResult = await esbuild
    .build({
      bundle: true,
      format: 'iife',
      entryPoints: ['src/js/main.js'],
      outdir: 'dist',
      incremental: DEVMODE,
      minify: !DEVMODE
    })
    .catch((error) => {
      console.error(error);
    });

  if (DEVMODE) {
    bs.init({
      server: 'dist',
      files: [
        {
          match: 'src/js/**',
          fn: () => {
            buildResult.rebuild();
            bs.reload();
          },
        },
        {
          match: 'src/**/*.css',
          fn: () => {
            copyFileToDist('style.css');
          },
        },
        {
          match: 'src/index.html',
          fn: () => {
            copyFileToDist('index.html');
            bs.reload();
          },
        },
        'dist/style.css',
      ]
    });
  }
}

mkdirSync('dist', { recursive: true });
mkdirSync('dist/img', { recursive: true });
copyFileToDist('img/test-tile.png');
['style.css', 'index.html'].forEach(filename => copyFileToDist(filename));
build();
