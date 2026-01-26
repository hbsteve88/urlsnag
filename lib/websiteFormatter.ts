// Format website input to ensure it has a protocol
export const formatWebsiteUrl = (input: string): string => {
  if (!input || !input.trim()) {
    return ''
  }

  const trimmed = input.trim()

  // If it already has a protocol, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // If it looks like a domain (has a dot), add https://
  if (trimmed.includes('.')) {
    return `https://${trimmed}`
  }

  // Otherwise return as-is and let the user fix it
  return trimmed
}

export const isValidWebsiteUrl = (url: string): boolean => {
  if (!url || !url.trim()) {
    return false
  }

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
