import { ChevronLeftIcon } from '@/icons';
import Link from 'next/link';
import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 overflow-auto">
      <div className="w-full max-w-md sm:pt-10 mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to signin
        </Link>
      </div>

      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <section>
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>
          Welcome to our system. By using our system (the {` "Book Assist Suite (Mobile application, Web application, Windows application or others)" `}), you agree to be bound by these Terms of Service ({`"Terms"`}). If you do not agree to these Terms, please do not use the system.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">2. Subscriptions and Billing</h2>
        <p>
          System access is granted via paid subscriptions. Subscriptions are billed through your Google Play account or Apple pay account and managed via the respected platforms. Prices and subscription durations are displayed within the mobile system interfaces and may be subject to change.
        </p>
        <p>
          Subscriptions will automatically renew unless cancelled at least 24 hours before the end of the current billing period. You can manage or cancel your subscriptions in your Google Play  or Apple store account settings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">3. Refund Policy</h2>
        <p>
        All purchases made through Google Play or Apple are subject to their respective refund policies. We do not process refunds directly. For refund inquiries, please contact Google Play or Apple support.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">4. User Data & Privacy</h2>
        <p>
          We value your privacy. Please refer to our <a href="/application/privacy-policy" className="text-blue-600 underline">Privacy Policy</a> for information about how we collect, use, and protect your personal information.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">5. Use of the system</h2>
        <p>
          You agree to use the system in compliance with applicable laws and not to misuse, modify, or interfere with the {` "system's" `} functionality. Unauthorized use of the sytem may result in termination of your access. Or even legal action against you.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">6. Changes to These Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. If we make material changes, we will notify users within the system or via our website. Continued use of the system constitutes your acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">7. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at: <a href="mailto:support@bookassist.com?subject=I would like to inquire more about your terms of system usage"><strong>support@bookassist.com</strong></a>.
        </p>
      </section>
    </div>
  );
}
