import browserSync from "browser-sync";
import esbuild from "esbuild";
import kontra from "kontra";

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
  console.log("Build finished");
}

build();

if (DEVMODE) {
  bs.init({
    server: true,
    files: 'src/**',
  });
}
