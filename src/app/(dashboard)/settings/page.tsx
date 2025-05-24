'use client';

import React, { useState, useEffect } from 'react';
import { FiUser, FiBell, FiLock, FiCreditCard, FiGlobe, FiShield, FiHelpCircle, FiSave } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { authService } from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      website: '',
      bio: '',
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      theme: 'light',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      newPromotions: true,
      earningsUpdates: true,
      systemUpdates: true,
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30,
    },
    payment: {
      defaultPaymentMethod: '',
      autoWithdraw: false,
      minimumWithdrawAmount: 100,
      taxInformation: {
        taxId: '',
        taxCountry: '',
      },
    },
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData);
        // Initialize settings with user data
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            company: userData.company || '',
            website: userData.website || '',
            bio: userData.bio || '',
          },
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here you would typically make an API call to save the settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <FiSave className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <FiUser className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <FiGlobe className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <FiBell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <FiShield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="payment">
            <FiCreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and how others see you on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={settings.profile.firstName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, firstName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={settings.profile.lastName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, lastName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, phone: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={settings.profile.company}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, company: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={settings.profile.website}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, website: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={settings.profile.bio}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, bio: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Settings */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your platform experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, timezone: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="CST">Central Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.preferences.dateFormat}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, dateFormat: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.preferences.currency}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, theme: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailNotifications: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushNotifications: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Receive marketing and promotional emails</p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, marketingEmails: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Promotions</Label>
                    <p className="text-sm text-gray-500">Get notified about new promotions</p>
                  </div>
                  <Switch
                    checked={settings.notifications.newPromotions}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, newPromotions: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Earnings Updates</Label>
                    <p className="text-sm text-gray-500">Get notified about your earnings</p>
                  </div>
                  <Switch
                    checked={settings.notifications.earningsUpdates}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, earningsUpdates: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-gray-500">Receive notifications about system updates</p>
                  </div>
                  <Switch
                    checked={settings.notifications.systemUpdates}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, systemUpdates: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, twoFactorAuth: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                  </div>
                  <Switch
                    checked={settings.security.loginNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, loginNotifications: checked }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Select
                    value={settings.security.sessionTimeout.toString()}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(value) }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Manage your payment methods and withdrawal preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
                  <Select
                    value={settings.payment.defaultPaymentMethod}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      payment: { ...prev.payment, defaultPaymentMethod: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Withdrawals</Label>
                    <p className="text-sm text-gray-500">Automatically withdraw earnings when they reach the minimum amount</p>
                  </div>
                  <Switch
                    checked={settings.payment.autoWithdraw}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      payment: { ...prev.payment, autoWithdraw: checked }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumWithdrawAmount">Minimum Withdrawal Amount</Label>
                  <Input
                    id="minimumWithdrawAmount"
                    type="number"
                    value={settings.payment.minimumWithdrawAmount}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      payment: { ...prev.payment, minimumWithdrawAmount: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={settings.payment.taxInformation.taxId}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      payment: {
                        ...prev.payment,
                        taxInformation: { ...prev.payment.taxInformation, taxId: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxCountry">Tax Country</Label>
                  <Select
                    value={settings.payment.taxInformation.taxCountry}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      payment: {
                        ...prev.payment,
                        taxInformation: { ...prev.payment.taxInformation, taxCountry: value }
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 