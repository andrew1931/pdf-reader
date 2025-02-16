module.exports = {
    apps: [
        {
            name: "pdf-swiper",
            script: "./deno-app/src/main.ts",
            interpreter: "deno",
            interpreterArgs: "run --env-file=.env --allow-env --allow-net --allow-read --allow-write --allow-ffi --allow-sys",
        },
    ],
};