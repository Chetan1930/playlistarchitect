export interface LinkItem {
  id: string;
  url: string;
  title: string;
  favicon: string | null;
  category: string;
  createdAt: string;
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = getDomain(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return '';
  }
}

export function detectCategory(url: string): string {
  const domain = getDomain(url);
  const patterns: [RegExp, string][] = [
    [/(youtube|vimeo|dailymotion|netflix|twitch)/, 'Video'],
    [/(spotify|soundcloud|apple.com\/music)/, 'Music'],
    [/(github|gitlab|stackoverflow|dev.to|medium.com)/, 'Development'],
    [/(linkedin|indeed|glassdoor)/, 'Jobs'],
    [/(amazon|ebay|etsy|walmart|shopify)/, 'Shopping'],
    [/(facebook|twitter|instagram|reddit|tiktok)/, 'Social'],
    [/(udemy|coursera|edx|khanacademy|skillshare)/, 'Learning'],
    [/(google.com\/docs|notion|dropbox|drive.google)/, 'Productivity'],
    [/(cnn|bbc|nytimes|reuters)/, 'News'],
    [/(airbnb|booking|expedia)/, 'Travel'],
  ];
  for (const [pattern, category] of patterns) {
    if (pattern.test(domain)) return category;
  }
  return 'Other';
}

export function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

export function normalizeUrl(url: string): string {
  if (url && !url.match(/^[a-zA-Z]+:\/\//)) return `https://${url}`;
  return url;
}

export function groupLinksByCategory(links: LinkItem[]): Record<string, LinkItem[]> {
  return links.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);
}
