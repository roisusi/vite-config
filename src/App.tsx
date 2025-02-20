import './App.css';
import { CSSProperties } from 'react';

const App = () => {
	let a;
	type myType = number;

	type roi = { x: number };

	const ab = (hello: string): string => {
		console.log(hello);
		return 'Hello World';
	};

	const ahhh: roi = 'd';

	if (a === undefined) {
		console.log('s');
	}

	const appf: CSSProperties = {
		// eslint-disable-next-line no-restricted-syntax
		margin: '10px',
	};
	// bali TODO hello
	return (
		<>
			<p style={appf}></p>
			{a}
			{ahhh}
			{ab('Hello World')}
		</>
	);
};

export default App;
