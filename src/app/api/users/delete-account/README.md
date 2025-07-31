# Delete Account API Documentation

This API provides comprehensive account deletion functionality that removes all user data from Appwrite collections and deletes the user's authentication account.

## API Endpoints

### DELETE `/api/users/delete-account`

Permanently deletes a user account and all associated data.

**Request Body:**
```json
{
  "email": "user@example.com",  // Optional if userId provided
  "userId": "user123"           // Optional if email provided
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deletion process completed",
  "results": {
    "totalDocumentsDeleted": 45,
    "collectionsProcessed": 12,
    "failedCollections": 0,
    "userAccountDeletion": {
      "success": true,
      "message": "Appwrite user account deleted successfully"
    },
    "detailedResults": [
      {
        "collection": "accounts",
        "deletedCount": 3,
        "success": true
      }
      // ... more collections
    ]
  }
}
```

### GET `/api/users/delete-account?email=user@example.com`

Preview what data will be deleted without actually deleting it.

**Query Parameters:**
- `email` (optional): User's email address
- `userId` (optional): User's Appwrite ID

**Response:**
```json
{
  "success": true,
  "message": "Preview of data to be deleted",
  "totalDocuments": 45,
  "preview": [
    {
      "collection": "accounts",
      "documentCount": 3,
      "documents": [
        {
          "id": "doc123",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
    // ... more collections
  ]
}
```

## React Hook Usage

### `useDeleteAccount`

```tsx
import { useDeleteAccount } from '@/hooks/useDeleteAccount';

function MyComponent() {
  const {
    deleteAccount,
    previewAccountDeletion,
    confirmAndDeleteAccount,
    isLoading,
    isPreviewLoading,
    previewData,
  } = useDeleteAccount();

  // Preview what will be deleted
  const handlePreview = async () => {
    const preview = await previewAccountDeletion('user@example.com');
    console.log('Preview:', preview);
  };

  // Delete with confirmation
  const handleDelete = async () => {
    const result = await confirmAndDeleteAccount('user@example.com');
    if (result) {
      // Redirect user or show success message
      window.location.href = '/';
    }
  };

  return (
    <div>
      <button onClick={handlePreview} disabled={isPreviewLoading}>
        Preview Deletion
      </button>
      <button onClick={handleDelete} disabled={isLoading}>
        Delete Account
      </button>
    </div>
  );
}
```

## React Component Usage

### `DeleteAccountComponent`

```tsx
import DeleteAccountComponent from '@/components/user-profile/DeleteAccountComponent';

function ProfilePage() {
  const handleAccountDeleted = () => {
    // Redirect or cleanup after deletion
    window.location.href = '/';
  };

  return (
    <div>
      {/* Other profile content */}
      
      <DeleteAccountComponent
        userEmail="user@example.com"
        userId="user123"
        onAccountDeleted={handleAccountDeleted}
        className="mt-8"
      />
    </div>
  );
}
```

### `DeleteAccountSection`

Pre-built section for profile pages:

```tsx
import DeleteAccountSection from '@/components/user-profile/DeleteAccountSection';

function ProfilePage() {
  return (
    <div>
      {/* Other profile content */}
      
      <DeleteAccountSection
        userEmail="user@example.com"
        userId="user123"
      />
    </div>
  );
}
```

## Data Collections Deleted

The API will attempt to delete data from these collections:

1. **companies** - User account information
3. **cashbooks** - Income source configurations
2. **users** - User profile data
4. **income** - Income records
5. **expenses** - Expense records
12. **subscriptions** - Subscription data

## Integration Example

To add account deletion to your existing profile page:

```tsx
// In your profile page component
import DeleteAccountSection from '@/components/user-profile/DeleteAccountSection';
import { useSelector } from 'react-redux';

export default function ProfilePage() {
  // Get user data from your Redux store
  const user = useSelector((state: any) => state.auth.user);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
          
          {/* Add delete account section */}
          <DeleteAccountSection
            userEmail={user?.email}
            userId={user?.userId}
          />
        </div>
      </div>
    </div>
  );
}
```

## Security Notes

- The API requires either `email` or `userId` to identify the user
- All deletions are permanent and cannot be undone
- The API uses Appwrite's admin API key for deletion operations
- Frontend components include confirmation dialogs to prevent accidental deletions
- Toast notifications provide user feedback throughout the process

## Error Handling

The API handles various error scenarios:
- Missing user identification
- Appwrite API errors
- Network connectivity issues
- Partial deletion failures

Failed deletions are reported in the response with detailed error information.
