import browserSync from "browser-sync";
import esbuild from "esbuild";
import kontra from "kontra";
import { copyFile, mkdirSync } from 'fs';

const bs = browserSync.create();
const DEVMODE = process.argv.slice(2).includes('--watch');

async function copyFilesToDist(filenames) {
  filenames.forEach(filename => {
    copyFile(`src/${filename}`, `dist/${filename}`, (error) => {
      if (error) {
        throw new Error(error);
      }
    });
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
            copyFilesToDist(['style.css']);
          },
        },
        {
          match: 'src/index.html',
          fn: () => {
            copyFilesToDist(['index.html']);
            bs.reload();
          },
        },
        'dist/style.css',
      ]
    });
  }
}

mkdirSync('dist', { recursive: true });
copyFilesToDist(['style.css', 'index.html']);
build();
