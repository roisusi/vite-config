#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Function to get error line
function getErrorLine(error) {
	const match = error.stack.match(/(\w+\.cjs:\d+:\d+)/);
	return match ? match[1] : 'Unknown Location';
}

// Function to check if a command exists globally
const isCommandAvailable = (command) => {
	try {
		execSync(`command -v ${command}`, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
};

// Function to update package.json
const updatePackageJson = () => {
	console.log(chalk.yellow('Updating package.json...'));
	try {
		const packageJsonPath = path.join(process.cwd(), 'package.json');
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

		// Add extend field
		packageJson.extends = './package.base.json';

		// Write back to package.json
		fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
		console.log(chalk.green('Updated package.json successfully.'));
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

// Function to update dependencies
const updateDependencies = () => {
	console.log(chalk.yellow('Updating dependencies...'));
	try {
		// Check if pnpm is installed
		if (!isCommandAvailable('pnpm')) {
			console.log(
				chalk.yellow('pnpm is not installed. Installing it globally...')
			);
			execSync('npm install -g pnpm', { stdio: 'inherit' });
			console.log(chalk.green('pnpm installed globally.'));
		}

		// Update dependencies
		execSync('pnpm update', { stdio: 'inherit' });
		console.log(chalk.green('Dependencies updated successfully.'));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to update dependencies: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		process.exit(1);
	}
};

// Function to update configuration files
const updateConfigFiles = () => {
	console.log(chalk.yellow('Updating configuration files...'));
	try {
		const templatesDir = path.join(__dirname, '../templates');
		const configFiles = [
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

		configFiles.forEach((file) => {
			const source = path.join(templatesDir, file);
			if (file === 'temp.gitignore') {
				file = '.gitignore';
			}
			const destination = path.join(process.cwd(), file);

			if (!fs.existsSync(source)) {
				console.warn(
					chalk.yellow(`Template for ${file} not found in ${templatesDir}`)
				);
				return;
			}

			fs.copyFileSync(source, destination);
			console.log(chalk.green(`Updated ${file}`));
		});
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to update configuration files: ${
					error.message
				} at ${getErrorLine(error)}`
			)
		);
		process.exit(1);
	}
};

// Function to update Husky hooks
const updateHuskyHooks = () => {
	console.log(chalk.yellow('Updating Husky hooks...'));
	try {
		const huskyDir = path.join(process.cwd(), '.husky');
		if (!fs.existsSync(huskyDir)) {
			console.log(
				chalk.yellow('Husky directory not found. Initializing Husky...')
			);
			execSync('pnpm exec husky init', { stdio: 'inherit' });
		}

		// Update pre-commit hook
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

		// Update commit-msg hook
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

		console.log(chalk.green('Husky hooks updated successfully.'));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to update Husky hooks: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		process.exit(1);
	}
};

// Main function
const main = () => {
	try {
		console.log(chalk.blue('Starting configuration update...'));

		// Update package.json
		updatePackageJson();

		// Update dependencies
		updateDependencies();

		// Update configuration files
		updateConfigFiles();

		// Update Husky hooks
		updateHuskyHooks();

		console.log(chalk.blue('Configuration update completed successfully!'));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to update configurations: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		process.exit(1);
	}
};

main();
