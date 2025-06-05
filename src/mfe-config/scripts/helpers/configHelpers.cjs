const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { getErrorLine } = require('./fileHelpers.cjs');
const { changeCurlyNamesInFiles } = require('./fileHelpers.cjs');

/**
 * Merges dependencies from base package.json
 * @param {string} templatesDir - Templates directory path
 */
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

/**
 * Adds federation configuration to Vite config
 * @param {string} filePath - Target file path
 * @param {string} mfeName - MFE name
 */
const addViteConfig = (filePath, mfeName) => {
	const mfeNameCapitalized = mfeName.charAt(0).toUpperCase() + mfeName.slice(1);
	let serverPort = 0;
	let previewPort = 0;

	try {
		// Read from mfe-port json file
		const pathDir = path.resolve(__dirname, '../../');
		const readMfePort = fs.readFileSync(
			`${pathDir}/mfe-ports-list.json`,
			'utf8'
		);

		if (readMfePort.includes(mfeName)) {
			const setJson = JSON.parse(readMfePort);
			serverPort = setJson[mfeName].port;
			previewPort = setJson[mfeName].previewPort;
		} else {
			throw new Error("Can't find port for vite config file");
		}

		const fileContent = fs.readFileSync(
			`${pathDir}/templates/vite.config.ts`,
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

/**
 * Updates package.json scripts
 * @param {string} mfeName - MFE name
 */
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

/**
 * Updates title in index.html
 * @param {string} mfeName - MFE name
 */
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

/**
 * Adds MFE name to tsconfig
 * @param {string} filePath - Target file path
 * @param {string} mfeName - MFE name
 */
const addMfeNameToTsConfig = (filePath, mfeName) => {
	try {
		console.log(chalk.magenta(`Setting tsconfig File Changes...`));
		const pathDir = path.resolve(__dirname, '../../');
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

module.exports = {
	mergePackageJson,
	addViteConfig,
	changingPackageJsonScripts,
	updateTitle,
	addMfeNameToTsConfig,
	createInfrastructureFiles,
};
