"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '@rainbow-me/rainbowkit/styles.css';
import { ethers } from 'ethers';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

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
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
              <h1 className="text-2xl font-bold mb-4">Link Details</h1>
              <div className="mb-4">
                <label className="block text-gray-700">Wallet Address:</label>
                <div className="text-gray-900">{linkData.walletAddress}</div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Amount:</label>
                <div className="text-gray-900">{linkData.amount}</div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Chain Details:</label>
                <div className="text-gray-900">{linkData.chainDetails}</div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Unique ID:</label>
                <div className="text-gray-900">{linkData.uniqueId}</div>
              </div>
              <div>
                <ConnectButton />
              </div>
              <div className="mt-4">
                <button
                  onClick={handleTransfer}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
