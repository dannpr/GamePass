'use client'

import React, { ReactNode } from 'react';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { arbitrum, mainnet } from 'viem/chains'

const projectId = '351b93c70ced8f78254082c82fdda2fa'

const metadata = {
  name: 'Vinca',
  description: 'Vinca Lending Protocol',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  enableAnalytics: true,
  themeVariables: {
    '--w3m-color-mix': '#7C3AED',
    '--w3m-color-mix-strength': 40,
  }
})

export function Web3Modal({ children } : { children: ReactNode }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
}