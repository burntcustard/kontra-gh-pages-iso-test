import browserSync from "browser-sync";
import esbuild from "esbuild";
import kontra from "kontra";
import { copyFile } from 'fs';

const bs = browserSync.create();

const DEVMODE = process.argv.slice(2).includes('--watch');

async function build() {
  const result = await esbuild
    .build({
      bundle: true,
      // format: 'iife',
      entryPoints: ['src/js/main.js'],
      outdir: 'dist',
      // incremental: DEVMODE,
      // minify: !DEVMODE
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });

  copyFile('src/index.html', 'dist/index.html', (error) => {
    if (error) {
      console.error(error);
    }
  });
  console.log("Build finished");
}

build();

if (DEVMODE) {
  bs.init({
    server: true,
    files: 'src/**',
  });
}
