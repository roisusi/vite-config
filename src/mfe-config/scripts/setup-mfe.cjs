#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const cheerio = require('cheerio');

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

// Function to check if a command exists globally
const isCommandAvailable = (command) => {
	try {
		execSync(`command -v ${command}`, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
};

// Function to clean the current directory
const cleanDirectory = () => {
	console.log(chalk.yellow('Cleaning the current directory...'));
	const files = fs.readdirSync(process.cwd());

	files.forEach((file) => {
		const filePath = path.join(process.cwd(), file);
		if (file === '.git') {
			return;
		}
		if (fs.lstatSync(filePath).isDirectory()) {
			fs.rmSync(filePath, { recursive: true, force: true });
		} else {
			fs.unlinkSync(filePath);
		}
	});

	console.log(chalk.green('Directory cleaned.'));
};

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

// Function to merge dependencies into package.json
const mergePackageJson = (templatesDir) => {
	const packageJsonPath = path.join(process.cwd(), 'package.json');
	const basePackageJsonPath = path.join(templatesDir, 'package.base.json');

	if (!fs.existsSync(packageJsonPath)) {
		console.error(chalk.red(`package.json not found in the project root.`));
		failedRerolling();
	}

	if (!fs.existsSync(basePackageJsonPath)) {
		console.error(
			chalk.red('package.base.json not found in the templates directory.')
		);
		failedRerolling();
	}

	const currentPackageJson = JSON.parse(
		fs.readFileSync(packageJsonPath, 'utf-8')
	);
	const basePackageJson = JSON.parse(
		fs.readFileSync(basePackageJsonPath, 'utf-8')
	);

	// Add extend field
	currentPackageJson.extends = './package.base.json';

	// Merge dependencies
	currentPackageJson.dependencies = {
		...basePackageJson.dependencies,
	};

	// Merge devDependencies
	currentPackageJson.devDependencies = {
		...basePackageJson.devDependencies,
	};

	fs.writeFileSync(
		packageJsonPath,
		JSON.stringify(currentPackageJson, null, 2)
	);
	console.log(
		chalk.green('Merged dependencies into package.json and added "extends".')
	);
};

// Function to create a new Vite project
const createViteProject = () => {
	console.log(chalk.yellow('Setting up a new Vite React-TS project...'));
	try {
		execSync('pnpx create-vite . --template react-ts', { stdio: 'inherit' });
		console.log(chalk.green('Vite React-TS project setup complete.'));
	} catch (error) {
		console.error(
			chalk.red(`Failed to set up Vite project at ${getErrorLine(error)}`),
			error.message
		);
		failedRerolling();
	}
};

// Function to initialize Git
const initializeGit = () => {
	console.log(chalk.yellow('Initializing Git repository...'));
	try {
		const getGitFolder = path.join(process.cwd(), '.git');
		if (!fs.existsSync(getGitFolder)) {
			execSync('git init', { stdio: 'inherit' });
			console.log(chalk.green('Git repository initialized.'));
		} else {
			console.log(
				chalk.yellow('Found git repository folder continue script...')
			);
		}
	} catch (error) {
		console.error(
			chalk.red(`Failed to initialize Git at ${getErrorLine(error)})`),
			error.message
		);
		failedRerolling();
	}
};

// Function to set up Husky
const setupHusky = () => {
	console.log(chalk.yellow('Setting up Husky...'));
	try {
		execSync('pnpm exec husky init', { stdio: 'inherit' });
		execSync('rm .husky/pre-commit', { stdio: 'inherit' });

		const huskyDir = path.join(process.cwd(), '.husky');
		const preCommitHook = path.join(huskyDir, 'pre-commit');
		const preCommitContent = `#!/bin/sh
echo "Running pre-commit hook..."
echo "Checking Configuration Files..."
echo "Updating Mizrahi Libraries..."
pnpm update @umtb/shared-ui-cmp@latest
pnpm update @umtb/shared-ui-utils@latest
echo "Updating scripts checking files"
npx --package @umtb/mfe-scripts update-mfe`;

		fs.writeFileSync(preCommitHook, preCommitContent.trim());
		fs.chmodSync(preCommitHook, '755');

		const commitMsgHook = path.join(huskyDir, 'commit-msg');
		const commitMsgContent = `#!/bin/sh
MSG="$1"
if  grep -i -qe "wip" "$MSG" ; then
  echo "WIP detected. skipping warning in build"
else
      echo "run build"
      pnpm run build
      TEST_RESULT=$?
  if [ -n $TEST_RESULT  ] && [ $TEST_RESULT -ne 0 ] ; then
    echo "build failed you can  commits without WIP in them require tests to pass"
    exit 1
    fi
  fi`;

		fs.writeFileSync(commitMsgHook, commitMsgContent.trim());
		fs.chmodSync(commitMsgHook, '755');
		console.log(chalk.green('Husky pre-commit and commit-msg hook installed.'));
	} catch (error) {
		console.error(
			chalk.red(`Failed to set up Husky at ${getErrorLine(error)}`),
			error.message
		);
		failedRerolling();
	}
};

// Function to add federation to Vite config files
const addViteConfig = (filePath, mfeName) => {
	const mfeNameCapitalized = mfeName.charAt(0).toUpperCase() + mfeName.slice(1);
	let serverPort = 0;
	let previewPort = 0;

	try {
		// Read from mfe-port json file for the current if not fail it
		const pathDir = path.resolve(__dirname, '../');
		const readMfePort = fs.readFileSync(
			`${pathDir}/mfe-ports-list.json`,
			'utf8'
		);

		if (readMfePort.includes(mfeName)) {
			const setJson = JSON.parse(readMfePort);
			serverPort = setJson[mfeName].port;
			previewPort = setJson[mfeName].previewPort;
		} else {
			throw new Error('Cant find port for vite config file');
		}

		const fileContent = fs.readFileSync(
			`${pathDir}/templates/vite.config.txt`,
			'utf8'
		);
		const searchMarker = [
			'{<FEDERATION>}',
			'{<MFE NAME>}',
			'{<SERVER PORT>}',
			'{<PREVIEW PORT>}',
		];
		const federationPlugin = `federation({
    name: 'remote-${mfeName}',
    filename: 'remote-${mfeName}.js',
    exposes: {
        './Mfe${mfeNameCapitalized}': './src/components/Mfe${mfeNameCapitalized}.tsx',
    },
    shared: ['react', 'react-dom', 'react-router-dom'],
})`;

		const replacement = [federationPlugin, mfeName, serverPort, previewPort];
		let newContent = fileContent;

		// Construct the new content with the replacement
		for (let i = 0; i < searchMarker.length; i++) {
			const marker = searchMarker[i];
			const replacementString = replacement[i];
			const regex = new RegExp(marker, 'g');
			newContent = newContent.replace(regex, replacementString);
		}

		fs.writeFileSync(filePath, newContent.trim());
		console.log(chalk.green(`Federation configuration added to ${filePath}.`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to write federation configuration to ${filePath}: ${
					error.message
				} at ${getErrorLine(error)}`
			)
		);
		failedRerolling();
	}
};

// Function to copy configuration files
const copyConfigFiles = () => {
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

	// Create axios files
	createFileFromTemplate(
		path.join(infrastructureDirs.axios, 'axios-instance.ts'),
		path.join(templatesDir, 'infrastructure', 'axios', 'axios-instance.ts'),
		mfeName,
		'infrastructure'
	);

	// Create routing files
	createFileFromTemplate(
		path.join(infrastructureDirs.routing, 'AppRoutesConfig.tsx'),
		path.join(templatesDir, 'infrastructure', 'routing', 'AppRoutesConfig.tsx'),
		mfeName,
		'infrastructure'
	);

	createFileFromTemplate(
		path.join(infrastructureDirs.routing, 'OwnRouter.tsx'),
		path.join(templatesDir, 'infrastructure', 'routing', 'OwnRouter.tsx'),
		mfeName,
		'infrastructure'
	);

	createFileFromTemplate(
		path.join(infrastructureDirs.routing, 'routing-paths.ts'),
		path.join(templatesDir, 'infrastructure', 'routing', 'routing-paths.ts'),
		mfeName,
		'infrastructure'
	);

	// Create hooks files
	createHookFiles(templatesDir);

	// Create utils files
	createUtilFiles(templatesDir);
};

// Function to create hook files
const createHookFiles = (templatesDir) => {
	const hookDir = path.join(process.cwd(), 'src', 'hooks');
	fs.mkdirSync(hookDir, { recursive: true });

	createFileFromTemplate(
		path.join(hookDir, 'useIsInQueryProvider.ts'),
		path.join(templatesDir, 'hooks', 'useIsInQueryProvider.ts'),
		null,
		'hook'
	);

	createFileFromTemplate(
		path.join(hookDir, 'useIsInRouter.ts'),
		path.join(templatesDir, 'hooks', 'useIsInRouter.ts'),
		null,
		'hook'
	);
};

// Function to create util files
const createUtilFiles = (templatesDir) => {
	const utilsDir = path.join(process.cwd(), 'src', 'utils');
	fs.mkdirSync(utilsDir, { recursive: true });

	createFileFromTemplate(
		path.join(utilsDir, 'ErrorPage.tsx'),
		path.join(templatesDir, 'utils', 'ErrorPage.tsx'),
		null,
		'utils'
	);
};

// Helper function to create a file from template
const createFileFromTemplate = (targetPath, templatePath, mfeName, type) => {
	if (!fs.existsSync(targetPath)) {
		if (fs.existsSync(templatePath)) {
			let content = fs.readFileSync(templatePath, 'utf-8');
			if (mfeName) {
				content = content.replace(/{<MFE NAME>}/g, mfeName);
			}
			fs.writeFileSync(targetPath, content.trim());
			console.log(chalk.green(`Created ${type}: ${targetPath}`));
		} else {
			console.error(chalk.red(`${type} template not found at ${templatePath}`));
		}
	} else {
		console.log(chalk.cyan(`${type} already exists: ${targetPath}`));
	}
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

// Function to add MFE name to tsconfig
const addMfeNameToTsConfig = (filePath, mfeName) => {
	try {
		console.log(chalk.magenta(`Setting tsconfig File Changes...`));
		const pathDir = path.resolve(__dirname, '../');
		const fileContent = fs.readFileSync(
			`${pathDir}/templates/tsconfig.app.json`,
			'utf8'
		);
		const searchMarker = ['{<MFE NAME>}'];
		const replacement = [mfeName];
		let newContent = fileContent;

		for (let i = 0; i < searchMarker.length; i++) {
			const marker = searchMarker[i];
			const replacementString = replacement[i];
			const regex = new RegExp(marker, 'g');
			newContent = newContent.replace(regex, replacementString);
		}

		fs.writeFileSync(filePath, newContent.trim());
		console.log(chalk.green(`Changed tsconfig.app.json file ${filePath}.`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to write to tsconfig.app.json file to ${filePath}: ${
					error.message
				} at ${getErrorLine(error)}`
			)
		);
		failedRerolling();
	}
};

// Function to invoke pnpm install
const invokePnpmInstall = () => {
	console.log(chalk.magenta(`Invoking pnpm install...`));
	execSync('pnpm install', { stdio: 'inherit' });
	console.log(chalk.magenta(`Invoking pnpm install for Mizrahi Libraries...`));
	execSync('pnpm install @umtb/shared-ui-cmp @umtb/shared-ui-utils', {
		stdio: 'inherit',
	});
};

// Function to change Docker files
const changeDockerFile = (filePath, filePrefixPath, mfeName) => {
	console.log(chalk.magenta(`Setting Docker File Changes...`));
	const searchMarker = ['{<MFE NAME>}'];
	changeCurlyNamesInFiles(filePath, filePrefixPath, [mfeName], searchMarker);
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

// Helper function for failed rerolling
function failedRerolling() {
	console.log(chalk.bgRed(`Failed to setup MFE`));
	console.log(chalk.redBright(`Rerolling configuration`));
	cleanDirectory();
	process.exit(1);
}

// Main setup function
const setupMfe = () => {
	try {
		const version = require('../../package.json').version || 'Error';
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
