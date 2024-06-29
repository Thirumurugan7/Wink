"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function UniqueIdPage() {
  const search = searchParams.get('search')
  const [linkData, setLinkData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (uniqueId) {
      fetch(`http://localhost:3001/get-link/${search}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Link not found');
          }
        })
        .then((data) => setLinkData(data))
        .catch((err) => setError(err.message));
    }
  }, [uniqueId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!linkData) {
    return <div>Loading...</div>;
  }

  return (
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
      </div>
    </div>
  );
}
