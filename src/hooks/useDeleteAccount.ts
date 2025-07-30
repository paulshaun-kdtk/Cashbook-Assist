import { useState } from 'react';
import toast from 'react-hot-toast';

interface DeleteAccountPreview {
  collection: string;
  documentCount: number;
  documents?: Array<{
    id: string;
    createdAt: string;
  }>;
  error?: string;
}

interface DeleteAccountResponse {
  success: boolean;
  message: string;
  results?: {
    totalDocumentsDeleted: number;
    collectionsProcessed: number;
    failedCollections: number;
    userAccountDeletion: {
      success: boolean;
      message: string;
      error?: string;
    } | null;
    detailedResults: Array<{
      collection: string;
      deletedCount: number;
      success: boolean;
      error?: string;
    }>;
  };
  error?: string;
}

interface PreviewResponse {
  success: boolean;
  message: string;
  totalDocuments: number;
  preview: DeleteAccountPreview[];
  error?: string;
}

export const useDeleteAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);

  const previewAccountDeletion = async (email?: string, userId?: string) => {
    if (!email && !userId) {
      toast.error('Either email or userId is required');
      return null;
    }

    setIsPreviewLoading(true);
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/users/delete-account?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: PreviewResponse = await response.json();

      if (data.success) {
        setPreviewData(data);
        toast.success(`Found ${data.totalDocuments} documents to delete`);
        return data;
      } else {
        toast.error(data.error || 'Failed to preview account deletion');
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error previewing deletion: ${errorMessage}`);
      return null;
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const deleteAccount = async (email?: string, userId?: string) => {
    if (!email && !userId) {
      toast.error('Either email or userId is required');
      return null;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, userId }),
      });

      const data: DeleteAccountResponse = await response.json();

      if (data.success && data.results) {
        toast.success(
          `Account deleted successfully! Removed ${data.results.totalDocumentsDeleted} documents from ${data.results.collectionsProcessed} collections.`
        );
        
        // Clear preview data after successful deletion
        setPreviewData(null);
        
        return data;
      } else {
        toast.error(data.error || 'Failed to delete account');
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error deleting account: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAndDeleteAccount = async (
    email?: string, 
    userId?: string,
    onConfirm?: () => Promise<boolean>
  ) => {
    // First, preview what will be deleted
    const preview = await previewAccountDeletion(email, userId);
    if (!preview) return null;

    // Ask for confirmation
    let shouldProceed = true;
    if (onConfirm) {
      shouldProceed = await onConfirm();
    } else {
      shouldProceed = window.confirm(
        `Are you sure you want to delete this account?\n\n` +
        `This will permanently delete:\n` +
        `- ${preview.totalDocuments} documents across ${preview.preview.length} collections\n` +
        `- The Appwrite user account\n\n` +
        `This action cannot be undone.`
      );
    }

    if (!shouldProceed) {
      toast('Account deletion cancelled');
      return null;
    }

    // Proceed with deletion
    return await deleteAccount(email, userId);
  };

  return {
    deleteAccount,
    previewAccountDeletion,
    confirmAndDeleteAccount,
    isLoading,
    isPreviewLoading,
    previewData,
  };
};

export type { DeleteAccountResponse, PreviewResponse, DeleteAccountPreview };
