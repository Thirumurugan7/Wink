"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '@rainbow-me/rainbowkit/styles.css';
import {ethers} from 'ethers'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, useSendTransaction } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  baseSepolia
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { switchChain } from 'viem/actions';

export default function UniqueIdPage() {
  const searchParams = useSearchParams()

  const search = searchParams.get('search')
  const [linkData, setLinkData] = useState(null);
  const [error, setError] = useState(null);
  // const { 
  //   data,
    
  //   isPending, 
  //   sendTransaction 
  // } = useSendTransaction() 
  const handleTransfer = async () => {
    // sendTransaction({ to:linkData.walletAddress, value: ethers.utils.parseEther(linkData.amount.toString()) }) 

    const provider = window.ethereum != null ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
    console.log("provider",provider)
    
        //signer
    
        const signer = provider.getSigner();
    
    console.log("signer",signer)
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
            switchChain(baseSepolia.id)

            return response.json();
          } else {
            throw new Error('Link not found');
          }
        })
        .then((data) => setLinkData(data))
        .catch((err) => setError(err.message));
    }
  }, [search]);

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
