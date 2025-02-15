const { resolve } = require("node:path");
const { execSync } = require("node:child_process");

process.chdir(resolve(__dirname, "client-app"));
execSync(("npm install"));
execSync(("npm run build:prod"));
process.chdir(__dirname);