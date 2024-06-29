"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '@rainbow-me/rainbowkit/styles.css';
import { ethers } from 'ethers';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton as RainbowConnectButton,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { motion } from 'framer-motion';
import '@/app/globals.css'

const baseLlamaNodes = {
  id: 8453,
  name: 'Base LlamaNodes',
  network: 'base',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: 'https://base.llamarpc.com',
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
  testnet: false,
};

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [baseLlamaNodes],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const switchToBaseChain = async () => {
  const provider = window.ethereum;
  if (provider) {
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x2105', // Hexadecimal value of 8453
            chainName: 'Base LlamaNodes',
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://base.llamarpc.com'],
            blockExplorerUrls: ['https://basescan.org'],
          },
        ],
      });
    } catch (switchError) {
      console.error('Failed to switch to Base chain:', switchError);
    }
  } else {
    console.error('Ethereum provider not found');
  }
};

export default function UniqueIdPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const [linkData, setLinkData] = useState(null);
  const [error, setError] = useState(null);

  const handleTransfer = async () => {
    const provider = window.ethereum != null ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
    const signer = provider.getSigner();

    if (!signer) {
      console.error("Signer not available");
      return;
    }

    try {
      const tx = await signer.sendTransaction({
        to: linkData.walletAddress,
        value: ethers.utils.parseEther(linkData.amount.toString()),
      });
      await tx.wait();
      alert("Transaction successful!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed: " + error.message);
    }
  };

  useEffect(() => {
    if (search) {
      fetch(`http://localhost:3001/get-link/${search}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Link not found');
          }
        })
        .then((data) => {
          setLinkData(data);
        })
        .catch((err) => setError(err.message));
    }
  }, [search]);

  useEffect(() => {
    switchToBaseChain(); // Automatically switch to Base LlamaNodes chain on component mount
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!linkData) {
    return <div>Loading...</div>;
  }

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <motion.div 
          id='raysBackground'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500`}
          >
            <div className="bg-gray-400 p-8 rounded-lg w-full max-w-lg backdrop-filter backdrop-blur-lg shadow-2xl bg-opacity-20">
              <h1 className="text-3xl font-bold mb-6 text-center text-gray-200">Link Details</h1>
              <div className="space-y-4">
                <motion.div 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="p-4 bg-gray-100 rounded-md"
                >
                  <label className="block text-gray-600">Wallet Address:</label>
                  <div className="text-gray-900 font-mono">{linkData.walletAddress}</div>
                </motion.div>
                <motion.div 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="p-4 bg-gray-100 rounded-md"
                >
                  <label className="block text-gray-600">Amount:</label>
                  <div className="text-gray-900 font-mono">{linkData.amount}</div>
                </motion.div>
                <motion.div 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="p-4 bg-gray-100 rounded-md"
                >
                  <label className="block text-gray-600">Chain Details:</label>
                  <div className="text-gray-900 font-mono">{linkData.chainDetails}</div>
                </motion.div>
                <motion.div 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="p-4 bg-gray-100 rounded-md"
                >
                  <label className="block text-gray-600">Unique ID:</label>
                  <div className="text-gray-900 font-mono">{linkData.uniqueId}</div>
                </motion.div>
              </div>
              <div className="mt-6 flex justify-center">
                <RainbowConnectButton className="bg-gradient-to-r from-blue-400 to-purple-600 text-white px-6 py-2 rounded-md shadow-md hover:shadow-lg transform hover:scale-105 transition-transform">
                  Connect Wallet
                </RainbowConnectButton>
              </div>
              <div className="mt-4 text-center">
                <motion.button 
                  onClick={handleTransfer}
                  initial={{ scale: 0.9 }}
                  whileHover={{ scale: 1 }}
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:shadow-lg transform hover:scale-105 transition-transform"
                >
                  Transfer
                </motion.button>
              </div>
            </div>
          </motion.div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
