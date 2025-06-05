const chalk = require('chalk');

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
 * Handles failed setup by displaying error message
 */
function failedRerolling() {
	console.log(chalk.bgRed(`Failed to setup MFE`));
	console.log(chalk.redBright(`Rerolling configuration`));
	cleanDirectory();
	process.exit(1);
}

module.exports = {
	displayBanner,
	failedRerolling,
};
