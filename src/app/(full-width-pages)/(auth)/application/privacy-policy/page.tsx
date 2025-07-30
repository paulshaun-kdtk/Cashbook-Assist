import React from 'react';
import { Metadata } from "next";
import Link from 'next/link';
import { ChevronLeftIcon } from '@/icons';

export const metadata: Metadata = {
  title: "Book Assist Privacy Policy",
  description: "Book Assist Privacy Policy",
  keywords: ["Book Assist", "Privacy Policy", "Data Protection", "User Privacy"],
};


export default function PrivacyPolicy() {
  return (
<div className="max-w-3xl mx-auto p-6 space-y-6 overflow-auto">
   <div className="w-full max-w-md sm:pt-10 mb-5">
        <Link
          href="/application/terms-of-use"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to terms
        </Link>
      </div>

      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <section>
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>
          Welcome to Book Assist. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile application or any of our other interfaces (the {` "System" `}). By using the System, you agree to the collection and use of information in accordance with this policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">2. Information We Collect</h2>
        <p>When using Book Assist, we may collect the following types of information:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your email address (required)</li>
          <li>Your full legal name (required)</li>
          <li>Your phone number (optional)</li>
          <li>Business-related records you create within the System, including:</li>
          <ul className="list-disc pl-10">
            <li>Sale records</li>
            <li>Income records</li>
            <li>Expense records</li>
            <li>Employee records (optional)</li>
            <li>Stock records</li>
            <li>Debtor records</li>
            <li>Purchase entry records</li>
          </ul>
          <li>Subscription status and purchase history</li>
          <li>Anonymous device and usage information for System improvement</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
        <p>We use collected information to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide and maintain System features</li>
          <li>Manage your subscriptions and billing (which are handled by third party systems)</li>
          <li>Generate your business reports, invoices, and financial insights</li>
          <li>Respond to customer support requests</li>
          <li>Improve the System’s functionality and user experience</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">4. Data Retention and Account Deletion</h2>
        <p>
          If you request to delete your Book Assist account, your data will be retained for 90 days before permanent deletion. This grace period allows you to recover your account and data if you change your mind. After 90 days, all personal and business records associated with your account will be permanently deleted from our systems.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">5. Third-Party Services</h2>
        <p>
          We work with trusted third-party services to operate Book Assist:
        </p>
        <ul className="list-disc pl-6 space-y-1">
        <li><strong>Google Play Billing</strong> — processes purchases through the Google Play Store</li>
        <li><strong>Apple In-app Purchases</strong> — processes purchases through the Apple App Store</li>
        <li><strong>RevenueCat</strong> — manages subscriptions and billing</li>
        </ul>
        <p>
          These services may collect and process information as governed by their own privacy policies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">6. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your data from unauthorized access, disclosure, or loss. However, no digital system is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">7. Your Rights</h2>
        <p>
          You have the right to access, correct, or request the deletion of your personal data. To exercise these rights, please contact us at <a href='mailto:support@bookassist.com?subject=Query about the book assist privacy policy'>support@bookassist.com</a>. We will respond to all requests in accordance with our applicable privacy laws.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If material changes are made, we will notify you within the System or via email. Continued use of Book Assist after updates constitutes acceptance of the revised policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">9. Contact Us</h2>
        <p>
          For questions about this Privacy Policy, reach out to us at: <a href='mailto:support@bookassist.com?subject=Query about the book assist privacy policy'><strong>support@bookassist.com</strong></a>.
        </p>
      </section>
    </div>
  );
}
