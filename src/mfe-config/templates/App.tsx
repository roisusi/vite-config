import { FC, useEffect } from 'react';
import { GlobalFonts } from '@umtb/shared-ui-cmp';
import {
    ErrorDetailsType,
    extractErrorMessage,
    isErrorDetailsType,
} from '@umtb/shared-ui-utils';
import { QueryClient } from '@tanstack/react-query';
import packageJson from '../package.json';
import Mfe{<MFE NAME>} from './components/Mfe{<MFE NAME>}';
import { MockHostData } from './data/MockHostData';

import './App.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { 
            retry: 2, 
            refetchOnWindowFocus: false, 
            retryOnMount: false 
        },
        mutations: {
            onError: (error) => {
                if (isErrorDetailsType(error)) {
                    return extractErrorMessage(error as unknown as ErrorDetailsType);
                }
                return 'Internal server error';
            },
        },
    },
});

const App: FC = () => {
    const { version, name } = packageJson;

    useEffect(() => {
        sessionStorage.setItem('jwt', localStorage.getItem('jwt') ?? '');
    }, []);

    return (
        <>
            <GlobalFonts />
            <Mfe{<MFE NAME>} 
                queryClient={queryClient} 
                hostShellData={MockHostData} 
            />
            <div>
                Name: {name}
                Version: {version}
            </div>
        </>
    );
};

export default App;