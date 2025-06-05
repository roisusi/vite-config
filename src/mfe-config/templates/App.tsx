import { FC, useEffect } from 'react';
import { GlobalFonts } from '@umtb/shared-ui-cmp';
import {
    ErrorDetailsType,
    extractErrorMessage,
    HostShellData,
    isErrorDetailsType,
} from '@umtb/shared-ui-utils';
import { QueryClient } from '@tanstack/react-query';
import packageJson from '../package.json';
import Mfe{<MFE NAME>} from './components/Mfe{<MFE NAME>}';

import './App.css';

const MockHostData: HostShellData = {
    _401Message: {
        accountResourceId: '59755c14-d677-4288-9646-cf99e57e0506',
        accountName: '',
        accountId: '',
    },
    userId: '1234567890',
    customerId: '123456789',
    userIdNumber: '',
};

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