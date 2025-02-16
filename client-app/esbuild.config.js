const { build } = require("esbuild");
const { rmSync, cpSync, copyFileSync } = require("node:fs");
const { resolve, join } = require("node:path");
const { execSync } = require("node:child_process");
require("dotenv").config({ path: "../deno-app/.env" });

const isProd = process.argv.includes("--prod");
const outDir = resolve(__dirname, "../deno-app/dist");
const baseDir = "src";
const pdfWorkerPath = "node_modules/pdfjs-dist/legacy/build";

rmSync(outDir, { recursive: true, force: true });

build({
    entryPoints: [
        resolve(__dirname, baseDir, "app.ts"),
        resolve(__dirname, pdfWorkerPath, "pdf.worker.min.mjs"),
        resolve(__dirname, pdfWorkerPath, "pdf.min.mjs")
    ],
    define: {
        API_URL: JSON.stringify(
            isProd ? "https://pdf-swiper.com" : "http://" + process.env.HOST + ":" + process.env.PORT + "/api"
        )
    },
    write: true,
    bundle: true,
    minify: isProd,
    sourcemap: !isProd,
    outdir: outDir,
})
    .then(() => {
        cpSync(resolve(__dirname, "public"), outDir, { recursive: true });
        copyFileSync(join(__dirname, "package.json"), join(outDir, "package.json"));
        copyFileSync(join(outDir, pdfWorkerPath, "pdf.worker.min.js"), join(outDir, "pdf.worker.js"));
        copyFileSync(join(outDir, pdfWorkerPath, "pdf.min.js"), join(outDir, "pdf.min.js"));
        copyFileSync(join(outDir, baseDir, "app.js"), join(outDir, "app.js"));
        copyFileSync(join(__dirname, "index.html"), join(outDir, "index.html"));
        copyFileSync(
            join(__dirname, "node_modules/swiper/swiper.css"),
            join(outDir, "swiper.css")
        );
        copyFileSync(
            join(__dirname, "node_modules/swiper/modules/navigation.css"),
            join(outDir, "swiper-navigation.css")
        );

        rmSync(join(outDir, baseDir), { recursive: true, force: true });
        rmSync(join(outDir, "node_modules"), { recursive: true, force: true });
        // build css
        execSync(`${resolve(__dirname, "node_modules/.bin", "tailwindcss")} -i ${resolve(__dirname, baseDir)}/input.css -o ${outDir}/output.css --minify`);
    })
    .catch(console.error);