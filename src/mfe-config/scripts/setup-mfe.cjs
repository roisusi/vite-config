#!/usr/bin/env node

const chalk = require('chalk');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const {
	getErrorLine,
	changeCurlyNamesInFiles,
	copyErrorPage,
	copyConfigFiles,
	createDirectories,
	deleteViteAssets,
	replaceAppTsx,
	initializeReadme,
} = require('./helpers/fileHelpers.cjs');
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
	changeDockerFile,
} = require('./helpers/configHelpers.cjs');
const {
	displayBanner,
	failedRerolling,
	cleanDirectory,
} = require('./helpers/uiHelpers.cjs');

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
					failedRerolling(new Error('Setup aborted by user'));
					return;
				}

				console.log(chalk.green('Proceeding with the setup...'));
				rl.close();

				try {
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
							throw new Error(
								'Failed to install pnpm globally: ' + error.message
							);
						}
					} else {
						console.log(chalk.green('pnpm is already installed.'));
					}

					// Clean directory
					if (!cleanDirectory()) {
						throw new Error('Failed to clean directory');
					}

					// Create Vite project
					createViteProject();

					// Initialize Git
					initializeGit();

					// Create directories and get MFE name
					const { mfeName, mfeNameCapitalized } = createDirectories();

					// Initialize README
					initializeReadme(path.join(process.cwd(), 'README.md'), mfeName);

					// Copy configuration files
					copyConfigFiles();

					// Copy ErrorPage component
					const templatesDir = path.join(__dirname, '../templates');
					copyErrorPage(templatesDir);

					// Merge package.json
					mergePackageJson(templatesDir);

					// Add federation configuration
					addViteConfig(path.join(process.cwd(), 'vite.config.ts'), mfeName);

					// Change package.json scripts
					changingPackageJsonScripts(mfeName);

					// Change Title of index.html
					updateTitle(mfeName);

					// Remove assets vite files
					deleteViteAssets();

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
					try {
						invokePnpmInstall();
					} catch (error) {
						console.error(
							chalk.red(`Failed to install dependencies: ${error.message}`)
						);
						process.exit(1);
					}

					// Set up Husky
					setupHusky();

					console.log(chalk.bgBlue('MFE setup completed successfully!'));
				} catch (setupError) {
					failedRerolling(setupError);
				}
			}
		);
	} catch (error) {
		failedRerolling(error);
	}
};

setupMfe();
