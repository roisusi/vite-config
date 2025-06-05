const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

/**
 * Displays a beautiful square banner with version
 * @param {string} version - Version number to display
 */
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

/**
 * Cleans the current directory except for .git
 * @returns {boolean} - Returns true if cleaning was successful, false otherwise
 */
const cleanDirectory = () => {
	try {
		console.log(chalk.yellow('Cleaning the current directory...'));
		const files = fs.readdirSync(process.cwd());

		files.forEach((file) => {
			try {
				const filePath = path.join(process.cwd(), file);
				if (file === '.git') {
					return;
				}
				if (fs.lstatSync(filePath).isDirectory()) {
					fs.rmSync(filePath, { recursive: true, force: true });
				} else {
					fs.unlinkSync(filePath);
				}
			} catch (fileError) {
				console.error(
					chalk.red(`Failed to remove ${file}: ${fileError.message}`)
				);
				return false;
			}
		});

		console.log(chalk.green('Directory cleaned.'));
		return true;
	} catch (error) {
		console.error(chalk.red(`Failed to clean directory: ${error.message}`));
		return false;
	}
};

/**
 * Handles failed setup by displaying error message and cleaning up
 * @param {Error} [error] - Optional error object to display
 */
const failedRerolling = (error) => {
	console.log(
		chalk.bgRed(`Failed to setup MFE${error ? ': ' + error.message : ''}`)
	);
	console.log(chalk.redBright(`Rerolling configuration`));
	if (cleanDirectory()) {
		console.log(chalk.green('Cleanup successful.'));
	} else {
		console.log(
			chalk.red('Cleanup failed - please clean the directory manually.')
		);
	}
	process.exit(1);
};

module.exports = {
	displayBanner,
	failedRerolling,
	cleanDirectory,
};
