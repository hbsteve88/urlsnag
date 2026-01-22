import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { domain, dnsToken, registrar } = await request.json()

    if (!domain || !dnsToken) {
      return NextResponse.json(
        { error: 'Domain and DNS token are required' },
        { status: 400 }
      )
    }

    // Remove www. if present and get the root domain
    const cleanDomain = domain.replace(/^www\./, '')
    
    console.log(`Checking DNS TXT records for: ${cleanDomain}`)
    console.log(`Looking for token: ${dnsToken}`)
    console.log(`Registrar: ${registrar}`)

    try {
      // Use Google's public DNS API to query TXT records
      const response = await fetch(
        `https://dns.google/resolve?name=${cleanDomain}&type=TXT`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`DNS API returned ${response.status}`)
      }

      const data = await response.json()
      
      console.log(`DNS API response:`, data)

      // Check if there are any answer records
      if (!data.Answer || data.Answer.length === 0) {
        return NextResponse.json(
          { verified: false, message: 'No TXT records found for this domain. Please ensure you\'ve added the DNS record and wait for propagation.' },
          { status: 200 }
        )
      }

      // Look for the matching TXT record
      let verified = false
      
      // Check for standard _urlsnag-verify record
      verified = data.Answer.some((answer: any) => {
        if (answer.type !== 16) return false // Type 16 is TXT
        
        const recordValue = answer.data
        console.log(`Comparing standard: "${recordValue}" === "${dnsToken}"`)
        
        // Remove quotes if present
        const cleanValue = recordValue.replace(/^"|"$/g, '')
        return cleanValue === dnsToken
      })

      // For GoDaddy, also check for the quick verification method (@ record with the value)
      if (!verified && registrar === 'godaddy') {
        console.log(`Standard method not found, checking GoDaddy quick verification method...`)
        verified = data.Answer.some((answer: any) => {
          if (answer.type !== 16) return false // Type 16 is TXT
          
          const recordValue = answer.data
          console.log(`Comparing GoDaddy quick: "${recordValue}" === "${dnsToken}"`)
          
          // Remove quotes if present
          const cleanValue = recordValue.replace(/^"|"$/g, '')
          // For GoDaddy quick verification, the value is added directly to @ record
          return cleanValue === dnsToken
        })
        
        if (verified) {
          console.log(`GoDaddy quick verification method detected`)
        }
      }

      if (verified) {
        return NextResponse.json({ verified: true, message: 'DNS record verified successfully' })
      } else {
        // Show what records were found
        const recordsFound = data.Answer
          .filter((a: any) => a.type === 16)
          .map((a: any) => a.data)
          .join(', ')
        
        return NextResponse.json(
          { verified: false, message: `DNS record not found. Records found: ${recordsFound || 'none'}. Please ensure you've added the TXT record with the exact value.` },
          { status: 200 }
        )
      }
    } catch (dnsError: any) {
      console.error('DNS lookup error:', dnsError.message)
      return NextResponse.json(
        { verified: false, message: `DNS lookup failed: ${dnsError.message}. Please try again in a moment.` },
        { status: 200 }
      )
    }
  } catch (error: any) {
    console.error('Error verifying DNS:', error)
    return NextResponse.json(
      { error: 'Failed to verify DNS record', details: error.message },
      { status: 500 }
    )
  }
}
