module.exports = {
    apps: [
        {
            name: "pdf-swiper",
            cwd: "/var/www/pdf-swiper/deno-app",
            script: "./src/main.ts",
            interpreter: "deno",
            interpreterArgs: "run --env-file=.env --allow-env --allow-net --allow-read --allow-write --allow-ffi --allow-sys",
        },
    ],
};