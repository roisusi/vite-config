const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

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

module.exports = {
	getErrorLine,
	changeCurlyNamesInFiles,
	copyErrorPage,
};
