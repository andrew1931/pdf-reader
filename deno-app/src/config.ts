export const config = {
    clientAppDir: "../client-app/dist/",
    port: Number(Deno.env.get("PORT")),
    host: Deno.env.get("HOST"),
    dbStorage: "./pdf_slider.sqlite",
    
};