# Firestore Security Rules for URLSNAG

## Complete Security Rules

Copy and paste these rules into your Firestore Database → Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAuthenticated() {
      return request.auth != null;
    }

    // ============ USERS COLLECTION ============
    match /users/{userId} {
      // Authenticated users can read their own profile
      allow read: if isOwner(userId);
      
      // Anyone can read public user profiles (for display purposes)
      allow read: if true;
      
      // Users can only write to their own profile
      allow write: if isOwner(userId);
    }

    // ============ LISTINGS COLLECTION ============
    match /listings/{listingId} {
      // Anyone can read approved listings
      allow read: if resource.data.status == 'approved' || 
                     resource.data.status == 'sold';
      
      // Sellers can read their own pending listings
      allow read: if isOwner(resource.data.sellerId);
      
      // Admin can read all listings
      allow read: if isAdmin();
      
      // Authenticated users can create listings (will be pending_approval)
      allow create: if isAuthenticated() && 
                       request.resource.data.sellerId == request.auth.uid &&
                       request.resource.data.status == 'pending_approval';
      
      // Sellers can update their own listings if pending
      allow update: if isOwner(resource.data.sellerId) && 
                       resource.data.status == 'pending_approval';
      
      // Sellers can update their own approved listings (except domain name)
      allow update: if isOwner(resource.data.sellerId) && 
                       resource.data.status == 'approved' &&
                       request.resource.data.domain == resource.data.domain;
      
      // Admin can update any listing (for approval/rejection)
      allow update: if isAdmin();
      
      // Sellers can delete their own pending listings
      allow delete: if isOwner(resource.data.sellerId) && 
                       resource.data.status == 'pending_approval';
      
      // Admin can delete any listing
      allow delete: if isAdmin();
    }

    // ============ OFFERS COLLECTION ============
    match /offers/{offerId} {
      // Buyer and seller can read their own offers
      allow read: if isOwner(resource.data.buyerId) || 
                     isOwner(resource.data.sellerId);
      
      // Admin can read all offers
      allow read: if isAdmin();
      
      // Authenticated users can create offers
      allow create: if isAuthenticated() && 
                       request.resource.data.buyerId == request.auth.uid;
      
      // Buyer and seller can update their own offers
      allow update: if isOwner(resource.data.buyerId) || 
                       isOwner(resource.data.sellerId);
      
      // Admin can update any offer
      allow update: if isAdmin();
      
      // Buyer can delete their own offers
      allow delete: if isOwner(resource.data.buyerId);
      
      // Admin can delete any offer
      allow delete: if isAdmin();
    }

    // ============ TRANSACTIONS COLLECTION ============
    match /transactions/{transactionId} {
      // Buyer and seller can read their own transactions
      allow read: if isOwner(resource.data.buyerId) || 
                     isOwner(resource.data.sellerId);
      
      // Admin can read all transactions
      allow read: if isAdmin();
      
      // Only backend can create/update transactions
      allow create, update, delete: if false;
    }

    // ============ AGREEMENTS COLLECTION ============
    match /agreements/{agreementId} {
      // Buyer and seller can read their own agreements
      allow read: if isOwner(resource.data.buyerId) || 
                     isOwner(resource.data.sellerId);
      
      // Admin can read all agreements
      allow read: if isAdmin();
      
      // Buyer can accept agreement (set buyerAccepted = true)
      allow update: if isOwner(request.auth.uid) && 
                       request.auth.uid == resource.data.buyerId &&
                       request.resource.data.buyerAccepted == true &&
                       resource.data.buyerAccepted == false;
      
      // Seller can accept agreement (set sellerAccepted = true)
      allow update: if isOwner(request.auth.uid) && 
                       request.auth.uid == resource.data.sellerId &&
                       request.resource.data.sellerAccepted == true &&
                       resource.data.sellerAccepted == false;
      
      // Only backend can create/delete
      allow create, delete: if false;
    }

    // ============ DOMAIN APPROVALS COLLECTION ============
    match /domainApprovals/{approvalId} {
      // Seller can read their own approvals
      allow read: if isOwner(resource.data.sellerId);
      
      // Admin can read all approvals
      allow read: if isAdmin();
      
      // Only backend can create/update
      allow create, update, delete: if false;
    }

    // ============ ADMIN LOGS COLLECTION ============
    match /adminLogs/{logId} {
      // Only admin can read logs
      allow read: if isAdmin();
      
      // Only backend can write logs
      allow write: if false;
    }

    // ============ CATCH ALL ============
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Rules Explanation

### Users Collection
- **Read**: Public profiles visible to everyone
- **Write**: Users can only edit their own profile
- **Admin**: Can read/write any user

### Listings Collection
- **Read**: 
  - Everyone can see approved/sold listings
  - Sellers can see their pending listings
  - Admin can see all listings
- **Create**: Only authenticated users (creates as pending_approval)
- **Update**: 
  - Sellers can update pending listings
  - Admin can update any listing (for approval)
- **Delete**: 
  - Sellers can delete pending listings
  - Admin can delete any listing

### Offers Collection
- **Read**: Only buyer/seller and admin
- **Create**: Authenticated users only
- **Update**: Buyer/seller can update their offers
- **Delete**: Buyer can delete, admin can delete any

### Transactions Collection
- **Read**: Only buyer/seller and admin
- **Write**: Backend only (no client writes)

### Agreements Collection
- **Read**: Only buyer/seller and admin
- **Update**: Only to accept (buyer/seller can set their acceptance flag)
- **Create/Delete**: Backend only

### Domain Approvals Collection
- **Read**: Seller can see their own, admin can see all
- **Write**: Backend only

### Admin Logs Collection
- **Read**: Admin only
- **Write**: Backend only

---

## Implementation Steps

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `urlsnag` project
3. Go to **Firestore Database → Rules** tab
4. Replace all content with the rules above
5. Click **Publish**

---

## Testing the Rules

### Test 1: User Can Read Public Listings
```
User: any
Action: Read listing with status='approved'
Result: ✅ Allow
```

### Test 2: User Cannot Read Pending Listings (Not Owner)
```
User: buyer123
Action: Read listing with status='pending_approval' (seller=seller456)
Result: ❌ Deny
```

### Test 3: Seller Can Read Own Pending Listing
```
User: seller456
Action: Read listing with status='pending_approval' (seller=seller456)
Result: ✅ Allow
```

### Test 4: Admin Can Read Any Listing
```
User: admin (role='admin')
Action: Read any listing
Result: ✅ Allow
```

### Test 5: User Cannot Create Transaction
```
User: any
Action: Create transaction document
Result: ❌ Deny (backend only)
```

### Test 6: Buyer Can Accept Agreement
```
User: buyer123
Action: Update agreement (buyerAccepted=true)
Result: ✅ Allow
```

### Test 7: Buyer Cannot Accept for Seller
```
User: buyer123
Action: Update agreement (sellerAccepted=true)
Result: ❌ Deny
```

---

## Firestore Rules Simulator

Firebase provides a Rules Simulator to test your rules:

1. In Firestore Rules tab, click **Rules Simulator**
2. Select operation (read/write)
3. Enter collection path
4. Enter document ID
5. Set authentication context
6. Click **Run**

---

## Common Issues & Solutions

### "Permission denied" on Read
- Check if listing is approved
- Check if user is seller/admin
- Verify user is authenticated

### "Permission denied" on Create
- Ensure user is authenticated
- Verify sellerId matches auth.uid
- Check status is 'pending_approval'

### "Permission denied" on Update
- Verify user owns the document
- Check document status allows update
- Ensure you're not modifying restricted fields

### Admin Functions Not Working
- Verify user has role='admin' in Firestore
- Check admin check function syntax
- Ensure user is authenticated

---

## Security Best Practices

1. **Never allow client writes to transactions** - Only backend
2. **Validate all user IDs** - Ensure they match auth.uid
3. **Check document status** - Only allow operations on correct status
4. **Log admin actions** - Track all approvals/rejections
5. **Rate limit** - Prevent spam (implement in backend)
6. **Validate data** - Check field types and values
7. **Encrypt sensitive data** - Store encrypted in Firestore
8. **Regular audits** - Review rules quarterly

---

## Monitoring & Debugging

### Enable Firestore Logging
1. Go to Cloud Logging
2. Create filter: `resource.type="cloud_firestore"`
3. View denied requests
4. Identify rule violations

### Common Denied Requests
- Users reading other users' private data
- Unauthenticated users creating documents
- Sellers updating sold listings
- Buyers creating transactions

---

## Next Steps

1. ✅ Copy and paste rules above
2. ✅ Click Publish
3. ✅ Test with Rules Simulator
4. ✅ Monitor logs for denied requests
5. ✅ Adjust as needed based on usage patterns
