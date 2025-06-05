#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

// Function to get error line
function getErrorLine(error) {
	const match = error.stack.match(/(\w+\.cjs:\d+:\d+)/);
	return match ? match[1] : 'Unknown Location';
}

// Function to create API template
const createApiTemplate = (apiName, mfeName) => {
	const apiDir = path.join(process.cwd(), 'src', 'api');
	const apiFilePath = path.join(apiDir, `${apiName}.ts`);

	if (fs.existsSync(apiFilePath)) {
		console.log(
			chalk.yellow(`API file ${apiName}.ts already exists. Skipping...`)
		);
		return;
	}

	const apiTemplate = `import { axiosInstance } from '../infrastructure/axios/axios-instance';

export const ${apiName}Api = {
    get${apiName}: async () => {
        const response = await axiosInstance.get('/${mfeName}/${apiName}');
        return response.data;
    },
    
    post${apiName}: async (data: any) => {
        const response = await axiosInstance.post('/${mfeName}/${apiName}', data);
        return response.data;
    },
    
    put${apiName}: async (id: string, data: any) => {
        const response = await axiosInstance.put('/${mfeName}/${apiName}/${id}', data);
        return response.data;
    },
    
    delete${apiName}: async (id: string) => {
        const response = await axiosInstance.delete('/${mfeName}/${apiName}/${id}');
        return response.data;
    },
};`;

	try {
		fs.writeFileSync(apiFilePath, apiTemplate.trim());
		console.log(chalk.green(`Created API file: ${apiFilePath}`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to create API file: ${error.message} at ${getErrorLine(error)}`
			)
		);
		process.exit(1);
	}
};

// Function to create interface template
const createInterfaceTemplate = (interfaceName) => {
	const interfaceDir = path.join(process.cwd(), 'src', 'interfaces');
	const interfaceFilePath = path.join(interfaceDir, `${interfaceName}.ts`);

	if (fs.existsSync(interfaceFilePath)) {
		console.log(
			chalk.yellow(
				`Interface file ${interfaceName}.ts already exists. Skipping...`
			)
		);
		return;
	}

	const interfaceTemplate = `export interface I${interfaceName} {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}`;

	try {
		fs.writeFileSync(interfaceFilePath, interfaceTemplate.trim());
		console.log(chalk.green(`Created interface file: ${interfaceFilePath}`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to create interface file: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		process.exit(1);
	}
};

// Function to create component template
const createComponentTemplate = (componentName) => {
	const componentDir = path.join(process.cwd(), 'src', 'components', 'main');
	const componentFilePath = path.join(componentDir, `${componentName}.tsx`);

	if (fs.existsSync(componentFilePath)) {
		console.log(
			chalk.yellow(
				`Component file ${componentName}.tsx already exists. Skipping...`
			)
		);
		return;
	}

	const componentTemplate = `import React from 'react';
import { I${componentName} } from '../../interfaces/${componentName}';

interface ${componentName}Props {
    data: I${componentName};
    onUpdate?: (id: string, data: I${componentName}) => void;
    onDelete?: (id: string) => void;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ data, onUpdate, onDelete }) => {
    return (
        <div>
            <h2>{data.name}</h2>
            <p>{data.description}</p>
            {onUpdate && (
                <button onClick={() => onUpdate(data.id, data)}>
                    Update
                </button>
            )}
            {onDelete && (
                <button onClick={() => onDelete(data.id)}>
                    Delete
                </button>
            )}
        </div>
    );
};`;

	try {
		fs.writeFileSync(componentFilePath, componentTemplate.trim());
		console.log(chalk.green(`Created component file: ${componentFilePath}`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to create component file: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		process.exit(1);
	}
};

// Function to create container template
const createContainerTemplate = (containerName) => {
	const containerDir = path.join(
		process.cwd(),
		'src',
		'components',
		'containers'
	);
	const containerFilePath = path.join(
		containerDir,
		`${containerName}Container.tsx`
	);

	if (fs.existsSync(containerFilePath)) {
		console.log(
			chalk.yellow(
				`Container file ${containerName}Container.tsx already exists. Skipping...`
			)
		);
		return;
	}

	const containerTemplate = `import React, { useEffect, useState } from 'react';
import { ${containerName} } from '../main/${containerName}';
import { ${containerName}Api } from '../../api/${containerName}';
import { I${containerName} } from '../../interfaces/${containerName}';

export const ${containerName}Container: React.FC = () => {
    const [data, setData] = useState<I${containerName} | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await ${containerName}Api.get${containerName}();
            setData(response);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: string, updatedData: I${containerName}) => {
        try {
            await ${containerName}Api.put${containerName}(id, updatedData);
            await fetchData();
        } catch (err) {
            setError('Failed to update data');
            console.error('Error updating data:', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await ${containerName}Api.delete${containerName}(id);
            await fetchData();
        } catch (err) {
            setError('Failed to delete data');
            console.error('Error deleting data:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!data) return <div>No data available</div>;

    return (
        <${containerName}
            data={data}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
        />
    );
};`;

	try {
		fs.writeFileSync(containerFilePath, containerTemplate.trim());
		console.log(chalk.green(`Created container file: ${containerFilePath}`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to create container file: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		process.exit(1);
	}
};

// Function to update routing paths
const updateRoutingPaths = (componentName) => {
	const routingPathsFile = path.join(
		process.cwd(),
		'src',
		'infrastructure',
		'routing',
		'routing-paths.ts'
	);

	try {
		let content = fs.readFileSync(routingPathsFile, 'utf8');
		const newPath = `    ${componentName.toLowerCase()}: '/${componentName.toLowerCase()}',`;

		// Check if the path already exists
		if (content.includes(newPath)) {
			console.log(
				chalk.yellow(
					`Route for ${componentName} already exists in routing-paths.ts`
				)
			);
			return;
		}

		// Find the last route in the object
		const lastBraceIndex = content.lastIndexOf('}');
		if (lastBraceIndex === -1) {
			throw new Error('Invalid routing-paths.ts format');
		}

		// Insert the new path before the closing brace
		content =
			content.slice(0, lastBraceIndex) +
			(content[lastBraceIndex - 1] === ',' ? '' : ',\n') +
			newPath +
			'\n' +
			content.slice(lastBraceIndex);

		fs.writeFileSync(routingPathsFile, content);
		console.log(chalk.green(`Updated routing paths with ${componentName}`));
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to update routing paths: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		process.exit(1);
	}
};

// Function to update app routes config
const updateAppRoutesConfig = (componentName) => {
	const appRoutesFile = path.join(
		process.cwd(),
		'src',
		'infrastructure',
		'routing',
		'AppRoutesConfig.tsx'
	);

	try {
		let content = fs.readFileSync(appRoutesFile, 'utf8');

		// Add import statement
		const importStatement = `import { ${componentName}Container } from '../../components/containers/${componentName}Container';`;
		if (!content.includes(importStatement)) {
			const lastImportIndex = content.lastIndexOf('import');
			const endOfImports = content.indexOf(';', lastImportIndex) + 1;
			content =
				content.slice(0, endOfImports) +
				'\n' +
				importStatement +
				content.slice(endOfImports);
		}

		// Add route configuration
		const routeConfig = `        <Route path={routingPaths.${componentName.toLowerCase()}} element={<${componentName}Container />} />`;
		if (!content.includes(routeConfig)) {
			const lastRouteIndex = content.lastIndexOf('</Route>');
			content =
				content.slice(0, lastRouteIndex) +
				routeConfig +
				'\n' +
				content.slice(lastRouteIndex);
		}

		fs.writeFileSync(appRoutesFile, content);
		console.log(
			chalk.green(`Updated AppRoutesConfig.tsx with ${componentName} route`)
		);
	} catch (error) {
		console.error(
			chalk.red(
				`Failed to update app routes config: ${error.message} at ${getErrorLine(
					error
				)}`
			)
		);
		process.exit(1);
	}
};

// Main function
const main = () => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	console.log(chalk.blue('MFE Add New Sub-Component Generator'));

	rl.question(
		chalk.green('Enter the name of the new sub-component (PascalCase): '),
		(componentName) => {
			if (!componentName) {
				console.error(chalk.red('Component name is required'));
				rl.close();
				process.exit(1);
			}

			// Validate component name format (PascalCase)
			if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
				console.error(chalk.red('Component name must be in PascalCase format'));
				rl.close();
				process.exit(1);
			}

			try {
				const packageJson = require(path.join(process.cwd(), 'package.json'));
				const mfeName = packageJson.name.replace('mfe-', '');

				// Create API
				createApiTemplate(componentName, mfeName);

				// Create Interface
				createInterfaceTemplate(componentName);

				// Create Component
				createComponentTemplate(componentName);

				// Create Container
				createContainerTemplate(componentName);

				// Update Routing
				updateRoutingPaths(componentName);
				updateAppRoutesConfig(componentName);

				console.log(
					chalk.blue('\nSub-component creation completed successfully!')
				);
				console.log(
					chalk.green(`Created the following files for ${componentName}:`)
				);
				console.log(chalk.cyan(`- src/api/${componentName}.ts`));
				console.log(chalk.cyan(`- src/interfaces/${componentName}.ts`));
				console.log(chalk.cyan(`- src/components/main/${componentName}.tsx`));
				console.log(
					chalk.cyan(
						`- src/components/containers/${componentName}Container.tsx`
					)
				);
				console.log(chalk.cyan('Updated routing configuration files'));
			} catch (error) {
				console.error(
					chalk.red(
						`Failed to create sub-component: ${error.message} at ${getErrorLine(
							error
						)}`
					)
				);
				rl.close();
				process.exit(1);
			}

			rl.close();
		}
	);
};

main();
