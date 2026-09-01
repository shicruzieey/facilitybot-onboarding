import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "vercel",
  serveStatic: true,
  srcDir: "src",
  output: {
    dir: ".output",
    serverDir: ".output/server",
    publicDir: ".output/public",
  },
  imports: {
    autoImport: false,
  },
  typescript: {
    strict: true,
    internalPaths: false,
  },
  experimental: {
    openAPI: false,
  },
});
