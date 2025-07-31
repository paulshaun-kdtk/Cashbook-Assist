"use client";

import React, { useState } from 'react';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import toast from 'react-hot-toast';

interface DeleteAccountProps {
  className?: string;
  onAccountDeleted?: () => void;
}

const DeleteAccountComponent: React.FC<DeleteAccountProps> = ({
  className = "",
  onAccountDeleted,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  
  const {
    deleteAccount,
    previewAccountDeletion,
    isLoading,
    isPreviewLoading,
    previewData,
  } = useDeleteAccount();

  const handlePreview = async () => {
    // Check if unique_id exists in localStorage
    const unique_id = localStorage.getItem('unique_id');
    
    if (!unique_id) {
      toast.error('No unique_id found in localStorage. Please ensure you are logged in.');
      return;
    }
    
    // Don't pass userEmail and userId, let the hook use unique_id from localStorage
    const preview = await previewAccountDeletion();
    if (preview) {
      setShowPreview(true);
    }
  };

  const handleDeleteConfirmation = async () => {
    if (confirmationText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    // Don't pass userEmail and userId, let the hook use unique_id from localStorage
    const result = await deleteAccount();
    if (result) {
      setShowConfirmation(false);
      setShowPreview(false);
      setConfirmationText("");
      onAccountDeleted?.();
    }
  };

  const resetState = () => {
    setShowConfirmation(false);
    setShowPreview(false);
    setConfirmationText("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800/30 dark:bg-red-900/10 lg:p-6">
        <h3 className="mb-3 text-lg font-semibold text-red-800 dark:text-red-400">
          Danger Zone
        </h3>
        <p className="mb-4 text-sm text-red-700 dark:text-red-300">
          Once you delete your account, there is no going back. This action will permanently delete:
        </p>
        <ul className="mb-4 list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
          <li>Your user profile and settings</li>
          <li>All your income and expense records</li>
          <li>Your subscription data</li>
          <li>Your cashbook assist authentication account</li>
        </ul>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePreview}
            disabled={isPreviewLoading || isLoading}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
          >
            {isPreviewLoading ? 'Loading...' : 'Preview What Will Be Deleted'}
          </button>
          
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={isLoading || isPreviewLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-800"
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Preview: Data to be Deleted
            </h3>
            
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Total: {previewData.totalDocuments} documents</strong> will be permanently deleted across {previewData.preview.length} collections.
              </p>
            </div>

            <div className="space-y-3">
              {previewData.preview.map((collection, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-white capitalize">
                      {collection.collection.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {collection.documentCount} documents
                    </span>
                  </div>
                  {collection.error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Error: {collection.error}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setShowConfirmation(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Proceed to Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-400">
              Confirm Account Deletion
            </h3>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              This action <strong>cannot be undone</strong>. This will permanently delete your account and all associated data.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">DELETE</code> to confirm:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                placeholder="Type DELETE here"
                autoComplete="off"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={resetState}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmation}
                disabled={isLoading || confirmationText !== "DELETE"}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-800"
              >
                {isLoading ? 'Deleting...' : 'Delete Account Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccountComponent;
