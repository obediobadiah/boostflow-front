'use client';

import { useState, FormEvent, useEffect } from 'react';
import { register, clearError } from '@/redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('business');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If registration was successful, show toast and redirect to login
    if (registrationSuccess) {
      toast.success('Registration successful! Please check your email for confirmation.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  }, [registrationSuccess, router]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    dispatch(clearError());
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const resultAction = await dispatch(register({ name, email, password, role }));
      
      if (register.fulfilled.match(resultAction)) {
        setRegistrationSuccess(true);
      } else if (register.rejected.match(resultAction) && resultAction.payload) {
        toast.error(resultAction.payload as string);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="mt-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-3 sm:text-sm text-gray-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {formErrors.name && (
            <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>
        
        <div className="mt-4">
          <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-3 sm:text-sm text-gray-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {formErrors.email && (
            <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>
        
        <div className="mt-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-3 sm:text-sm text-gray-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {formErrors.password && (
            <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
          )}
        </div>
        
        <div className="mt-4">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-3 sm:text-sm text-gray-600"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {formErrors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
          )}
        </div>
        
        <div className="mt-6">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            I want to
          </label>
          <select
            id="role"
            name="role"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-3 sm:text-sm text-gray-600"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="business">Sell Products (Business)</option>
            <option value="promoter">Promote Products (Promoter)</option>
          </select>
        </div>
      </div>

      {error && (
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  );
} 