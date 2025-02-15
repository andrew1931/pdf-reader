import { build } from "esbuild";
import { rmSync, cpSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";
import dotEnv from "dotenv";
dotEnv.config({ path: "../env" });

const isProd = process.argv.includes("--prod");
const outDir = "dist";
const baseDir = "src";
const pdfWorkerPath = "node_modules/pdfjs-dist/legacy/build";

rmSync(outDir, { recursive: true, force: true });

build({
    entryPoints: [
        `${baseDir}/app.ts`,
        `${pdfWorkerPath}/pdf.worker.min.mjs`,
        `${pdfWorkerPath}/pdf.min.mjs`
    ],
    define: {
        API_URL: JSON.stringify("http://" + process.env.HOST + ":" + process.env.PORT + "/api")
    },
    write: true,
    bundle: true,
    minify: isProd,
    sourcemap: !isProd,
    outdir: outDir,
})
    .then(() => {
        cpSync("public", outDir, { recursive: true });
        copyFileSync("package.json", `${outDir}/package.json`);
        copyFileSync(`${outDir}/${pdfWorkerPath}/pdf.worker.min.js`, `${outDir}/pdf.worker.js`);
        copyFileSync(`${outDir}/${pdfWorkerPath}/pdf.min.js`, `${outDir}/pdf.min.js`);
        copyFileSync(`${outDir}/${baseDir}/app.js`, `${outDir}/app.js`);
        copyFileSync("index.html", `${outDir}/index.html`);
        copyFileSync("node_modules/swiper/swiper.css", `${outDir}/swiper.css`);
        copyFileSync("node_modules/swiper/modules/navigation.css", `${outDir}/swiper-navigation.css`);

        rmSync(`${outDir}/${baseDir}`, { recursive: true, force: true });
        rmSync(`${outDir}/node_modules`, { recursive: true, force: true });
        // build css
        execSync(`npx tailwindcss -i ./${baseDir}/input.css -o ./${outDir}/output.css --minify`);
    })
    .catch(console.error);