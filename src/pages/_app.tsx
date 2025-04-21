import type { AppProps } from 'next/app'
import Head from 'next/head'
import Layout from '~/components/layout'

import { createNetworkConfig, IotaClientProvider, WalletProvider } from '@iota/dapp-kit'
import { getFullnodeUrl } from '@iota/iota-sdk/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@iota/dapp-kit/dist/index.css'
import '@fontsource-variable/inter'
import '~/styles/globals.css'

const queryClient = new QueryClient()

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
})

function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <Head>
            <title>REBASED PIXELS</title>
            <meta
              name="description"
              content="A collaborative artwork by the IOTA community"
            />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  )
}

export default App
