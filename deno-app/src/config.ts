export const config = {
    clientAppDir: "../client-app/dist/",
    port: Number(Deno.env.get("PORT")),
    host: Deno.env.get("HOST"),
    dbUser: Deno.env.get("DB_USER"),
    dbPassword: Deno.env.get("DB_PASSWORD"),
    dbName: "pdf_slider"
}