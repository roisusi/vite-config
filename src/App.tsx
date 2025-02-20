import './App.css';

const App = () => {
	let a;

	const ab = (hello: string): string => {
		console.log(hello);
		return 'Hello World';
	};
	const ahhh = 'd';

	if (a === undefined) {
		console.log('s');
	}
	const appf = {};

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
