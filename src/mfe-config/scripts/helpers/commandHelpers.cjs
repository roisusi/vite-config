const { execSync } = require('child_process');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { getErrorLine } = require('./fileHelpers.cjs');
const { failedRerolling } = require('./uiHelpers.cjs');

/**
 * Checks if a command is available in the system
 * @param {string} command - Command to check
 * @returns {boolean} - Whether the command is available
 */
const isCommandAvailable = (command) => {
	try {
		execSync(`which ${command}`, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
};

/**
 * Creates a new Vite project
 */
const createViteProject = () => {
	console.log(chalk.yellow('Creating Vite project...'));
	try {
		execSync('pnpm create vite@latest . --template react-ts', {
			stdio: 'inherit',
		});
		console.log(chalk.green('Vite project created.'));
	} catch (error) {
		console.error(
			chalk.red(`Failed to create Vite project at ${getErrorLine(error)}`),
			error.message
		);
		failedRerolling();
	}
};

/**
 * Initializes Git repository if not exists
 */
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

/**
 * Installs pnpm dependencies
 * @returns {Promise<void>}
 */
const invokePnpmInstall = async () => {
	console.log(chalk.yellow('Installing dependencies...'));
	try {
		// First install base dependencies
		execSync('pnpm install', { stdio: 'inherit' });
		console.log(chalk.green('Base dependencies installed successfully.'));

		// Install husky explicitly and set it up
		console.log(chalk.yellow('Installing and setting up Husky...'));
		execSync('pnpm install husky --save-dev', { stdio: 'inherit' });
		execSync('pnpm exec husky install', { stdio: 'inherit' });
		console.log(chalk.green('Husky installed and enabled successfully.'));

		// Try to install Mizrahi Libraries
		try {
			console.log(chalk.yellow('Installing Mizrahi Libraries...'));
			execSync('pnpm install @umtb/shared-ui-cmp @umtb/shared-ui-utils', {
				stdio: 'inherit',
			});
			console.log(chalk.green('Mizrahi Libraries installed successfully.'));
		} catch (mizrahiError) {
			console.warn(
				chalk.yellow(
					"Failed to install Mizrahi Libraries. This is expected if you don't have access to the private packages."
				)
			);
			console.warn(
				chalk.yellow('You can install them later when you have proper access.')
			);
		}

		const updatedDeps = [];
		const updatedDevDeps = [];

		if (updatedDeps.length > 0) {
			console.log(chalk.blue('Dependencies updated:', updatedDeps.join(', ')));
		}
	} catch (error) {
		console.error(
			chalk.red(`Failed to install dependencies at ${getErrorLine(error)}`),
			error.message
		);
		throw error;
	}
};

/**
 * Sets up Husky with pre-commit and commit-msg hooks
 * @returns {Promise<void>}
 */
const setupHusky = async () => {
	console.log(chalk.yellow('Setting up Husky hooks...'));
	try {
		// Remove default pre-commit hook if it exists
		const preCommitPath = path.join(process.cwd(), '.husky', 'pre-commit');
		if (fs.existsSync(preCommitPath)) {
			fs.unlinkSync(preCommitPath);
		}

		const huskyDir = path.join(process.cwd(), '.husky');
		if (!fs.existsSync(huskyDir)) {
			fs.mkdirSync(huskyDir, { recursive: true });
		}

		const preCommitHook = path.join(huskyDir, 'pre-commit');
		const preCommitContent = `#!/bin/sh
echo "Running pre-commit hook..."
echo "Checking Configuration Files..."
echo "Updating Mizrahi Libraries..."
if pnpm update @umtb/shared-ui-cmp@latest @umtb/shared-ui-utils@latest  @umtb/shared-i18n@latest; then
    echo "Mizrahi Libraries updated successfully"
else
    echo "Warning: Failed to update Mizrahi Libraries. This is expected if you don't have access."
fi
echo "Updating scripts checking files"
if npx --package @umtb/mfe-scripts update-mfe; then
    echo "MFE scripts updated successfully"
else
    echo "Warning: Failed to update MFE scripts"
fi`;

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
		console.log(chalk.green('Husky hooks created successfully.'));
	} catch (error) {
		console.error(
			chalk.red(`Failed to set up Husky at ${getErrorLine(error)}`),
			error.message
		);
		failedRerolling();
	}
};

module.exports = {
	isCommandAvailable,
	createViteProject,
	initializeGit,
	setupHusky,
	invokePnpmInstall,
};
