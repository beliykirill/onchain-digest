import { useState } from 'react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from 'shared/lib/api';
import { GlobalStyle } from 'shared/ui/global-style';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

const App = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) =>
              failureCount < 1 && (!(error instanceof ApiError) || error.isRetryable),
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>since yesterday — your 24-hour wallet digest</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta
          name="description"
          content="What changed in a crypto wallet over the last 24 hours, and why. Built on the Zerion API."
        />
      </Head>
      <GlobalStyle />
      <div className={inter.variable}>
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
};

export default App;
