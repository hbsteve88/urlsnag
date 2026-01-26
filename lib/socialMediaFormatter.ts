// Social media URL patterns and formatters
const socialMediaPatterns: Record<string, { baseUrl: string; pattern: RegExp }> = {
  instagram: {
    baseUrl: 'https://instagram.com/',
    pattern: /^(https?:\/\/)?(www\.)?instagram\.com\//i,
  },
  twitter: {
    baseUrl: 'https://twitter.com/',
    pattern: /^(https?:\/\/)?(www\.)?twitter\.com\//i,
  },
  facebook: {
    baseUrl: 'https://facebook.com/',
    pattern: /^(https?:\/\/)?(www\.)?facebook\.com\//i,
  },
  tiktok: {
    baseUrl: 'https://tiktok.com/@',
    pattern: /^(https?:\/\/)?(www\.)?tiktok\.com\/@/i,
  },
  youtube: {
    baseUrl: 'https://youtube.com/@',
    pattern: /^(https?:\/\/)?(www\.)?youtube\.com\/@/i,
  },
  linkedin: {
    baseUrl: 'https://linkedin.com/in/',
    pattern: /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\//i,
  },
}

export const formatSocialMediaUrl = (platform: string, input: string): string => {
  if (!input || !input.trim()) {
    return ''
  }

  const trimmedInput = input.trim()
  const config = socialMediaPatterns[platform.toLowerCase()]

  if (!config) {
    return trimmedInput
  }

  // If it already matches the pattern, return as-is
  if (config.pattern.test(trimmedInput)) {
    return trimmedInput
  }

  // If it starts with http:// or https://, it's a URL but for wrong platform
  if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
    return trimmedInput
  }

  // If it contains a slash, it might be a partial URL, return as-is
  if (trimmedInput.includes('/')) {
    return trimmedInput
  }

  // It's just a username, format it
  return config.baseUrl + trimmedInput
}

export const isValidSocialMediaUrl = (url: string): boolean => {
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
