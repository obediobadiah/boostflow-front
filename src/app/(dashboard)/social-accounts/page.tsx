'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Define the types
interface SocialMediaAccount {
  id: number;
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'linkedin' | 'pinterest';
  username: string;
  isConnected: boolean;
  connectionDate: string;
  followerCount?: number;
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // This would be your API call
      const response = await fetch('/api/social-accounts');
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Failed to fetch social accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (platform: string) => {
    // In a real application, this would redirect to the OAuth flow for the specific platform
    alert(`Redirecting to ${platform} authentication...`);
    
    // Mock successful connection for demo purposes
    setTimeout(() => {
      const newAccount: SocialMediaAccount = {
        id: Date.now(),
        platform: platform as any,
        username: `user_${Math.floor(Math.random() * 1000)}`,
        isConnected: true,
        connectionDate: new Date().toISOString(),
        followerCount: Math.floor(Math.random() * 1000)
      };
      
      setAccounts(prev => [...prev, newAccount]);
    }, 1000);
  };

  const disconnectAccount = async (id: number) => {
    try {
      // This would be your API call
      // await fetch(`/api/social-accounts/${id}`, { method: 'DELETE' });
      
      // Update the local state
      setAccounts(prev => prev.filter(account => account.id !== id));
    } catch (error) {
      console.error('Failed to disconnect account:', error);
    }
  };

  const platformIcons: Record<string, string> = {
    facebook: 'facebook',
    instagram: 'instagram',
    twitter: 'twitter',
    tiktok: 'tiktok',
    youtube: 'youtube',
    linkedin: 'linkedin',
    pinterest: 'pinterest'
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Social Media Accounts</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Connect Your Accounts</h2>
        <p className="text-gray-600 mb-4">
          Connect your social media accounts to automatically post your promotions.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          {['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin', 'pinterest'].map(platform => (
            <Button
              key={platform}
              variant="outline"
              className="py-6 flex flex-col items-center justify-center gap-2"
              onClick={() => connectAccount(platform)}
              disabled={accounts.some(a => a.platform === platform)}
            >
              <span className="capitalize">{platform}</span>
              <span className="text-xs text-gray-500">
                {accounts.some(a => a.platform === platform) ? 'Connected' : 'Connect'}
              </span>
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Connected Accounts</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-gray-500">You haven't connected any social media accounts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connected Since
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Followers
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map(account => (
                  <tr key={account.id}>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="capitalize font-medium text-gray-900">{account.platform}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {account.username}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(account.connectionDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {account.followerCount || 'N/A'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => disconnectAccount(account.id)}
                      >
                        Disconnect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 