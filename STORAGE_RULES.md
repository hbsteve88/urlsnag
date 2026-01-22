# Firebase Storage Rules for URLSNAG

## Complete Storage Rules

Copy and paste these rules into your Firebase Storage → Rules tab:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    function isValidImage() {
      return request.resource.contentType.matches('image/.*') &&
             request.resource.size < 10 * 1024 * 1024; // 10MB max
    }
    
    function isValidDocument() {
      return request.resource.contentType.matches('application/pdf|image/.*') &&
             request.resource.size < 50 * 1024 * 1024; // 50MB max
    }

    // ============ USER PROFILES ============
    match /users/{userId}/profile/{allFiles=**} {
      // Users can read their own profile pictures
      allow read: if isOwner(userId);
      
      // Anyone can read public profile pictures
      allow read: if true;
      
      // Users can upload their own profile pictures
      allow write: if isOwner(userId) && isValidImage();
      
      // Admin can manage all profile pictures
      allow write: if isAdmin();
    }

    // ============ DOMAIN LISTINGS ============
    match /listings/{listingId}/images/{allFiles=**} {
      // Anyone can read listing images
      allow read: if true;
      
      // Sellers can upload images for their listings
      allow write: if isAuthenticated() && isValidImage();
      
      // Admin can manage all listing images
      allow write: if isAdmin();
    }

    // ============ DOMAIN THUMBNAILS ============
    match /listings/{listingId}/thumbnail/{allFiles=**} {
      // Anyone can read thumbnails
      allow read: if true;
      
      // Sellers can upload thumbnails
      allow write: if isAuthenticated() && isValidImage();
      
      // Admin can manage thumbnails
      allow write: if isAdmin();
    }

    // ============ DOMAIN LOGOS ============
    match /listings/{listingId}/logo/{allFiles=**} {
      // Anyone can read logos
      allow read: if true;
      
      // Sellers can upload logos
      allow write: if isAuthenticated() && isValidImage();
      
      // Admin can manage logos
      allow write: if isAdmin();
    }

    // ============ OWNERSHIP VERIFICATION DOCUMENTS ============
    match /listings/{listingId}/verification/{allFiles=**} {
      // Only seller and admin can read verification documents
      allow read: if isAuthenticated() && isAdmin();
      
      // Sellers can upload verification documents
      allow write: if isAuthenticated() && isValidDocument();
      
      // Admin can manage verification documents
      allow write: if isAdmin();
    }

    // ============ TRANSACTION DOCUMENTS ============
    match /transactions/{transactionId}/documents/{allFiles=**} {
      // Buyer and seller can read their transaction documents
      allow read: if isAuthenticated();
      
      // Only admin can upload transaction documents
      allow write: if isAdmin();
    }

    // ============ CATCH ALL - DENY EVERYTHING ELSE ============
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Rules Explanation

### User Profiles
- **Read**: Users can read their own, anyone can read public profiles
- **Write**: Users can upload their own profile pictures, admin can manage all

### Domain Listings
- **Read**: Anyone can view listing images
- **Write**: Authenticated users can upload, admin can manage

### Domain Thumbnails
- **Read**: Anyone can view
- **Write**: Authenticated users can upload, admin can manage

### Domain Logos
- **Read**: Anyone can view
- **Write**: Authenticated users can upload, admin can manage

### Ownership Verification Documents
- **Read**: Only admin can read (sensitive documents)
- **Write**: Authenticated users can upload, admin can manage

### Transaction Documents
- **Read**: Authenticated users can read
- **Write**: Only admin can upload

### Catch All
- Everything else is denied by default

---

## File Size & Type Limits

- **Images**: 10MB max (JPEG, PNG, GIF, WebP)
- **Documents**: 50MB max (PDF, images)
- **Allowed types**: Images and PDFs only

---

## Implementation Steps

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `urlsnag` project
3. Go to **Storage → Rules** tab
4. Replace all content with the rules above
5. Click **Publish**

---

## Storage Paths Reference

When uploading files from your app, use these paths:

```typescript
// User profile picture
users/{userId}/profile/avatar.jpg

// Listing images
listings/{listingId}/images/image1.jpg
listings/{listingId}/images/image2.jpg

// Listing thumbnail
listings/{listingId}/thumbnail/thumb.jpg

// Listing logo
listings/{listingId}/logo/logo.png

// Ownership verification
listings/{listingId}/verification/whois.pdf
listings/{listingId}/verification/screenshot.jpg

// Transaction documents
transactions/{transactionId}/documents/agreement.pdf
transactions/{transactionId}/documents/transfer_receipt.pdf
```

---

## Upload Implementation Example

```typescript
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Upload listing image
export const uploadListingImage = async (
  listingId: string,
  file: File
): Promise<string> => {
  try {
    const storageRef = ref(
      storage,
      `listings/${listingId}/images/${Date.now()}_${file.name}`
    )
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Upload user profile picture
export const uploadProfilePicture = async (
  userId: string,
  file: File
): Promise<string> => {
  try {
    const storageRef = ref(storage, `users/${userId}/profile/avatar.jpg`)
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    throw error
  }
}

// Upload verification document
export const uploadVerificationDocument = async (
  listingId: string,
  file: File
): Promise<string> => {
  try {
    const storageRef = ref(
      storage,
      `listings/${listingId}/verification/${Date.now()}_${file.name}`
    )
    
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading verification document:', error)
    throw error
  }
}
```

---

## Security Best Practices

1. **Validate file types** - Only allow images and PDFs
2. **Enforce size limits** - 10MB for images, 50MB for documents
3. **Authenticate uploads** - Only logged-in users can upload
4. **Organize by user/listing** - Use folder structure for organization
5. **Use timestamps** - Prevent filename collisions
6. **Delete old files** - Clean up unused storage
7. **Monitor usage** - Check Storage tab for quota usage
8. **Encrypt sensitive files** - Use client-side encryption for verification docs

---

## Testing Storage Rules

### Test 1: Anyone Can Read Listing Images
```
User: any
Action: Read listings/{listingId}/images/image.jpg
Result: ✅ Allow
```

### Test 2: Authenticated User Can Upload Image
```
User: authenticated
Action: Upload to listings/{listingId}/images/image.jpg
Result: ✅ Allow
```

### Test 3: User Cannot Read Verification Documents
```
User: non-admin
Action: Read listings/{listingId}/verification/doc.pdf
Result: ❌ Deny
```

### Test 4: Admin Can Read Verification Documents
```
User: admin
Action: Read listings/{listingId}/verification/doc.pdf
Result: ✅ Allow
```

### Test 5: File Size Limit Enforced
```
User: authenticated
Action: Upload 15MB image to listings/{listingId}/images/large.jpg
Result: ❌ Deny (exceeds 10MB limit)
```

---

## Common Issues & Solutions

### "Permission denied" on Upload
- Ensure user is authenticated
- Check file size is under limit
- Verify file type is allowed (image or PDF)

### "Permission denied" on Read
- Check if file is in public folder
- Verify user has access to that folder
- Admin can always read

### File Not Uploading
- Check file size
- Verify file type (must be image or PDF)
- Check browser console for errors
- Ensure Storage is enabled in Firebase

### Slow Uploads
- Check file size (compress images)
- Check internet connection
- Use progress tracking for large files

---

## Monitoring Storage

1. Go to Firebase Console → Storage
2. Check **Usage** tab for:
   - Total storage used
   - Download bandwidth
   - Upload bandwidth
3. Monitor for unusual activity
4. Delete old/unused files regularly

---

## Next Steps

1. ✅ Copy and paste Storage rules above
2. ✅ Click Publish
3. ✅ Create storage upload functions in your app
4. ✅ Test uploads with different file types
5. ✅ Monitor storage usage
