const esbuild = require("esbuild");

const commonConfig = {
  bundle: true,
  minify: true,
  legalComments: "none",
  entryPoints: ["src/index.ts"],
};

// CommonJS build
esbuild.buildSync({
  ...commonConfig,
  outfile: "dist/index.js",
  format: "cjs",
  platform: "node",
  target: ["node14"],
});

// ESM build
esbuild.buildSync({
  ...commonConfig,
  outfile: "dist/index.esm.js",
  format: "esm",
  platform: "neutral",
  target: ["es2015"],
});
