export const config = {
    clientAppDir: "./dist/",
    port: Number(Deno.env.get("PORT")),
    host: Deno.env.get("HOST"),
    dbStorage: "./pdf_slider.sqlite",
    dbName: "pdf_slider"
};