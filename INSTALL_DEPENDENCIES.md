# Installing Supabase Swift SDK

## Quick Fix for "No such module 'Supabase'" Error

### Step 1: Add Supabase Package via Xcode

1. **Open the project**
   - Open `urlsnag.xcodeproj` in Xcode

2. **Add Package Dependency**
   - Menu: **File → Add Packages...**
   - In the search box, paste: `https://github.com/supabase/supabase-swift`
   - Click **Add Package**

3. **Select Version**
   - Choose version 2.0.0 or later
   - Click **Add Package**

4. **Select Target**
   - Make sure `urlsnag` target is checked
   - Click **Add Package**

### Step 2: Verify Installation

1. Clean build folder: **Cmd + Shift + K**
2. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```
3. Rebuild: **Cmd + B**

The error should now be resolved.

### Step 3: Configure Credentials

1. Open `urlsnag/Config/AppConfig.swift`
2. Update with your Supabase project details:
   ```swift
   static let supabaseURL = "https://YOUR_PROJECT_ID.supabase.co"
   static let supabaseAnonKey = "YOUR_ANON_KEY"
   ```

Get these from your Supabase project:
- Dashboard → Settings → API
- Copy the Project URL and anon (public) key

## If You Still See the Error

### Option A: Manual Package Resolution

```bash
cd /Volumes/4TB\ PCIe\ SSD/Xcode\ Apps/urlsnag/urlsnag

# Resolve packages
xcodebuild -resolvePackageDependencies

# Clean and rebuild
xcodebuild clean -scheme urlsnag
xcodebuild build -scheme urlsnag
```

### Option B: Reset Package Cache

```bash
# Remove package cache
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/.swiftpm

# Reopen project in Xcode
# File → Close Project
# File → Open Recent → urlsnag.xcodeproj
```

### Option C: Check Package.resolved

1. In Xcode, select the project
2. Select the `urlsnag` target
3. Go to **Build Phases** → **Link Binary With Libraries**
4. Verify Supabase is listed

If not listed:
- Click the **+** button
- Search for "Supabase"
- Add it

## Troubleshooting

| Error | Solution |
|-------|----------|
| "No such module 'Supabase'" | Clean build folder + rebuild |
| Package not found | Verify internet connection, try again |
| Build fails after adding | Restart Xcode |
| Still seeing error | Check target membership (right panel) |

## Verify It Works

After installation, you should be able to:

1. Build the project: **Cmd + B** (should succeed)
2. Run on simulator: **Cmd + R**
3. See the URLSNAG splash screen

If the build succeeds, the Supabase module is properly installed.
