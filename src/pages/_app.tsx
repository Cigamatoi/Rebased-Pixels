import { DappProvider } from '@iota/dapp-kit'
import { getFullnodeUrl } from '@iota/iota-sdk/client'
import type { AppProps } from 'next/app'
import Head from 'next/head'

import '~/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DappProvider>
      <Head>
        <title>REBASED PIXELS</title>
        <meta name="description" content="Draw pixels on IOTA Rebased Testnet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </DappProvider>
  )
} 