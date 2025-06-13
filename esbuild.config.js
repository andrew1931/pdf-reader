const esbuild = require('esbuild');
const { rmSync, cpSync, copyFileSync, readFileSync, writeFileSync } = require('node:fs');
const { resolve, join } = require('node:path');
const { execSync } = require('node:child_process');
require('dotenv').config({ path: '../deno-app/.env' });

const isProd = process.argv.includes('--prod');
const outDir = resolve(__dirname, 'dist');
const baseDir = 'src';
const pdfWorkerPath = 'node_modules/pdfjs-dist/legacy/build';

rmSync(outDir, { recursive: true, force: true });

const buildHash = Date.now().toString();

const config = {
   entryPoints: [
      resolve(__dirname, baseDir, 'app.ts'),
      resolve(__dirname, pdfWorkerPath, 'pdf.worker.min.mjs'),
      resolve(__dirname, pdfWorkerPath, 'pdf.min.mjs'),
   ],
   define: {
      BUILD_VERSION: JSON.stringify(buildHash),
      ROUTE_PREFIX: isProd ? JSON.stringify('/pdf-swiper') : '',
   },
   write: true,
   bundle: true,
   minify: isProd,
   sourcemap: !isProd,
   outdir: outDir,
};

(async () => {
   await esbuild.build(config);
   const appScriptName = `app-${buildHash}.js`;
   const outputHTMLPath = join(outDir, 'index.html');
   cpSync(resolve(__dirname, 'public'), outDir, { recursive: true });
   copyFileSync(join(outDir, pdfWorkerPath, 'pdf.worker.min.js'), join(outDir, 'pdf.worker.js'));
   copyFileSync(join(outDir, pdfWorkerPath, 'pdf.min.js'), join(outDir, 'pdf.min.js'));
   copyFileSync(join(outDir, baseDir, 'app.js'), join(outDir, appScriptName));
   copyFileSync(join(__dirname, 'index.html'), outputHTMLPath);
   copyFileSync(
      join(__dirname, 'node_modules/swiper/swiper-bundle.min.css'),
      join(outDir, 'swiper.css')
   );

   const indexHTML = readFileSync(outputHTMLPath);
   writeFileSync(outputHTMLPath, indexHTML.toString().replace('{SCRIPT_PATH}', appScriptName));

   writeFileSync(join(outDir, 'version.json'), JSON.stringify({ buildHash }));

   rmSync(join(outDir, baseDir), { recursive: true, force: true });
   rmSync(join(outDir, 'node_modules'), { recursive: true, force: true });
   // build css
   execSync(
      `${resolve(__dirname, 'node_modules/.bin', 'tailwindcss')} -i ${resolve(__dirname, baseDir)}/input.css -o ${outDir}/output.css --minify`
   );

   if (!isProd) {
      const ctx = await esbuild.context({});
      ctx.serve({ port: 3000, servedir: 'dist' });
   }
})();
