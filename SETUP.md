# URLSNAG Setup Guide

## Step 1: Add Supabase Swift SDK

### Via Xcode (Recommended)

1. Open `urlsnag.xcodeproj` in Xcode
2. Select the project in the navigator
3. Select the "urlsnag" target
4. Go to **Build Phases** → **Link Binary With Libraries**
5. Click the **+** button
6. Search for and add the Supabase Swift SDK

**OR** use Swift Package Manager directly:

1. File → Add Package Dependencies
2. Enter URL: `https://github.com/supabase/supabase-swift`
3. Select version 2.0.0 or later
4. Add to the `urlsnag` target

### Verify Installation

After adding the package, the error should resolve. If you still see "No such module 'Supabase'":

1. Clean build folder: **Cmd + Shift + K**
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
3. Rebuild: **Cmd + B**

## Step 2: Configure Supabase Credentials

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Open `urlsnag/Config/AppConfig.swift`
4. Update these values:

```swift
static let supabaseURL = "https://YOUR_PROJECT_ID.supabase.co"
static let supabaseAnonKey = "YOUR_ANON_KEY"
```

## Step 3: Set Up Database

### Option A: Via Supabase Dashboard

1. Go to SQL Editor in your Supabase project
2. Create a new query
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query
5. Repeat for `supabase/migrations/002_seed_data.sql`

### Option B: Via Supabase CLI

```bash
cd supabase
supabase db push
```

## Step 4: Deploy Edge Functions

```bash
cd supabase

# Deploy each function
supabase functions deploy verify-dns
supabase functions deploy generate-verification-token
supabase functions deploy create-transaction
supabase functions deploy escrow-mock
supabase functions deploy search
```

## Step 5: Configure Authentication

In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Email** (Magic Link)
3. (Optional) Enable **Apple** for Sign in with Apple

For Apple Sign-In:
- Add "Sign in with Apple" capability in Xcode
- Configure in Apple Developer Portal
- Add your Team ID to Xcode

## Step 6: Build and Run

```bash
# Clean build
Cmd + Shift + K

# Build
Cmd + B

# Run on simulator
Cmd + R
```

## Troubleshooting

### "No such module 'Supabase'"
- Clean build folder and derived data (see Step 1)
- Verify package is added to target

### Authentication fails
- Check Supabase URL and anon key in AppConfig.swift
- Verify email provider is enabled in Supabase Dashboard

### Edge functions not found
- Verify functions are deployed: `supabase functions list`
- Check function logs: `supabase functions logs FUNCTION_NAME`

### Database errors
- Check RLS policies are enabled
- Verify migrations ran successfully
- Check Supabase logs for SQL errors

## Test Data

After running seed migrations, test with:

| Email | Password | Role |
|-------|----------|------|
| seller1@test.com | (magic link) | Seller |
| seller2@test.com | (magic link) | Seller |
| buyer1@test.com | (magic link) | Buyer |

Use email magic link authentication to sign in.
