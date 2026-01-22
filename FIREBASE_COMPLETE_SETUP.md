# Firebase Setup Complete ✅

Your Firebase project is now configured and ready to use!

## What's Been Set Up

### 1. Firebase Configuration
- ✅ `.env.local` created with your credentials
- ✅ Firebase SDK installed (`npm install firebase`)
- ✅ `/lib/firebase.ts` - Firebase initialization with Auth, Firestore, and Storage

### 2. Authentication System
- ✅ `AuthContext.tsx` - Global auth state management
- ✅ `SignIn.tsx` - Email/password sign-in component
- ✅ `SignUp.tsx` - User registration with Firestore profile creation
- ✅ `AuthProvider` - Wrapped in app layout for global access

### 3. Environment Variables
Your `.env.local` contains:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDdcPoU86j0IsEhN_S-bjtWYexXWdWH-Q8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=urlsnag.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=urlsnag
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=urlsnag.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=558042571408
NEXT_PUBLIC_FIREBASE_APP_ID=1:558042571408:web:0ed0736a42c12c33c62e15
```

---

## Next Steps

### Step 1: Set Up Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `urlsnag` project
3. Go to **Firestore Database → Rules** tab
4. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - readable by all, writable only by owner
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // Listings collection - readable by all, writable by owner
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.sellerId;
    }

    // Offers collection - readable by involved parties
    match /offers/{offerId} {
      allow read: if request.auth.uid == resource.data.buyerId || request.auth.uid == resource.data.sellerId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.buyerId || request.auth.uid == resource.data.sellerId;
    }
  }
}
```

5. Click **Publish**

### Step 2: Restart Your Dev Server

After setting up `.env.local`, restart your dev server:
```bash
npm run dev
```

### Step 3: Test Authentication

1. Open `http://localhost:3000`
2. Try signing up with an email and password
3. You should see a new user created in Firestore under `users` collection

---

## Using Authentication in Your Components

### Access Current User
```tsx
'use client'
import { useAuth } from '@/components/AuthContext'

export default function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>

  return (
    <div>
      <p>Welcome, {user.displayName}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protect Pages (Require Sign-In)
```tsx
'use client'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>Protected content here</div>
}
```

---

## Firestore Collections Structure

### Users Collection
```
/users/{userId}
  name: string
  email: string
  profilePic: string
  domainsCount: number
  createdAt: timestamp
  verified: boolean
```

### Listings Collection
```
/listings/{listingId}
  domain: string
  tld: string
  price: number
  priceType: string (asking, accepting_offers, starting_bid)
  category: string
  description: string
  sellerId: string (user ID)
  thumbnail: string
  logo: string
  verified: boolean
  offers: number
  createdAt: timestamp
  endTime: timestamp (for auctions)
  businessAssets: array
  socialMedia: array
  variants: array
```

### Offers Collection
```
/offers/{offerId}
  listingId: string
  buyerId: string
  sellerId: string
  amount: number
  message: string
  status: string (pending, accepted, rejected)
  createdAt: timestamp
```

---

## Common Tasks

### Save a Domain Listing to Firestore
```tsx
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/AuthContext'

export default function CreateListing() {
  const { user } = useAuth()

  const handleCreateListing = async (listingData) => {
    if (!user) return

    try {
      await addDoc(collection(db, 'listings'), {
        ...listingData,
        sellerId: user.uid,
        createdAt: new Date(),
      })
      console.log('Listing created!')
    } catch (error) {
      console.error('Error creating listing:', error)
    }
  }

  return <button onClick={() => handleCreateListing({...})}>Create Listing</button>
}
```

### Fetch All Listings
```tsx
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useEffect, useState } from 'react'

export default function ListingsPage() {
  const [listings, setListings] = useState([])

  useEffect(() => {
    const fetchListings = async () => {
      const q = query(collection(db, 'listings'))
      const snapshot = await getDocs(q)
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    fetchListings()
  }, [])

  return <div>{listings.map(listing => <div key={listing.id}>{listing.domain}</div>)}</div>
}
```

### Make an Offer
```tsx
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/AuthContext'

export default function MakeOfferButton({ listingId, sellerId }) {
  const { user } = useAuth()

  const handleMakeOffer = async (amount) => {
    if (!user) return

    try {
      await addDoc(collection(db, 'offers'), {
        listingId,
        buyerId: user.uid,
        sellerId,
        amount,
        message: 'Interested in this domain',
        status: 'pending',
        createdAt: new Date(),
      })
      console.log('Offer created!')
    } catch (error) {
      console.error('Error creating offer:', error)
    }
  }

  return <button onClick={() => handleMakeOffer(5000)}>Make Offer</button>
}
```

---

## Troubleshooting

### "Firebase is not initialized"
- Verify `.env.local` exists with all variables
- Restart dev server: `npm run dev`
- Check browser console for errors

### "Permission denied" errors
- Check Firestore security rules are published
- Ensure user is authenticated
- Verify user ID matches document owner

### "Module not found: firebase"
- Run: `npm install firebase`
- Restart dev server

### Users not appearing in Firestore
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console
- Check security rules allow writes

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Next.js + Firebase](https://firebase.google.com/docs/web/setup)
