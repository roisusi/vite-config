#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Ensure we're in a valid project directory
try {
	// Check if package.json exists in current directory
	if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
		console.error(
			chalk.red(
				'Error: Not in a valid project directory (package.json not found)'
			)
		);
		process.exit(1);
	}
} catch (error) {
	console.error(chalk.red(`Error: ${error.message}`));
	process.exit(1);
}

// Function to get error line
function getErrorLine(error) {
	const match = error.stack.match(/(\w+\.cjs:\d+:\d+)/);
	return match ? match[1] : 'Unknown Location';
}

// Function to calculate file hash
function calculateFileHash(filePath) {
	try {
		const content = fs.readFileSync(filePath);
		return crypto.createHash('md5').update(content).digest('hex');
	} catch (error) {
		return null;
	}
}

// Function to validate directory structure
const validateDirectoryStructure = () => {
	console.log(chalk.yellow('Validating directory structure...'));
	const requiredDirs = [
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
		'src/interfaces',
		'src/models',
		'src/types',
		'src/utils',
	];

	const missingDirs = [];
	requiredDirs.forEach((dir) => {
		const fullPath = path.join(process.cwd(), dir);
		if (!fs.existsSync(fullPath)) {
			missingDirs.push(dir);
			console.log(chalk.red(`Missing directory: ${dir}`));
		}
	});

	if (missingDirs.length > 0) {
		console.log(chalk.yellow('Creating missing directories...'));
		missingDirs.forEach((dir) => {
			const fullPath = path.join(process.cwd(), dir);
			fs.mkdirSync(fullPath, { recursive: true });
			console.log(chalk.green(`Created directory: ${dir}`));
		});
	} else {
		console.log(chalk.green('All required directories exist.'));
	}
};

/**
 * Validates TypeScript configuration files
 */
const validateTsConfig = () => {
	console.log(chalk.yellow('Validating TypeScript configuration...'));

	const tsConfigFiles = [
		'tsconfig.app.json',
		'tsconfig.node.json',
		'tsconfig.json',
	];

	const templatesDir = path.join(__dirname, '../templates');

	tsConfigFiles.forEach((configFile) => {
		const templatePath = path.join(templatesDir, configFile);
		const targetPath = path.join(process.cwd(), configFile);

		console.log(chalk.yellow(`Checking ${configFile}...`));

		// Skip if template doesn't exist
		if (!fs.existsSync(templatePath)) {
			console.log(
				chalk.yellow(`Template for ${configFile} not found in ${templatesDir}`)
			);
			return;
		}

		// Create file if it doesn't exist
		if (!fs.existsSync(targetPath)) {
			console.log(
				chalk.yellow(`${configFile} not found, creating from template...`)
			);
			fs.copyFileSync(templatePath, targetPath);
			console.log(chalk.green(`Created ${configFile}`));
			return;
		}

		// Compare files
		const oldHash = calculateFileHash(targetPath);
		const templateHash = calculateFileHash(templatePath);

		if (oldHash !== templateHash) {
			console.log(chalk.yellow(`${configFile} differs , updating...`));
			fs.copyFileSync(templatePath, targetPath);
			console.log(chalk.green(`Updated ${configFile} from template`));
		} else {
			console.log(chalk.cyan(`${configFile} is up to date`));
		}
	});
};

/**
 * Validates all template files
 */
const validateTemplateFiles = () => {
	console.log(chalk.yellow('Validating template files...'));

	const templatesDir = path.join(__dirname, '../templates');
	const templateFiles = [
		'eslintCustom.mjs',
		'.prettierrc',
		'temp.gitignore',
		'.dockerignore',
		'eslint.config.js',
	];

	// Handle regular template files
	templateFiles.forEach((file) => {
		const templatePath = path.join(templatesDir, file);
		const targetPath = path.join(
			process.cwd(),
			file === 'temp.gitignore' ? '.gitignore' : file
		);

		if (!fs.existsSync(templatePath)) {
			console.log(chalk.yellow(`Template not found: ${file}`));
			return;
		}

		// Only create new files or update if there are changes
		if (
			!fs.existsSync(targetPath) ||
			calculateFileHash(targetPath) !== calculateFileHash(templatePath)
		) {
			fs.copyFileSync(templatePath, targetPath);
			console.log(chalk.green(`Updated ${file}`));
		} else {
			console.log(chalk.cyan(`${file} is up to date`));
		}
	});

	// Handle MockHostData.ts separately
	const mockDataTemplatePath = path.join(
		templatesDir,
		'data',
		'MockHostData.ts'
	);
	const mockDataTargetPath = path.join(
		process.cwd(),
		'src',
		'data',
		'MockHostData.ts'
	);

	// Ensure data directory exists
	const dataDir = path.join(process.cwd(), 'src', 'data');
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}

	if (!fs.existsSync(mockDataTemplatePath)) {
		console.log(chalk.yellow('MockHostData.ts template not found'));
		return;
	}

	if (!fs.existsSync(mockDataTargetPath)) {
		fs.copyFileSync(mockDataTemplatePath, mockDataTargetPath);
		console.log(chalk.green(`Created data file: ${mockDataTargetPath}`));
	} else if (
		calculateFileHash(mockDataTargetPath) !==
		calculateFileHash(mockDataTemplatePath)
	) {
		fs.copyFileSync(mockDataTemplatePath, mockDataTargetPath);
		console.log(chalk.green(`Updated data file: ${mockDataTargetPath}`));
	} else {
		console.log(chalk.cyan(`Data file is up to date: ${mockDataTargetPath}`));
	}
};

/**
 * Validates package.json dependencies by adding missing ones from package.base.json,
 * removing ones that are no longer in package.base.json, and updating versions
 * Preserves any project-specific dependencies not from package.base.json
 * Maintains order from package.base.json and keeps extra dependencies at the bottom
 */
const validatePackageJson = async () => {
	console.log(chalk.yellow('Validating package.json dependencies...'));

	const templatePath = path.join(__dirname, '../templates/package.base.json');
	const projectBasePath = path.join(process.cwd(), 'package.base.json');
	const targetPath = path.join(process.cwd(), 'package.json');

	if (!fs.existsSync(templatePath)) {
		console.log(chalk.yellow('Template package.base.json not found'));
		return;
	}

	// First, copy package.base.json to project if it doesn't exist
	if (!fs.existsSync(projectBasePath)) {
		console.log(chalk.yellow('Copying package.base.json to project...'));
		fs.copyFileSync(templatePath, projectBasePath);
		console.log(chalk.green('Created package.base.json'));
	} else {
		// Update existing package.base.json if template has changes
		const templateContent = fs.readFileSync(templatePath, 'utf8');
		const projectBaseContent = fs.readFileSync(projectBasePath, 'utf8');
		if (templateContent !== projectBaseContent) {
			console.log(chalk.yellow('Updating package.base.json...'));
			fs.writeFileSync(projectBasePath, templateContent);
			console.log(chalk.green('Updated package.base.json'));
		}
	}

	// Read all files
	const templateContent = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
	const currentContent = fs.existsSync(targetPath)
		? JSON.parse(fs.readFileSync(targetPath, 'utf8'))
		: {};

	let hasChanges = false;
	const missingDeps = [];
	const missingDevDeps = [];
	const removedDeps = [];
	const removedDevDeps = [];
	const updatedDeps = [];
	const updatedDevDeps = [];

	// Function to create ordered dependencies object
	const createOrderedDependencies = (baseDeps, currentDeps) => {
		const ordered = {};
		const extra = {};

		// First, add all base dependencies in their original order
		if (baseDeps) {
			for (const [dep, version] of Object.entries(baseDeps)) {
				if (currentDeps && currentDeps[dep]) {
					ordered[dep] = currentDeps[dep];
				}
			}
		}

		// Then, add any extra dependencies that aren't in base
		if (currentDeps) {
			for (const [dep, version] of Object.entries(currentDeps)) {
				if (!baseDeps || !(dep in baseDeps)) {
					extra[dep] = version;
				}
			}
		}

		// Return both ordered base deps and extra deps
		return { ordered, extra };
	};

	// Initialize dependencies objects if they don't exist
	currentContent.dependencies = currentContent.dependencies || {};
	currentContent.devDependencies = currentContent.devDependencies || {};

	// Handle regular dependencies
	const { ordered: orderedDeps, extra: extraDeps } = createOrderedDependencies(
		templateContent.dependencies,
		currentContent.dependencies
	);

	// Handle devDependencies
	const { ordered: orderedDevDeps, extra: extraDevDeps } =
		createOrderedDependencies(
			templateContent.devDependencies,
			currentContent.devDependencies
		);

	// Process regular dependencies
	if (templateContent.dependencies) {
		// Add missing dependencies and check versions
		for (const [dep, version] of Object.entries(templateContent.dependencies)) {
			if (!orderedDeps[dep]) {
				orderedDeps[dep] = version;
				missingDeps.push(dep);
				hasChanges = true;
			} else if (orderedDeps[dep] !== version) {
				// Version differs, update it
				const oldVersion = orderedDeps[dep];
				orderedDeps[dep] = version;
				updatedDeps.push(`${dep} (${oldVersion} → ${version})`);
				hasChanges = true;
			}
		}

		// Remove dependencies that are no longer in template
		const oldTemplateContent = fs.existsSync(projectBasePath)
			? JSON.parse(fs.readFileSync(projectBasePath, 'utf8'))
			: {};

		for (const [dep, version] of Object.entries(orderedDeps)) {
			if (
				oldTemplateContent.dependencies?.[dep] &&
				!templateContent.dependencies[dep]
			) {
				delete orderedDeps[dep];
				removedDeps.push(dep);
				hasChanges = true;
			}
		}
	}

	// Process devDependencies
	if (templateContent.devDependencies) {
		// Add missing devDependencies and check versions
		for (const [dep, version] of Object.entries(
			templateContent.devDependencies
		)) {
			if (!orderedDevDeps[dep]) {
				orderedDevDeps[dep] = version;
				missingDevDeps.push(dep);
				hasChanges = true;
			} else if (orderedDevDeps[dep] !== version) {
				// Version differs, update it
				const oldVersion = orderedDevDeps[dep];
				orderedDevDeps[dep] = version;
				updatedDevDeps.push(`${dep} (${oldVersion} → ${version})`);
				hasChanges = true;
			}
		}

		// Remove devDependencies that are no longer in template
		const oldTemplateContent = fs.existsSync(projectBasePath)
			? JSON.parse(fs.readFileSync(projectBasePath, 'utf8'))
			: {};

		for (const [dep, version] of Object.entries(orderedDevDeps)) {
			if (
				oldTemplateContent.devDependencies?.[dep] &&
				!templateContent.devDependencies[dep]
			) {
				delete orderedDevDeps[dep];
				removedDevDeps.push(dep);
				hasChanges = true;
			}
		}
	}

	// Combine ordered and extra dependencies
	currentContent.dependencies = {
		...orderedDeps,
		...extraDeps,
	};

	currentContent.devDependencies = {
		...orderedDevDeps,
		...extraDevDeps,
	};

	// Write back if there are changes
	if (hasChanges) {
		fs.writeFileSync(targetPath, JSON.stringify(currentContent, null, '\t'));
		console.log(chalk.green('Updated package.json:'));
		if (missingDeps.length > 0) {
			console.log(chalk.cyan('Dependencies added:', missingDeps.join(', ')));
		}
		if (missingDevDeps.length > 0) {
			console.log(
				chalk.cyan('DevDependencies added:', missingDevDeps.join(', '))
			);
		}
		if (updatedDeps.length > 0) {
			console.log(chalk.blue('Dependencies updated:', updatedDeps.join(', ')));
		}
		if (updatedDevDeps.length > 0) {
			console.log(
				chalk.blue('DevDependencies updated:', updatedDevDeps.join(', '))
			);
		}
		if (removedDeps.length > 0) {
			console.log(
				chalk.yellow('Dependencies removed:', removedDeps.join(', '))
			);
		}
		if (removedDevDeps.length > 0) {
			console.log(
				chalk.yellow('DevDependencies removed:', removedDevDeps.join(', '))
			);
		}
	} else {
		console.log(
			chalk.cyan(
				'package.json has all required dependencies with correct versions'
			)
		);
	}
};

// Add this function before the main update function
const updateMockHostData = (projectPath, templatePath) => {
	const mockDataPath = path.join(projectPath, 'src', 'data', 'MockHostData.ts');
	const templateAppPath = path.join(templatePath, 'App.tsx');

	// Create data directory if it doesn't exist
	const dataDir = path.join(projectPath, 'src', 'data');
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}

	if (!fs.existsSync(mockDataPath)) {
		// If MockHostData.ts doesn't exist, create it from App.tsx template
		try {
			const templateContent = fs.readFileSync(templateAppPath, 'utf8');
			const mockDataRegex =
				/const\s+MockHostData:\s+HostShellData\s+=\s+({[\s\S]*?});/;
			const templateMatch = templateContent.match(mockDataRegex);

			if (templateMatch) {
				const mockDataContent = `import { HostShellData } from '@umtb/shared-ui-utils';\n\nexport const MockHostData: HostShellData = ${templateMatch[1]};`;
				fs.writeFileSync(mockDataPath, mockDataContent);
				console.log('Created MockHostData.ts in data folder');
			}
		} catch (error) {
			console.error('Error creating MockHostData.ts:', error.message);
		}
	} else {
		// If MockHostData.ts exists, check for missing properties from template
		try {
			const templateContent = fs.readFileSync(templateAppPath, 'utf8');
			const projectContent = fs.readFileSync(mockDataPath, 'utf8');

			// Extract objects
			const templateMatch = templateContent.match(
				/const\s+MockHostData:\s+HostShellData\s+=\s+({[\s\S]*?});/
			);
			const projectMatch = projectContent.match(
				/export\s+const\s+MockHostData:\s+HostShellData\s+=\s+({[\s\S]*?});/
			);

			if (templateMatch && projectMatch) {
				// Parse the objects
				const templateObj = eval('(' + templateMatch[1] + ')');
				const projectObj = eval('(' + projectMatch[1] + ')');

				// Check for missing properties recursively
				let hasChanges = false;
				const checkMissingProps = (template, project, path = '') => {
					Object.keys(template).forEach((key) => {
						const fullPath = path ? `${path}.${key}` : key;
						if (!(key in project)) {
							project[key] = template[key];
							console.log(
								`Added missing property '${fullPath}' to MockHostData.ts`
							);
							hasChanges = true;
						} else if (
							typeof template[key] === 'object' &&
							template[key] !== null
						) {
							if (typeof project[key] !== 'object') {
								project[key] = {};
							}
							checkMissingProps(template[key], project[key], fullPath);
						}
					});
				};

				checkMissingProps(templateObj, projectObj);

				if (hasChanges) {
					const updatedContent = `import { HostShellData } from '@umtb/shared-ui-utils';\n\nexport const MockHostData: HostShellData = ${JSON.stringify(
						projectObj,
						null,
						4
					)};`;
					fs.writeFileSync(mockDataPath, updatedContent);
					console.log('Updated MockHostData.ts with missing properties');
				} else {
					console.log('MockHostData.ts has all required properties');
				}
			}
		} catch (error) {
			console.error('Error updating MockHostData.ts:', error.message);
		}
	}
};

/**
 * Validates all template files
 */
const validateConfigs = async () => {
	try {
		console.log(chalk.blue('Starting configuration update...'));

		// Validate project directory first
		const validateProjectDirectory = () => {
			try {
				// Check if package.json exists
				const packageJsonPath = path.join(process.cwd(), 'package.json');
				if (!fs.existsSync(packageJsonPath)) {
					throw new Error(
						'Not in a valid project directory (package.json not found)'
					);
				}

				// Check if src directory exists
				const srcPath = path.join(process.cwd(), 'src');
				if (!fs.existsSync(srcPath)) {
					fs.mkdirSync(srcPath, { recursive: true });
					console.log(chalk.yellow('Created src directory'));
				}

				return true;
			} catch (error) {
				console.error(
					chalk.red(`Error validating project directory: ${error.message}`)
				);
				process.exit(1);
			}
		};

		// Rest of your update logic
		validateDirectoryStructure();
		validateTemplateFiles();
		validateTsConfig();
		await validatePackageJson();
		updatePackageJson();
		const templatesDir = path.join(__dirname, '../templates');
		updateMockHostData(process.cwd(), templatesDir);
		console.log(chalk.blue('Configuration update completed successfully!'));
	} catch (error) {
		console.error(
			chalk.red(`Failed to update configurations: ${error.message}`)
		);
		process.exit(1);
	}
};

// Function to update package.json
const updatePackageJson = () => {
	console.log(chalk.yellow('Updating package.json...'));
	try {
		const packageJsonPath = path.join(process.cwd(), 'package.json');
		const oldHash = calculateFileHash(packageJsonPath);
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

		// Add extend field
		packageJson.extends = './package.base.json';

		// Write back to package.json
		fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
		const newHash = calculateFileHash(packageJsonPath);

		if (oldHash !== newHash) {
			console.log(chalk.green('package.json has been updated.'));
		} else {
			console.log(chalk.cyan('package.json is already up to date.'));
		}
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to update package.json: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		process.exit(1);
	}
};

// Execute update
validateConfigs();

module.exports = validateConfigs;
