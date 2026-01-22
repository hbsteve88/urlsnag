# URLSNAG - Quick Start Guide

## Problem: "No such module 'Supabase'"

This error occurs because the Supabase Swift SDK hasn't been added to the Xcode project yet.

## Solution: Add Supabase Package (2 minutes)

### Method 1: Xcode UI (Easiest)

1. Open `urlsnag.xcodeproj` in Xcode
2. **File** → **Add Packages...**
3. Paste URL: `https://github.com/supabase/supabase-swift`
4. Click **Add Package**
5. Select version **2.0.0** or later
6. Click **Add Package** again
7. Ensure **urlsnag** target is selected
8. Click **Add Package**

### Method 2: Terminal

```bash
cd /Volumes/4TB\ PCIe\ SSD/Xcode\ Apps/urlsnag/urlsnag
xcodebuild -resolvePackageDependencies
```

### Method 3: Manual Fix

If the above doesn't work:

1. In Xcode, select the **urlsnag** project
2. Select **urlsnag** target
3. Go to **Build Phases** tab
4. Expand **Link Binary With Libraries**
5. Click **+**
6. Search for "Supabase"
7. Add it

## After Adding Package

1. **Clean**: Cmd + Shift + K
2. **Build**: Cmd + B
3. **Run**: Cmd + R

The error should be gone!

## Next Steps

See `SETUP.md` for:
- Configuring Supabase credentials
- Setting up the database
- Deploying edge functions
- Running the app

## Still Having Issues?

1. Restart Xcode
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
3. Try again

Contact: support@urlsnag.com
