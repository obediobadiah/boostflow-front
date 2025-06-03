import React from 'react';
import Link from 'next/link';
import { LoginForm } from '../../../components/auth/LoginForm';
import { SocialAuthButtons } from '../../../components/SocialAuthButtons';

export default function Login() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-20 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Sign in to your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        <div className="mt-10">
          <LoginForm />

          <div className="mt-8">
            <SocialAuthButtons />
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-semibold leading-6 text-orange-600 hover:text-orange-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 