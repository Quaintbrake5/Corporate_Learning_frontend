/**
 * Converts common video platform URLs to their embeddable counterparts.
 * Supports YouTube (watch, short, embed) and Vimeo URLs.
 */

function extractYouTubeEmbedUrl(urlObj: URL, appendAutoplay: boolean): string | null {
  const isYouTube = urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com';
  const isYouTuShort = urlObj.hostname === 'youtu.be';
  const autoplay = appendAutoplay ? '?autoplay=1' : '';

  if (isYouTube && urlObj.pathname === '/watch') {
    const videoId = urlObj.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}${autoplay}` : null;
  }

  if (isYouTube && urlObj.pathname.startsWith('/embed/')) {
    return `${urlObj.href}${autoplay}`;
  }

  if (isYouTuShort) {
    const videoId = urlObj.pathname.slice(1);
    return videoId ? `https://www.youtube.com/embed/${videoId}${autoplay}` : null;
  }

  return null;
}

function extractVimeoEmbedUrl(urlObj: URL, appendAutoplay: boolean): string | null {
  if (urlObj.hostname !== 'vimeo.com') return null;

  const pathParts = urlObj.pathname.split('/').filter(part => part !== '');
  if (pathParts.length === 0) return null;

  const videoId = pathParts[0];
  if (Number.isNaN(Number(videoId))) return null;

  const autoplay = appendAutoplay ? '?autoplay=1' : '';
  return `https://player.vimeo.com/video/${videoId}${autoplay}`;
}

/**
 * Converts a video URL to its embed format.
 * @param url - The original video URL
 * @param appendAutoplay - Whether to add autoplay query param (default: false)
 * @returns The embed-ready URL, or the original URL if conversion isn't possible
 */
export function convertToEmbedUrl(url: string, appendAutoplay = false): string {
  try {
    const urlObj = new URL(url);
    return extractYouTubeEmbedUrl(urlObj, appendAutoplay)
      ?? extractVimeoEmbedUrl(urlObj, appendAutoplay)
      ?? url;
  } catch {
    // URL is invalid — return the original
    return url;
  }
}
