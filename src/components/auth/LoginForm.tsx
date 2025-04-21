'use client';

import { useState, FormEvent, useEffect } from 'react';
import { login, clearError } from '@/redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiAlertCircle } from 'react-icons/fi';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [accountDeactivated, setAccountDeactivated] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Login successful! Redirecting to dashboard...');
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setAccountDeactivated(false);
    dispatch(clearError());
    
    try {
      const resultAction = await dispatch(login({ email, password }));
      
      if (login.rejected.match(resultAction) && resultAction.payload) {
        const errorMessage = resultAction.payload as string;
        
        if (errorMessage.includes('account has been deactivated')) {
          setAccountDeactivated(true);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="mt-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-3 sm:text-sm text-gray-600"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="mt-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-3 sm:text-sm text-gray-600"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mt-6 py-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>

      {accountDeactivated && (
        <div className="rounded-md bg-amber-50 border border-amber-300 p-4 my-6">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-amber-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Account Deactivated</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>Your account has been deactivated. Please contact support for assistance.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !accountDeactivated && (
        <div className="rounded-md bg-red-50 p-4 my-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full justify-center rounded-md bg-orange-600 py-3 px-4 text-sm font-semibold text-white hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:bg-orange-400"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
} 