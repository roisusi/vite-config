#!/usr/bin/env node

/**
 * To debug this file:
 * 1. Using Node.js debugger:
 *    - Run: `node --inspect-brk menu.cjs`
 *    - Open Chrome and navigate to chrome://inspect
 *    - Click "Open dedicated DevTools for Node"
 *
 * 2. Using VS Code:
 *    - Add a breakpoint by clicking the line number
 *    - Press F5 or use the Run and Debug panel
 *    - Select "Node.js" as the debugger
 *    - The launch.json will be created automatically
 */

const { Select } = require('enquirer');
const { execSync } = require('child_process');
const chalk = require('chalk');
const path = require('path');

// Functions to handle actions
const runSetupMfe = () => {
	console.log(chalk.green('Running MFE Create Setup...'));
	try {
		execSync(`node ${path.join(__dirname, 'setup-mfe.cjs')}`, {
			stdio: 'inherit',
		});
	} catch (error) {
		console.error(chalk.red('Error running MFE Create Setup:'), error.message);
		process.exit(1);
	}
};

const runAddNewSub = () => {
	console.log(chalk.yellow('Running Add New Content...'));
	try {
		execSync(`node ${path.join(__dirname, 'mfe-add-new-sub.cjs')}`, {
			stdio: 'inherit',
		});
	} catch (error) {
		console.error(chalk.red('Error running Add New Content:'), error.message);
		process.exit(1);
	}
};

// Display menu
const displayMenu = async () => {
	console.log(chalk.green('Welcome to the MFE Management Tool!'));
	try {
		const prompt = new Select({
			name: 'action',
			message: 'Choose an action:',
			choices: [
				{ name: 'setup', message: chalk.green('Create New MFE') },
				{ name: 'add', message: chalk.yellow('Add New Content to MFE') },
			],
		});

		const action = await prompt.run();
		if (action === 'setup') {
			runSetupMfe();
		} else if (action === 'add') {
			runAddNewSub();
		} else {
			console.log(chalk.red('Invalid choice.'));
		}
	} catch (error) {
		console.error(
			chalk.red('An error occurred while displaying the menu:'),
			error.message
		);
		process.exit(1);
	}
};

displayMenu();
