import './App.css';
import { useEffect, useState } from 'react';

const App = () => {
	const [count, setCount] = useState(0);
	useEfect(() => {
		setCount(count + 1);
		console.log('App mounted');
		return () => {
			console.log('App unmounted');
		};
	}, []);
	return (
		<>
			<h1>Hello</h1>
		</>
	);
};

export default App;
