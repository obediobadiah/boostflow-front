import Link from 'next/link';
import Image from 'next/image';
import { RegisterForm } from '../../../components/auth/RegisterForm';
import { SocialAuthButtons } from '../../../components/SocialAuthButtons';

export default function Register() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-20 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Get started with BoostFlow and take your marketing to the next level.
          </p>
        </div>

        <div className="mt-10">
          <RegisterForm />

          <div className="mt-8">
            <SocialAuthButtons />
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold leading-6 text-orange-600 hover:text-orange-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}