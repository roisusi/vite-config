#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const cheerio = require('cheerio');

const { cleanDirectory } = require('./helpers/fileHelpers.cjs');
const {
	isCommandAvailable,
	createViteProject,
	initializeGit,
	setupHusky,
	invokePnpmInstall,
} = require('./helpers/commandHelpers.cjs');
const {
	mergePackageJson,
	addViteConfig,
	changingPackageJsonScripts,
	updateTitle,
	addMfeNameToTsConfig,
} = require('./helpers/configHelpers.cjs');
const { displayBanner, failedRerolling } = require('./helpers/uiHelpers.cjs');

// Configuration files to copy
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

// Directories to create
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

// Function to display a beautiful square banner
const displayBanner = (version) => {
	const bannerWidth = 60;
	const border = '═'.repeat(bannerWidth - 2);
	const emptyLine = `║${' '.repeat(bannerWidth - 2)}║`;
	const title = `MFE CREATE SETUP ver ${version}`;
	const paddedTitle = title.padStart(
		Math.floor((bannerWidth - title.length) / 2) + title.length
	);

	console.log(chalk.green(`╔${border}╗`));
	console.log(chalk.green(emptyLine));
	console.log(
		chalk.green(
			`║${paddedTitle}${' '.repeat(bannerWidth - paddedTitle.length - 2)}║`
		)
	);
	console.log(chalk.green(emptyLine));
	console.log(chalk.green(`╚${border}╝`));
};

// Function to copy configuration files
const copyConfigFiles = () => {
	console.log(chalk.yellow('Copying configuration files...'));
	try {
		const templatesDir = path.join(__dirname, '../templates');
		CONFIG_FILES.forEach((file) => {
			const source = path.join(templatesDir, file);
			if (file === 'temp.gitignore') {
				file = '.gitignore';
			}
			const destination = path.join(process.cwd(), file);

			if (!fs.existsSync(source)) {
				console.warn(
					chalk.red(`Template for ${file} not found in ${templatesDir}`)
				);
				failedRerolling();
			}

			fs.copyFileSync(source, destination);
			console.log(chalk.green(`Copied ${source} to ${destination}`));
		});
	} catch (error) {
		console.error(
			chalk.red(`Failed to copy configuration files: ${error.message}`)
		);
		failedRerolling();
	}
};

// Function to create directories and components
const createDirectories = () => {
	// Create the base directories
	DIRECTORIES.forEach((dir) => {
		fs.mkdirSync(dir, { recursive: true });
		console.log(chalk.green(`Created directory: ${dir}`));
	});

	// Get MFE name and create components
	const mfeName = require(path.join(
		process.cwd(),
		'package.json'
	)).name.replace('mfe-', '');
	const mfeNameCapitalized = mfeName.charAt(0).toUpperCase() + mfeName.slice(1);
	const templatesDir = path.join(__dirname, '../templates');

	// Create components directory and files
	const componentsDir = path.join(process.cwd(), 'src', 'components');
	fs.mkdirSync(componentsDir, { recursive: true });

	// Create AppRoot.tsx
	const appRootPath = path.join(componentsDir, 'AppRoot.tsx');
	const appRootTemplatePath = path.join(templatesDir, 'AppRoot.tsx');
	if (!fs.existsSync(appRootPath)) {
		if (fs.existsSync(appRootTemplatePath)) {
			let appRootContent = fs.readFileSync(appRootTemplatePath, 'utf-8');
			fs.writeFileSync(appRootPath, appRootContent.trim());
			console.log(chalk.green(`Created component: ${appRootPath}`));
		} else {
			console.error(
				chalk.red(`AppRoot template not found at ${appRootTemplatePath}`)
			);
		}
	} else {
		console.log(chalk.cyan(`Component already exists: ${appRootPath}`));
	}

	// Create Mfe<Name>.tsx
	const mfeComponentPath = path.join(
		componentsDir,
		`Mfe${mfeNameCapitalized}.tsx`
	);
	const mfeTemplatePath = path.join(templatesDir, 'mfe.tsx');
	if (!fs.existsSync(mfeComponentPath)) {
		if (fs.existsSync(mfeTemplatePath)) {
			let mfeContent = fs.readFileSync(mfeTemplatePath, 'utf-8');
			mfeContent = mfeContent
				.replace(/{<MFE NAME>}/g, mfeNameCapitalized)
				.replace(/{<MFE lowerName>}/g, mfeName);
			fs.writeFileSync(mfeComponentPath, mfeContent.trim());
			console.log(chalk.green(`Created component: ${mfeComponentPath}`));
		} else {
			console.error(chalk.red(`MFE template not found at ${mfeTemplatePath}`));
		}
	} else {
		console.log(chalk.cyan(`Component already exists: ${mfeComponentPath}`));
	}

	// Create infrastructure files
	const infrastructureDirs = {
		axios: path.join(process.cwd(), 'src', 'infrastructure', 'axios'),
		routing: path.join(process.cwd(), 'src', 'infrastructure', 'routing'),
		wrappers: path.join(process.cwd(), 'src', 'infrastructure', 'wrappers'),
	};

	// Create infrastructure directories
	Object.values(infrastructureDirs).forEach((dir) => {
		fs.mkdirSync(dir, { recursive: true });
	});

	// Create infrastructure files
	createInfrastructureFiles(templatesDir, mfeName);
};

/**
 * Creates infrastructure files from templates
 * @param {string} templatesDir - Templates directory path
 * @param {string} mfeName - MFE name
 */
const createInfrastructureFiles = (templatesDir, mfeName) => {
	const infrastructureFiles = {
		axios: {
			'axios-instance.ts': 'infrastructure/axios/axios-instance.ts',
		},
		routing: {
			'AppRoutesConfig.tsx': 'infrastructure/routing/AppRoutesConfig.tsx',
			'OwnRouter.tsx': 'infrastructure/routing/OwnRouter.tsx',
			'routing-paths.ts': 'infrastructure/routing/routing-paths.ts',
		},
	};

	Object.entries(infrastructureFiles).forEach(([category, files]) => {
		Object.entries(files).forEach(([fileName, templatePath]) => {
			const targetPath = path.join(
				process.cwd(),
				'src',
				'infrastructure',
				category,
				fileName
			);
			const templateFullPath = path.join(templatesDir, templatePath);

			if (!fs.existsSync(targetPath)) {
				if (fs.existsSync(templateFullPath)) {
					let content = fs.readFileSync(templateFullPath, 'utf-8');
					if (mfeName) {
						content = content.replace(/{<MFE NAME>}/g, mfeName);
					}
					fs.writeFileSync(targetPath, content.trim());
					console.log(chalk.green(`Created ${category} file: ${targetPath}`));
				} else {
					console.error(
						chalk.red(`${category} template not found at ${templateFullPath}`)
					);
				}
			} else {
				console.log(
					chalk.cyan(`${category} file already exists: ${targetPath}`)
				);
			}
		});
	});
};

// Function to change package.json scripts
const changingPackageJsonScripts = (mfeName) => {
	const packageJsonPath = path.join(process.cwd(), 'package.json');
	const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
	const packageJsonContent = JSON.parse(packageJson);

	packageJsonContent.scripts = Object.entries(
		packageJsonContent.scripts
	).reduce((acc, [key, value], index) => {
		let newKey = key;
		if (index === 0) {
			newKey = key.replace(key, key + ':' + mfeName);
		}
		if (key === 'build') {
			value = value.replace(
				value,
				`export NODE_OPTIONS="--max-old-space-size=8192" && tsc && vite build`
			);
		}
		if (key === 'lint') {
			value = value.replace(value, `eslint . --max-warnings 0`);
		}
		acc[newKey] = value;
		if (index === Object.keys(packageJsonContent.scripts).length - 1) {
			acc[`preview:${mfeName}:watch`] =
				'concurrently "vite preview" "tsc && vite build --watch"';
		}
		return acc;
	}, {});

	fs.writeFileSync(
		packageJsonPath,
		JSON.stringify(packageJsonContent, null, 2)
	);
};

// Function to update title in index.html
const updateTitle = (mfeName) => {
	const filePath = path.join(process.cwd(), 'index.html');
	const mfeNameCapitalized = mfeName.charAt(0).toUpperCase() + mfeName.slice(1);

	try {
		const htmlFile = fs.readFileSync(filePath, 'utf-8');
		const $ = cheerio.load(htmlFile);
		$('title').text(`Mfe-${mfeNameCapitalized}`);
		fs.writeFileSync(filePath, $.html(), 'utf8');
		console.log(chalk.green(`Updated title name to Mfe-${mfeNameCapitalized}`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to write to ${filePath}: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		failedRerolling();
	}
};

// Function to delete Vite assets
const deleteViteAssets = () => {
	const filePath = path.join(process.cwd(), 'src/assets/react.svg');
	try {
		fs.unlinkSync(filePath);
		console.log(chalk.green(`Removed file from path Mfe-${filePath}`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to remove to ${filePath}: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		failedRerolling();
	}
};

// Function to replace App.tsx content
const replaceAppTsx = (filePath, filePrefixPath, mfeName) => {
	const filePathAppCss = path.join(process.cwd(), 'src/App.css');
	const filePathIndexCss = path.join(process.cwd(), 'src/index.css');

	try {
		console.log(chalk.magenta(`Setting App.tsx File Changes...`));
		const searchMarker = ['{<MFE NAME>}'];
		changeCurlyNamesInFiles(filePath, filePrefixPath, [mfeName], searchMarker);
		fs.writeFileSync(filePathAppCss, '');
		fs.writeFileSync(filePathIndexCss, '');
		console.log(chalk.green(`Changed App.tsx App.css index.css`));
	} catch (error) {
		console.log(chalk.red(`failed to change App.tsx at ${filePath}.`));
	}
};

// Function to initialize README
const initializeReadme = (filePath, mfeName) => {
	try {
		const pathDir = path.resolve(__dirname, '../');
		const fileContent = fs.readFileSync(
			`${pathDir}/templates/README.md`,
			'utf8'
		);
		const searchMarker = ['{<MFE NAME>}'];
		const replacement = [mfeName.toUpperCase()];
		let newContent = fileContent;

		for (let i = 0; i < searchMarker.length; i++) {
			const marker = searchMarker[i];
			const replacementString = replacement[i];
			const regex = new RegExp(marker, 'g');
			newContent = newContent.replace(regex, replacementString);
		}

		fs.writeFileSync(filePath, newContent.trim());
		console.log(chalk.green(`Change ReadME file ${filePath}.`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to write to ReadMe file to ${filePath}: ${
					error.message
				} at ${getErrorLine(error)}`
			)
		);
		failedRerolling();
	}
};

// Helper function to change curly names in files
const changeCurlyNamesInFiles = (
	filePath,
	filePrefixPath,
	arrayOfNames,
	arrayOfMarkers
) => {
	const pathDir = path.resolve(__dirname, '../');
	const fileContent = fs.readFileSync(`${pathDir}${filePrefixPath}`, 'utf8');
	let newContent = fileContent;

	for (let i = 0; i < arrayOfMarkers.length; i++) {
		const marker = arrayOfMarkers[i];
		const replacementString = arrayOfNames[i];
		const regex = new RegExp(marker, 'g');
		newContent = newContent.replace(regex, replacementString);
	}

	fs.writeFileSync(filePath, newContent.trim());
	console.log(chalk.green(`Changed file ${filePath}.`));
};

// Helper function to get error line
function getErrorLine(error) {
	const match = error.stack.match(/(\w+\.cjs:\d+:\d+)/);
	return match ? match[1] : 'Unknown Location';
}

// Main setup function
const setupMfe = () => {
	try {
		const version = require('../../../package.json').version || 'Error';
		displayBanner(version);

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(
			chalk.green('Do you want to proceed with the setup? (y/n): '),
			(answer) => {
				if (answer.toLowerCase() !== 'y') {
					console.log(chalk.red('Setup aborted by the user.'));
					rl.close();
					failedRerolling();
					process.exit(0);
				}

				console.log(chalk.green('Proceeding with the setup...'));
				rl.close();

				// Check if pnpm is installed
				if (!isCommandAvailable('pnpm')) {
					console.log(
						chalk.yellow('pnpm is not installed. Installing it globally...')
					);
					try {
						execSync('npm install -g pnpm', { stdio: 'inherit' });
						console.log(chalk.green('pnpm installed globally.'));
					} catch (error) {
						console.error(
							chalk.red('Failed to install pnpm globally:', error.message)
						);
						failedRerolling();
					}
				} else {
					console.log(chalk.green('pnpm is already installed.'));
				}

				// Clean directory
				cleanDirectory();

				// Create Vite project
				createViteProject();

				// Initialize Git
				initializeGit();

				const mfeName = require(path.join(
					process.cwd(),
					'package.json'
				)).name.replace('mfe-', '');
				const mfeNameCapitalized =
					mfeName.charAt(0).toUpperCase() + mfeName.slice(1);

				// Initialize README
				initializeReadme(path.join(process.cwd(), 'README.md'), mfeName);

				// Copy configuration files
				console.log(chalk.yellow('Copying configuration files...'));
				copyConfigFiles();

				// Create directories and components
				console.log(
					chalk.yellow('Creating basic directories and components...')
				);
				createDirectories();

				// Merge package.json
				const templatesDir = path.join(__dirname, '../templates');
				mergePackageJson(templatesDir);

				// Add federation configuration
				addViteConfig(path.join(process.cwd(), 'vite.config.ts'), mfeName);

				// Change package.json scripts
				changingPackageJsonScripts(mfeName);

				// Change Title of index.html
				updateTitle(mfeName);

				// Remove assets vite files
				deleteViteAssets(mfeName);

				// Change App.tsx
				replaceAppTsx(
					path.join(process.cwd(), 'src/App.tsx'),
					'/templates/App.tsx',
					mfeNameCapitalized
				);

				// Change DockerFiles
				changeDockerFile(
					path.join(process.cwd(), 'Dockerfile'),
					'/templates/Dockerfile',
					mfeName
				);
				changeDockerFile(
					path.join(process.cwd(), 'Dockerfile-local'),
					'/templates/Dockerfile-local',
					mfeName
				);

				// Change mfe name inside tsconfig.app.json
				addMfeNameToTsConfig(
					path.join(process.cwd(), 'tsconfig.app.json'),
					mfeName
				);

				// Install pnpm dependencies
				invokePnpmInstall();

				// Set up Husky
				setupHusky();

				console.log(chalk.bgBlue('MFE setup completed successfully!'));
			}
		);
	} catch (error) {
		failedRerolling();
	}
};

setupMfe();
