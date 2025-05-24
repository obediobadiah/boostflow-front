'use client';

import React, { useState } from 'react';
import { FiHelpCircle, FiMail, FiMessageSquare, FiBook, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create my first promotion?',
          answer: 'To create your first promotion, navigate to the Promotions page and click the "Create Promotion" button. Follow the step-by-step guide to set up your promotion details, including product selection, commission rates, and tracking settings.'
        },
        {
          question: 'How do I track my earnings?',
          answer: 'You can track your earnings in real-time through the Earnings dashboard. The dashboard shows your total earnings, pending payments, and detailed breakdown of earnings by promotion.'
        },
        {
          question: 'What payment methods are supported?',
          answer: 'We currently support bank transfers, PayPal, and Stripe for withdrawals. You can set up your preferred payment method in the Payment Settings section.'
        }
      ]
    },
    {
      category: 'Account & Security',
      questions: [
        {
          question: 'How do I enable two-factor authentication?',
          answer: 'Go to Settings > Security and toggle on the Two-Factor Authentication option. Follow the setup process to link your authenticator app.'
        },
        {
          question: 'How can I reset my password?',
          answer: 'Click on the "Forgot Password" link on the login page. Enter your email address and follow the instructions sent to your email to reset your password.'
        },
        {
          question: 'How do I update my account information?',
          answer: 'Navigate to Settings > Profile to update your personal information, including name, email, phone number, and company details.'
        }
      ]
    },
    {
      category: 'Promotions & Marketing',
      questions: [
        {
          question: 'How do I optimize my promotions?',
          answer: 'Use our analytics dashboard to track performance metrics. Consider A/B testing different promotional strategies and optimize based on conversion rates and engagement metrics.'
        },
        {
          question: 'Can I schedule promotions?',
          answer: 'Yes, you can schedule promotions in advance. When creating a promotion, use the scheduling feature to set the start and end dates.'
        },
        {
          question: 'How do I track promotion performance?',
          answer: 'Each promotion has its own analytics dashboard showing clicks, conversions, and earnings. Access this through the promotion details page.'
        }
      ]
    },
    {
      category: 'Payments & Withdrawals',
      questions: [
        {
          question: 'What are the minimum withdrawal amounts?',
          answer: 'The minimum withdrawal amount varies by payment method. Bank transfers require a minimum of $100, while PayPal and Stripe have a minimum of $50.'
        },
        {
          question: 'How long do withdrawals take?',
          answer: 'Processing times vary by payment method. Bank transfers typically take 3-5 business days, while PayPal and Stripe are usually instant or within 24 hours.'
        },
        {
          question: 'How are taxes handled?',
          answer: 'You are responsible for reporting your earnings and paying applicable taxes. We provide tax documents and reports to assist with your tax filing.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiHelpCircle className="h-5 w-5" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="#faq">Frequently Asked Questions</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="#contact">Contact Support</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="#documentation">Documentation</a>
            </Button>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiMessageSquare className="h-5 w-5" />
              Contact Support
            </CardTitle>
            <CardDescription>Get help from our support team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Email us at:</p>
              <a href="mailto:support@boostflow.com" className="text-orange-600 hover:underline">
                support@boostflow.com
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Response time:</p>
              <p className="text-sm">Within 24 hours</p>
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              Open Support Ticket
            </Button>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiBook className="h-5 w-5" />
              Documentation
            </CardTitle>
            <CardDescription>Learn more about our platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/docs/getting-started">Getting Started Guide</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/docs/api">API Documentation</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/docs/best-practices">Best Practices</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <div className="relative w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.map((category, index) => (
            <AccordionItem key={index} value={`category-${index}`}>
              <AccordionTrigger className="text-lg font-semibold">
                {category.category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="space-y-2">
                      <h4 className="font-medium text-gray-900">{faq.question}</h4>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Contact Form */}
      <div id="contact" className="space-y-6">
        <h2 className="text-2xl font-semibold">Contact Support</h2>
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>We'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" placeholder="Your email" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input id="subject" placeholder="What's this about?" />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <textarea
                  id="message"
                  className="w-full min-h-[150px] p-2 border rounded-md"
                  placeholder="Describe your issue or question..."
                />
              </div>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 