// Service for YouTube & Web Music Downloading, Metadata Extraction, and Offline Ingestion

export interface YouTubeInfo {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  embedUrl: string;
  duration?: string;
  durationSec?: number;
  url?: string;
}

export interface WebConverterTool {
  id: string;
  name: string;
  url: string;
  badge: string;
  desc: string;
  icon: string;
}

/**
 * Extract 11-character YouTube video ID from various YouTube URL formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // If user passed a bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = cleanUrl.match(regex);
  return match && match[1] ? match[1] : null;
};

/**
 * Extract YouTube Playlist ID from URL (e.g. list=PL4fGSIFgk8Uk7tJ...)
 */
export const extractYouTubePlaylistId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  return match && match[1] ? match[1] : null;
};

/**
 * Read text from user clipboard and check if it contains a YouTube URL
 */
export const readYouTubeUrlFromClipboard = async (): Promise<string | null> => {
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) return null;
    const text = await navigator.clipboard.readText();
    if (!text) return null;
    const clean = text.trim();
    if (extractYouTubeVideoId(clean) || extractYouTubePlaylistId(clean)) {
      return clean;
    }
  } catch (err) {
    console.warn('Clipboard read error or not permitted:', err);
  }
  return null;
};

/**
 * Search YouTube automatically by keywords (without API key)
 */
export const searchYouTubeVideos = async (query: string): Promise<YouTubeInfo[]> => {
  if (!query || !query.trim()) return [];
  const cleanQuery = query.trim();

  // 1. Try Windows Electron Desktop App IPC (100% reliable, direct scraping, zero CORS)
  try {
    const desktop = (window as any).SweetBakeryDesktop;
    if (desktop && typeof desktop.searchYouTube === 'function') {
      const results = await desktop.searchYouTube(cleanQuery);
      if (Array.isArray(results) && results.length > 0) {
        return results.map((item: any) => ({
          id: item.id,
          title: item.title,
          author: item.author || 'YouTube',
          thumbnailUrl: item.thumbnailUrl || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&enablejsapi=1`,
          duration: item.duration,
          durationSec: parseDurationStringToSeconds(item.duration),
          url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
        }));
      }
    }
  } catch (e) {
    console.warn('Electron desktop YouTube search failed:', e);
  }

  // 2. Try Android Native Bridge (100% reliable, direct HttpURLConnection, zero CORS)
  try {
    const native = (window as any).SweetBakeryNative;
    if (native && typeof native.searchYouTube === 'function') {
      const raw = native.searchYouTube(cleanQuery);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            id: item.id,
            title: item.title,
            author: item.author || 'YouTube',
            thumbnailUrl: item.thumbnailUrl || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
            embedUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&enablejsapi=1`,
            duration: item.duration,
            durationSec: parseDurationStringToSeconds(item.duration),
            url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
          }));
        }
      }
    }
  } catch (e) {
    console.warn('Android native YouTube search failed:', e);
  }

  // 3. Try local server-side YouTube search proxy (during vite dev)
  try {
    const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results.map((item: any) => ({
          id: item.id,
          title: item.title,
          author: item.author || 'YouTube',
          thumbnailUrl: item.thumbnailUrl || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&enablejsapi=1`,
          duration: item.duration,
          durationSec: parseDurationStringToSeconds(item.duration),
          url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
        }));
      }
    }
  } catch (e) {
    console.warn('Server youtube search endpoint failed, trying fallback...', e);
  }

  // 4. Fallback to curated presets matching query
  const lowerQ = cleanQuery.toLowerCase();
  const matchedPresets = popularYouTubeBakeryPresets.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQ) ||
      p.author.toLowerCase().includes(lowerQ) ||
      p.tags?.some((t) => lowerQ.includes(t))
  );

  return matchedPresets.map((p) => ({
    id: p.id,
    title: p.title,
    author: p.author,
    thumbnailUrl: `https://img.youtube.com/vi/${p.id}/hqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${p.id}?autoplay=1&enablejsapi=1`,
    duration: p.duration,
    durationSec: parseDurationStringToSeconds(p.duration),
    url: `https://www.youtube.com/watch?v=${p.id}`,
  }));
};

/**
 * Fetch all video IDs from a YouTube Playlist
 */
export const fetchYouTubePlaylistVideos = async (playlistUrlOrId: string): Promise<YouTubeInfo[]> => {
  const listId = extractYouTubePlaylistId(playlistUrlOrId) || playlistUrlOrId;
  if (!listId) return [];
  const cleanListId = listId.trim();

  // 1. Try Windows Electron Desktop App IPC
  try {
    const desktop = (window as any).SweetBakeryDesktop;
    if (desktop && typeof desktop.fetchYouTubePlaylist === 'function') {
      const results = await desktop.fetchYouTubePlaylist(cleanListId);
      if (Array.isArray(results) && results.length > 0) {
        return results.map((item: any) => ({
          id: item.id,
          title: item.title,
          author: item.author || 'YouTube Playlist',
          thumbnailUrl: item.thumbnailUrl || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&enablejsapi=1`,
          url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
        }));
      }
    }
  } catch (e) {
    console.warn('Electron desktop playlist extraction failed:', e);
  }

  // 2. Try Android Native Bridge
  try {
    const native = (window as any).SweetBakeryNative;
    if (native && typeof native.fetchYouTubePlaylist === 'function') {
      const raw = native.fetchYouTubePlaylist(cleanListId);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            id: item.id,
            title: item.title,
            author: item.author || 'YouTube Playlist',
            thumbnailUrl: item.thumbnailUrl || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
            embedUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&enablejsapi=1`,
            url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
          }));
        }
      }
    }
  } catch (e) {
    console.warn('Android native playlist extraction failed:', e);
  }

  // 3. Try local server-side proxy
  try {
    const res = await fetch(`/api/youtube-playlist?list=${encodeURIComponent(cleanListId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results.map((item: any) => ({
          id: item.id,
          title: item.title,
          author: item.author || 'YouTube Playlist',
          thumbnailUrl: item.thumbnailUrl || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${item.id}?autoplay=1&enablejsapi=1`,
          url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
        }));
      }
    }
  } catch (e) {
    console.warn('Playlist extraction error:', e);
  }
  return [];
};

const parseDurationStringToSeconds = (durStr?: string): number => {
  if (!durStr) return 210;
  const parts = durStr.split(':').map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 210;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 210;
};

/**
 * Fetch video metadata (title, author, thumbnail) using official YouTube oEmbed API (no API key required)
 */
export const fetchYouTubeVideoInfo = async (urlOrId: string): Promise<YouTubeInfo | null> => {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return null;

  const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedEndpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(standardUrl)}&format=json`;

  try {
    const res = await fetch(oembedEndpoint);
    if (res.ok) {
      const data = await res.json();
      return {
        id: videoId,
        title: data.title || `YouTube Music (${videoId})`,
        author: data.author_name || 'YouTube',
        thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
      };
    }
  } catch (err) {
    console.warn('oEmbed fetch error, using fallback:', err);
  }

  // Fallback with direct YouTube thumbnail
  return {
    id: videoId,
    title: `YouTube Audio Track (${videoId})`,
    author: 'YouTube',
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
  };
};

/**
 * Generate 1-click fast converter portal links for downloading MP3 from YouTube
 */
export const getFastDownloadLinks = (youtubeUrl: string): WebConverterTool[] => {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  const targetUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : youtubeUrl;
  const encodedUrl = encodeURIComponent(targetUrl);

  return [
    {
      id: 'y2mate-mp4',
      name: 'Y2Mate MP4 Video HD',
      url: `https://www.y2mate.is/en?url=${encodedUrl}`,
      badge: '🎬 វីដេអូ MP4 HD',
      desc: 'ទាញយកវីដេអូចម្រៀង YouTube ជា MP4 (720p / 1080p) មើលបានច្បាស់ត្រជាក់ភ្នែក',
      icon: '🎬',
    },
    {
      id: 'savefrom',
      name: 'SaveFrom MP4 HD',
      url: `https://en.savefrom.net/1-youtube-video-downloader-392/?url=${encodedUrl}`,
      badge: '🎥 ទាញយកវីដេអូរហ័ស',
      desc: 'ទាញយកវីដេអូ Full HD MP4 ដោយផ្ទាល់ គាំទ្រទាំងទូរស័ព្ទ និងកុំព្យូទ័រ',
      icon: '📹',
    },
    {
      id: 'y2mate',
      name: 'Y2Mate MP3 Audio',
      url: `https://www.y2mate.is/en?url=${encodedUrl}`,
      badge: '🎵 សំឡេង MP3',
      desc: 'វេបសាយទាញយកចម្រៀង YouTube ជា MP3 យ៉ាងងាយស្រួលលើទូរស័ព្ទ និង PC',
      icon: '🎵',
    },
    {
      id: 'onlymp3',
      name: 'OnlyMP3 Studio',
      url: `https://en.onlymp3.to/`,
      badge: '⚡ MP3 320kbps',
      desc: 'បិទភ្ជាប់ Link រួចទាញយកជាឯកសារ MP3 គុណភាពខ្ពស់ 320kbps',
      icon: '⚡',
    },
    {
      id: 'yt1s',
      name: 'YT1s Converter',
      url: `https://yt1s.com/en/youtube-to-mp3`,
      badge: 'ស្រួលប្រើលើទូរស័ព្ទ',
      desc: 'ទាញយកបទចម្រៀងពី YouTube បានរហ័សទាន់ចិត្ត',
      icon: '📥',
    },
  ];
};

/**
 * Download direct audio from web URL and convert to Blob with duration measurement
 */
export const downloadWebAudioBlob = async (
  url: string
): Promise<{ blob: Blob; duration: number; mimeType: string } | null> => {
  try {
    // Attempt direct fetch
    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      // Fallback via CORS proxy if blocked by browser security
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      res = await fetch(proxyUrl);
    }

    if (!res.ok) {
      throw new Error(`Download failed with status ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || 'audio/mpeg';
    const blob = await res.blob();

    // Measure duration
    const duration = await new Promise<number>((resolve) => {
      try {
        const audio = new Audio();
        const objectUrl = URL.createObjectURL(blob);
        audio.src = objectUrl;
        const cleanup = (dur: number) => {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {}
          resolve(dur || 180);
        };
        audio.addEventListener('loadedmetadata', () => {
          cleanup(Math.round(audio.duration || 0));
        });
        audio.addEventListener('error', () => cleanup(180));
        setTimeout(() => cleanup(180), 3000);
      } catch {
        resolve(180);
      }
    });

    return { blob, duration, mimeType: contentType };
  } catch (err) {
    console.warn('Failed to download audio blob:', err);
    return null;
  }
};

/**
 * Curated Bakery & Cafe Atmosphere Soundtracks ready for instant import
 */
export const curatedBakeryPresets = [
  {
    id: 'curated-lofi-1',
    title: 'Warm Croissant & Morning Coffee 🥐☕',
    artist: 'Bakery Chillhop Beats',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    duration: 147,
    category: 'cafe' as const,
  },
  {
    id: 'curated-jazz-2',
    title: 'French Patisserie Accordion & Jazz 🥖',
    artist: 'Parisian Cafe Quartet',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=french-jazz-accordion-11100.mp3',
    duration: 132,
    category: 'cafe' as const,
  },
  {
    id: 'curated-bday-3',
    title: 'Joyful Birthday Celebration 🎂🎉',
    artist: 'SweetBakery Festival',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf8b628.mp3?filename=happy-birthday-party-pop-21142.mp3',
    duration: 115,
    category: 'birthday' as const,
  },
  {
    id: 'curated-acoustic-4',
    title: 'Sunny Sunday Acoustic Guitar 🍰',
    artist: 'Cozy Morning Coffee',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e3057.mp3?filename=acoustic-guitars-ambient-10850.mp3',
    duration: 160,
    category: 'acoustic' as const,
  },
];

/**
 * Curated Top-Tier YouTube Bakery Soundtracks with 1-click automatic loading
 */
export const popularYouTubeBakeryPresets = [
  {
    id: 'Rg0fyvTDfu8',
    title: 'Rainy Days & Coffee ☕ Relaxing Acoustic Pop Ballads',
    author: 'Cafe Music Studio',
    duration: '1:14:29',
    tags: ['cafe', 'coffee', 'acoustic', 'chill', 'កាហ្វេ', 'bakery'],
    category: 'cafe' as const,
  },
  {
    id: 'dXZKVUQEP08',
    title: 'Beautiful Relaxing Coffee Music 🥐 Acoustic Sweet Bakery Playlist',
    author: 'Coffee Smiley',
    duration: '3:20:15',
    tags: ['cafe', 'acoustic', 'កាហ្វេ', 'morning', 'croissant'],
    category: 'cafe' as const,
  },
  {
    id: 'tUju2C13gGI',
    title: 'កាហ្វេចិញ្ចើមផ្លូវ - តេវ (Khmer Acoustic Cafe Special) 🇰🇭',
    author: 'Sunday Production',
    duration: '4:15',
    tags: ['khmer', 'ចម្រៀងខ្មែរ', 'កាហ្វេ', 'ខ្មែរ', 'acoustic'],
    category: 'acoustic' as const,
  },
  {
    id: 'c8bbf8b628',
    title: 'Happy Birthday Celebration Pop Party 🎂🎉 (Full Song)',
    author: 'SweetBakery Celebrations',
    duration: '3:45',
    tags: ['birthday', 'ខួបកំណើត', 'party', 'cake'],
    category: 'birthday' as const,
  },
  {
    id: 'BywDOO99Ia0',
    title: 'Coffee Shop Music - Relax Jazz Cafe Piano & Patisserie BGM 🥖',
    author: 'Cafe Music BGM Channel',
    duration: '3:30:10',
    tags: ['jazz', 'french', 'bakery', 'piano', 'cafe'],
    category: 'cafe' as const,
  },
  {
    id: '6m1z49HlIaI',
    title: 'Best Acoustic Guitar Covers for Bakery Work & Study 🍰',
    author: 'Afterhours Acoustics',
    duration: '1:04:05',
    tags: ['acoustic', 'guitar', 'study', 'relax', 'chill'],
    category: 'acoustic' as const,
  },
];

