import { FC } from 'react';
import {
    MuiTheme,
    UmtbThemeProvider,
    businessTheme,
} from '@umtb/shared-ui-cmp';
import { MfePropsBase, HostShellData } from '@umtb/shared-ui-utils';
import { HostShellProvider } from '@umtb/shared-ui-utils/Context/HostShellProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterBuild } from '@mfe-osh/infrastructure/wrappers/RouterBuild';

interface MfePropsBaseWithTheme extends MfePropsBase {
    theme?: MuiTheme;
    hostShellData: HostShellData;
}

const Mfe{<MFE NAME>}: FC<MfePropsBaseWithTheme> = ({
    theme = privateTheme,
    queryClient,
    hostShellData,
}) => {
    return (
        <HostShellProvider>
            <UmtbThemeProvider themeName={theme}>
                <QueryClientProvider client={queryClient}>
                    <ReactQueryDevtools />
                    <RouterBuild hostShellData={hostShellData} />
                </QueryClientProvider>
            </UmtbThemeProvider>
        </HostShellProvider>
    );
};

export default Mfe{<MFE NAME>};