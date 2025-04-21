import { AppProps } from 'next/app';
import { WalletProvider, createNetworkConfig, IotaClientProvider } from '@iota/dapp-kit';
import { getFullnodeUrl } from '@iota/iota-sdk/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@iota/dapp-kit/dist/index.css';
import '../styles/globals.css';

const queryClient = new QueryClient();

// Konfiguriere die Netzwerke, zu denen du dich verbinden möchtest
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <Component {...pageProps} />
          <ToastContainer position="bottom-right" />
        </WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  );
}

export default MyApp; 