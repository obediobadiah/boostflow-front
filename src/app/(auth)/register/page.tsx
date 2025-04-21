import Link from 'next/link';
import Image from 'next/image';
import { RegisterForm } from '../../../components/auth/RegisterForm';
import { SocialAuthButtons } from '../../../components/SocialAuthButtons';

export default function Register() {
  return (
    <div className="flex min-h-screen">
      {/* Left column - Image */}
      <div className="hidden w-0 flex-1 bg-gradient-to-r from-orange-500 to-orange-700 lg:flex lg:w-1/2">
        <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center px-8 py-20">
          <Image
            src="/images/marketing-illustration.svg"
            alt="Marketing illustration"
            width={400}
            height={400}
            className="mb-8"
            priority
          />
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-white">
            Join our growing community
          </h2>
          <p className="text-center text-lg text-white/90">
            Create an account to start managing your promotions and connecting with influencers.
          </p>
        </div>
      </div>

      {/* Right column - Form */}
      <div className="flex flex-1 flex-col justify-center bg-white py-20 sm:px-6 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <Link href="/" className="flex items-center mb-5">
              <img src="/logo/Boost_Flow_App.png" alt="BoostFlow Logo" className="h-24 w-auto" />
            </Link>
          </div>
          <div className="text-center lg:text-left">
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
              {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div> */}

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
    </div>
  );
}