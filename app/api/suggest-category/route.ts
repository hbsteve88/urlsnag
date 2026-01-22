import { NextRequest, NextResponse } from 'next/server'
import { suggestCategory } from '@/lib/categories'

export async function POST(request: NextRequest) {
  try {
    const { domainName } = await request.json()

    if (!domainName || typeof domainName !== 'string') {
      return NextResponse.json({ error: 'Invalid domain name' }, { status: 400 })
    }

    const suggestion = suggestCategory(domainName)

    return NextResponse.json({ category: suggestion })
  } catch (error) {
    console.error('Error suggesting category:', error)
    return NextResponse.json({ error: 'Failed to suggest category' }, { status: 500 })
  }
}
