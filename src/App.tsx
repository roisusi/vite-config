import './App.css';
import { useEffect, useState } from 'react';
import { IconPlusCircle } from './POC/IconPlusCircle.tsx';

const App = () => {
	const [count, setCount] = useState(0);
	useEffect(() => {
		setCount(count + 1);
		console.log('App mounted');
		return () => {
			console.log('App unmounted');
		};
	}, []);
	return (
		<>
			<h1>Hello</h1>
			<IconPlusCircle variant={'small'} />
			<IconPlusCircle variant={'large'} />
		</>
	);
};

export default App;
