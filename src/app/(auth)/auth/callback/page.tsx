import { Metadata } from 'next';
import AuthCallback from './socialMediaCallBack';

export const metadata: Metadata = {
  title: 'Authentication Callback | BoostFlow',
  description: 'Processing your authentication',
};

export default function CallbackPage() {
  return <AuthCallback />;
} 