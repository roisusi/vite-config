const { execSync } = require('child_process');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { getErrorLine } = require('./fileHelpers.cjs');
const { failedRerolling } = require('./uiHelpers.cjs');

/**
 * Checks if a command is available globally
 * @param {string} command - Command to check
 * @returns {boolean} Whether the command exists
 */
const isCommandAvailable = (command) => {
	try {
		execSync(`command -v ${command}`, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
};

/**
 * Creates a new Vite project
 */
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
 * Sets up Husky with pre-commit and commit-msg hooks
 */
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

/**
 * Installs project dependencies using pnpm
 */
const invokePnpmInstall = () => {
	console.log(chalk.magenta(`Invoking pnpm install...`));
	execSync('pnpm install', { stdio: 'inherit' });
	console.log(chalk.magenta(`Invoking pnpm install for Mizrahi Libraries...`));
	execSync('pnpm install @umtb/shared-ui-cmp @umtb/shared-ui-utils', {
		stdio: 'inherit',
	});
};

module.exports = {
	isCommandAvailable,
	createViteProject,
	initializeGit,
	setupHusky,
	invokePnpmInstall,
};
