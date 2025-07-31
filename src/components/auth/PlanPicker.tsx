"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import { CheckCircleIcon } from '@/icons';

interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  recommended?: boolean;
  savings?: string;
}

const plans: PlanOption[] = [
  {
    id: 'monthly',
    name: 'Cashbook Assist Monthly',
    price: '$3.99',
    period: '/month',
    description: 'Perfect for individuals and small businesses.',
    features: [
      'Unlimited Transactions',
      'Advanced Reports',
      'Multi-Currency Support',
      'Email Support'
    ]
  },
  {
    id: 'annual',
    name: 'Cashbook Assist Annual',
    price: '$39.99',
    period: '/year',
    description: 'Perfect for individuals and small businesses.',
    features: [
      'Unlimited Transactions',
      'Advanced Reports',
      'Multi-Currency Support',
      'Priority Email Support'
    ],
    recommended: true,
    savings: 'Save $6/year'
  }
];

interface PlanPickerProps {
  onPlanSelected: (plan: string) => void;
}

const PlanPicker: React.FC<PlanPickerProps> = ({ onPlanSelected }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (!selectedPlan) return;

    // Create new URL params while preserving sys=cashbook
    const params = new URLSearchParams(searchParams.toString());
    params.set('plan', selectedPlan);
    params.set('sys', 'cashbook');

    // Update URL and notify parent
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);
    onPlanSelected(selectedPlan);
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="mb-4 font-semibold text-gray-800 text-title-md dark:text-white/90 sm:text-title-lg">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Select the perfect plan for your cashbook management needs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-6 cursor-pointer transition-all duration-200 ${
              selectedPlan === plan.id
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${
              plan.recommended
                ? 'ring-2 ring-brand-500 ring-opacity-20'
                : ''
            }`}
            onClick={() => handlePlanSelection(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recommended
                </span>
              </div>
            )}
            
            {plan.savings && (
              <div className="absolute top-4 right-4">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-lg dark:bg-green-900/20 dark:text-green-400">
                  {plan.savings}
                </span>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {plan.description}
              </p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
                  {plan.period}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === plan.id
                    ? 'border-brand-500 bg-brand-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {selectedPlan === plan.id && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="px-8 py-3 text-lg font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with {selectedPlan ? plans.find(p => p.id === selectedPlan)?.name : 'Selected Plan'}
        </Button>
        
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          You can change your plan anytime after signup
        </p>
      </div>
    </div>
  );
};

export default PlanPicker;
