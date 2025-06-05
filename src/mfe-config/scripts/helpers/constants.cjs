/**
 * Configuration files to copy during setup
 */
const CONFIG_FILES = [
	'.dockerignore',
	'temp.gitignore',
	'.prettierrc',
	'Dockerfile',
	'Dockerfile-local',
	'package.base.json',
	'vite.dev.config.ts',
	'tsconfig.app.json',
	'tsconfig.node.json',
	'eslintCustom.mjs',
	'eslint.config.js',
];

/**
 * Directories to create during setup
 */
const DIRECTORIES = [
	'src',
	'src/api',
	'src/assets',
	'src/components',
	'src/components/containers',
	'src/components/main',
	'src/components/main/shared-components',
	'src/components/side',
	'src/components/titles',
	'src/data',
	'src/enums',
	'src/hooks',
	'src/infrastructure',
	'src/infrastructure/axios',
	'src/infrastructure/routing',
	'src/infrastructure/wrappers',
	'src/interfaces/',
	'src/models',
	'src/types',
	'src/utils',
];

module.exports = {
	CONFIG_FILES,
	DIRECTORIES,
};
