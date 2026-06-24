/**
 * Registers @ems/* path aliases against the compiled `dist/` output so the
 * production build (plain `node`, no ts-node) can resolve them.
 * Usage: node -r ./scripts/register-paths.js dist/apps/api/src/main.js
 */
const path = require('path');
const { compilerOptions } = require('../tsconfig.json');

const baseUrl = path.resolve(__dirname, '..', compilerOptions.outDir ?? 'dist');

const paths = {};
for (const [alias, targets] of Object.entries(compilerOptions.paths)) {
  paths[alias] = targets.map((target) => target.replace(/\.tsx?$/, ''));
}

require('tsconfig-paths').register({ baseUrl, paths });
