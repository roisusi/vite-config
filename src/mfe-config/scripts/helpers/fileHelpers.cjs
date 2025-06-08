const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const cheerio = require('cheerio');
const { CONFIG_FILES, DIRECTORIES } = require('./constants.cjs');
const { failedRerolling } = require('./uiHelpers.cjs');
const { getErrorLine } = require('./fileHelpers.cjs');
const { changeCurlyNamesInFiles } = require('./fileHelpers.cjs');

/**
 * Gets the line number from an error stack trace
 * @param {Error} error - The error object
 * @returns {string} The line number or "Unknown Location"
 */
function getErrorLine(error) {
	const match = error.stack.match(/(\w+\.cjs:\d+:\d+)/);
	return match ? match[1] : 'Unknown Location';
}

/**
 * Changes placeholders in files using curly braces notation
 * @param {string} filePath - Target file path
 * @param {string} filePrefixPath - Template file path prefix
 * @param {string[]} arrayOfNames - Array of replacement values
 * @param {string[]} arrayOfMarkers - Array of markers to replace
 */
const changeCurlyNamesInFiles = (
	filePath,
	filePrefixPath,
	arrayOfNames,
	arrayOfMarkers
) => {
	const pathDir = path.resolve(__dirname, '../../');
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

/**
 * Copies ErrorPage.tsx to utils folder
 * @param {string} templatesDir - Templates directory path
 */
const copyErrorPage = (templatesDir) => {
	const targetPath = path.join(process.cwd(), 'src', 'utils', 'ErrorPage.tsx');
	const templatePath = path.join(templatesDir, 'utils', 'ErrorPage.tsx');

	if (!fs.existsSync(targetPath)) {
		if (fs.existsSync(templatePath)) {
			fs.copyFileSync(templatePath, targetPath);
			console.log(chalk.green(`Created ErrorPage component: ${targetPath}`));
		} else {
			console.error(
				chalk.red(`ErrorPage template not found at ${templatePath}`)
			);
		}
	} else {
		console.log(
			chalk.cyan(`ErrorPage component already exists: ${targetPath}`)
		);
	}
};

/**
 * Copies configuration files from templates
 */
const copyConfigFiles = () => {
	console.log(chalk.yellow('Copying configuration files...'));
	try {
		const templatesDir = path.join(__dirname, '../../templates');
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

/**
 * Creates all required directories and components
 * @returns {Object} mfeName and mfeNameCapitalized
 */
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
	const templatesDir = path.join(__dirname, '../../templates');

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

	// Create Mfe<n>.tsx
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

	// Create data directory and MockHostData.ts
	const dataDir = path.join(process.cwd(), 'src', 'data');
	fs.mkdirSync(dataDir, { recursive: true });

	const mockDataPath = path.join(
		process.cwd(),
		'src',
		'data',
		'MockHostData.ts'
	);
	const mockDataTemplatePath = path.join(
		templatesDir,
		'data',
		'MockHostData.ts'
	);

	if (!fs.existsSync(mockDataPath)) {
		if (fs.existsSync(mockDataTemplatePath)) {
			fs.copyFileSync(mockDataTemplatePath, mockDataPath);
			console.log(chalk.green(`Created data file: ${mockDataPath}`));
		} else {
			console.error(chalk.red(`Template not found at ${mockDataTemplatePath}`));
		}
	} else {
		console.log(chalk.cyan(`File already exists: ${mockDataPath}`));
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

	return { mfeName, mfeNameCapitalized };
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
		wrappers: {
			'RouterBuild.tsx': 'infrastructure/wrappers/RouterBuild.tsx',
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

/**
 * Deletes Vite assets
 */
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

/**
 * Replaces App.tsx content and clears CSS files
 * @param {string} filePath - Target file path
 * @param {string} filePrefixPath - Template file path prefix
 * @param {string} mfeName - MFE name
 */
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

/**
 * Initializes README.md with MFE name
 * @param {string} filePath - Target file path
 * @param {string} mfeName - MFE name
 */
const initializeReadme = (filePath, mfeName) => {
	try {
		const pathDir = path.resolve(__dirname, '../../');
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

/**
 * Copies and sets up testing provider wrapper
 */
const copyTestingProviderWrapper = () => {
	try {
		const templatesDir = path.join(__dirname, '../../templates');
		const testDir = path.join(process.cwd(), 'src/utils/test');

		// Ensure test directory exists
		fs.mkdirSync(testDir, { recursive: true });

		// Copy TestingProviderWrapper
		const providerSource = path.join(
			templatesDir,
			'utils/test/TestingProviderWrapper.tsx'
		);
		const providerDest = path.join(testDir, 'TestingProviderWrapper.tsx');

		if (!fs.existsSync(providerDest)) {
			fs.copyFileSync(providerSource, providerDest);
			console.log(chalk.green('Created TestingProviderWrapper.tsx'));
		} else {
			console.log(chalk.cyan('TestingProviderWrapper.tsx already exists'));
		}
	} catch (error) {
		console.error(
			chalk.red(`Failed to copy TestingProviderWrapper: ${error.message}`)
		);
		throw error;
	}
};

module.exports = {
	getErrorLine,
	changeCurlyNamesInFiles,
	copyErrorPage,
	copyConfigFiles,
	createDirectories,
	createInfrastructureFiles,
	deleteViteAssets,
	replaceAppTsx,
	initializeReadme,
	copyTestingProviderWrapper,
};
