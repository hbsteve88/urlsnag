import { NextRequest, NextResponse } from 'next/server'

// This endpoint is for admin use only
// The actual verification clearing will be done client-side with proper Firestore rules
// This endpoint just validates the request and logs it

export async function POST(request: NextRequest) {
  try {
    const { listingId, userId } = await request.json()

    if (!listingId || !userId) {
      return NextResponse.json(
        { error: 'Listing ID and user ID are required' },
        { status: 400 }
      )
    }

    // Log the admin action for audit purposes
    console.log(`Admin action: Clear verification for listing ${listingId} by user ${userId}`)

    // Return success - the actual update will be done client-side with Firestore rules
    return NextResponse.json({ 
      success: true, 
      message: 'Verification cleared successfully' 
    })
  } catch (error: any) {
    console.error('Error clearing verification:', error)
    return NextResponse.json(
      { error: 'Failed to clear verification', details: error.message },
      { status: 500 }
    )
  }
}
