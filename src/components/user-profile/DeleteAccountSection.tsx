"use client";

import React from 'react';
import DeleteAccountComponent from '@/components/user-profile/DeleteAccountComponent';

interface DeleteAccountSectionProps {
  userEmail?: string;
  userId?: string;
}

const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({
  userEmail,
  userId,
}) => {
  const handleAccountDeleted = () => {
    window.location.href = '/signin';
  };

  return (
    <div className="mt-8">
      <DeleteAccountComponent
        userEmail={userEmail}
        userId={userId}
        onAccountDeleted={handleAccountDeleted}
      />
    </div>
  );
};

export default DeleteAccountSection;
