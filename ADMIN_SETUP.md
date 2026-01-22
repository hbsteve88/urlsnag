# Admin Setup Guide for URLSNAG

## Creating Your Admin User

To access the admin dashboard and approve domain listings, you need to create an admin user in Firestore.

### Step 1: Get Your User ID

1. Sign up on your URLSNAG app at `http://localhost:3000`
2. Open browser DevTools (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Paste this code:
```javascript
import { auth } from '@/lib/firebase'
console.log('Your User ID:', auth.currentUser?.uid)
```
5. Or just check Firebase Console → Authentication → Users and copy your UID

### Step 2: Create Admin Document in Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `urlsnag` project
3. Go to **Firestore Database → Data** tab
4. Click on the `users` collection
5. Click **Add document**
6. Set Document ID to your User ID (from Step 1)
7. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| name | string | Admin |
| email | string | your@email.com |
| role | string | **admin** |
| verified | boolean | true |
| kycStatus | string | approved |
| domainsCount | number | 0 |
| totalSalesVolume | number | 0 |
| totalFeesPaid | number | 0 |
| createdAt | timestamp | (current date) |
| profilePic | string | https://api.dicebear.com/7.x/avataaars/svg?seed=Admin |

8. Click **Save**

### Step 3: Access Admin Dashboard

1. Go to `http://localhost:3000/admin`
2. You should see the Admin Dashboard with pending domain approvals

---

## Admin Dashboard Features

### Pending Approvals
- View all domains waiting for approval
- See seller information and domain details
- Approve or reject listings

### Approval Process

**To Approve a Domain:**
1. Click on the domain listing
2. Review the details
3. Click **Approve** button
4. Domain will appear in marketplace

**To Reject a Domain:**
1. Click on the domain listing
2. Enter rejection reason (required)
3. Click **Reject** button
4. Seller will see rejection reason

### What to Check Before Approving

- ✓ Domain name is valid
- ✓ Price is reasonable
- ✓ Category is appropriate
- ✓ Description is complete
- ✓ No prohibited content
- ✓ No spam or fake listings

---

## Testing the Approval Workflow

### Test Scenario 1: Create and Approve a Domain

1. **Sign out** as admin
2. **Sign up** as a new user (seller)
3. Go to `/sell` page
4. Fill in domain details:
   - Domain: `testdomain.com`
   - Category: `Technology`
   - Price: `5000`
   - Description: `Test domain for approval workflow`
5. Click **List Domain**
6. You should see: "✓ Domain listing submitted for approval!"
7. **Sign out** and sign back in as admin
8. Go to `/admin`
9. You should see the pending domain
10. Click to view details
11. Click **Approve**
12. Go back to home page and search for `testdomain.com`
13. Domain should now appear in marketplace

### Test Scenario 2: Reject a Domain

1. Follow steps 1-9 from above
2. Click **Reject**
3. Enter reason: "Domain contains prohibited content"
4. Click **Reject**
5. Sign out and sign in as seller
6. Go to `/sell` page
7. You should see rejection message (optional feature to implement)

---

## Admin User Roles

### Current Implementation
- **Admin**: `role: "admin"` in Firestore users collection
- **Regular User**: `role: "user"` or no role field

### Firestore Security Rules
The rules automatically check for `role: "admin"` in the user document:

```javascript
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## Multiple Admins

To add more admins:

1. Have them sign up on the app
2. Get their User ID from Firebase Console
3. Create a new document in `users` collection with their User ID
4. Set `role: "admin"`

Each admin can:
- View all pending approvals
- Approve/reject listings
- See all transactions
- Access admin dashboard

---

## Admin Dashboard URL

- **Local**: `http://localhost:3000/admin`
- **Production**: `https://yourdomain.com/admin`

Only users with `role: "admin"` in Firestore can access this page.

---

## Troubleshooting

### "Access Denied" on Admin Page
- Verify your user has `role: "admin"` in Firestore
- Check user ID matches your auth UID
- Refresh the page
- Clear browser cache and try again

### Admin Dashboard Not Loading
- Check browser console for errors
- Verify Firestore rules are published
- Ensure you're signed in
- Check that your user document exists in Firestore

### Can't See Pending Approvals
- Verify listings exist with `status: "pending_approval"`
- Check Firestore Database → listings collection
- Ensure admin user has read access (rules allow it)

### Approval Not Working
- Check browser console for errors
- Verify Firestore Storage rules are published
- Ensure you have write access to listings collection
- Try refreshing the page

---

## Next Steps

1. ✅ Create admin user in Firestore
2. ✅ Access `/admin` page
3. ✅ Test approval workflow
4. 🔄 Create seller dashboard (shows earnings)
5. 🔄 Integrate escrow.com for payments
6. 🔄 Set up email notifications

---

## Security Notes

- Only admins can approve/reject listings
- Firestore rules prevent non-admins from accessing admin data
- All admin actions are logged (optional: implement audit logs)
- Never share admin credentials
- Use strong passwords for admin accounts
