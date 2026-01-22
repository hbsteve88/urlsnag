# Firebase Setup Guide for URLSNAG

## Overview
This guide walks you through setting up Firebase for the URLSNAG domain marketplace. Firebase provides:
- **Authentication** - User sign-in/sign-up
- **Firestore** - Database for domain listings, users, and transactions
- **Storage** - Cloud storage for domain images and documents

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `urlsnag`
4. Accept the terms and click **"Create project"**
5. Wait for the project to be created (1-2 minutes)

---

## Step 2: Register Your Web App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app name: `urlsnag-web`
3. Check **"Also set up Firebase Hosting for this app"** (optional)
4. Click **"Register app"**
5. You'll see your Firebase config - **COPY THIS** (you'll need it in Step 4)

Example config looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "urlsnag-abc123.firebaseapp.com",
  projectId: "urlsnag-abc123",
  storageBucket: "urlsnag-abc123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

---

## Step 3: Enable Firebase Services

### Enable Authentication
1. In Firebase Console, go to **Build → Authentication**
2. Click **"Get started"**
3. Enable these sign-in methods:
   - **Email/Password** - Click enable, toggle on
   - **Google** (optional) - Click enable, toggle on, add your email as test user
4. Click **"Save"**

### Enable Firestore Database
1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select region: **us-central1** (or closest to you)
4. Choose **"Start in test mode"** (for development)
5. Click **"Create"**

### Enable Cloud Storage
1. Go to **Build → Storage**
2. Click **"Get started"**
3. Select region: **us-central1** (same as Firestore)
4. Click **"Done"**

---

## Step 4: Add Firebase Credentials to Your Project

1. Create a new file: `.env.local` in your project root
2. Copy the Firebase config from Step 2 and format it as environment variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=urlsnag-abc123.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=urlsnag-abc123
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=urlsnag-abc123.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

**Important:** 
- These variables start with `NEXT_PUBLIC_` so they're safe to expose in the browser
- Never commit `.env.local` to git (it's in `.gitignore`)
- Restart your dev server after adding these variables

---

## Step 5: Initialize Firebase in Your App

The Firebase initialization is already set up in `/lib/firebase.ts`. It reads your environment variables and initializes:
- `auth` - For authentication
- `db` - For Firestore database
- `storage` - For cloud storage

---

## Step 6: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click the **"Rules"** tab
3. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Listings collection
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.sellerId;
    }

    // Offers collection
    match /offers/{offerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.buyerId || request.auth.uid == resource.data.sellerId;
    }
  }
}
```

4. Click **"Publish"**

---

## Step 7: Test the Connection

1. Start your dev server: `npm run dev`
2. Open `http://localhost:3000`
3. You should see no errors in the console
4. Try signing up with email/password

---

## Firestore Database Structure

Here's the recommended collection structure:

### Users Collection
```
/users/{userId}
  - email: string
  - name: string
  - profilePic: string
  - domainsCount: number
  - createdAt: timestamp
  - verified: boolean
```

### Listings Collection
```
/listings/{listingId}
  - domain: string
  - tld: string
  - price: number
  - priceType: string (asking, accepting_offers, starting_bid)
  - category: string
  - description: string
  - sellerId: string (reference to user)
  - thumbnail: string
  - logo: string
  - verified: boolean
  - offers: number
  - createdAt: timestamp
  - endTime: timestamp (for auctions)
  - businessAssets: array
  - socialMedia: array
  - variants: array
```

### Offers Collection
```
/offers/{offerId}
  - listingId: string
  - buyerId: string
  - sellerId: string
  - amount: number
  - message: string
  - status: string (pending, accepted, rejected)
  - createdAt: timestamp
```

---

## Next Steps

1. **Implement Authentication UI** - Create sign-in/sign-up pages
2. **Connect Listings to Firestore** - Replace mock data with real data
3. **Add User Profiles** - Store and display user information
4. **Implement Offers System** - Allow buyers to make offers
5. **Set up Admin Panel** - Manage listings and users

---

## Troubleshooting

### "Firebase is not initialized"
- Check that `.env.local` has all required variables
- Restart your dev server after adding variables
- Verify variables are prefixed with `NEXT_PUBLIC_`

### "Permission denied" errors
- Check Firestore security rules
- Ensure user is authenticated
- Verify user ID matches the document owner

### "Module not found: firebase"
- Run `npm install firebase`
- Restart dev server

### CORS errors
- This is normal during development
- Firebase handles CORS automatically in production

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Next.js + Firebase Guide](https://firebase.google.com/docs/web/setup)
