// Service for YouTube & Web Music Downloading, Metadata Extraction, and Offline Ingestion

export interface YouTubeInfo {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  embedUrl: string;
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
      id: 'y2mate',
      name: 'Y2Mate MP3',
      url: `https://www.y2mate.is/en?url=${encodedUrl}`,
      badge: 'ល្បឿនលឿន & ពេញនិយម',
      desc: 'វេបសាយទាញយកចម្រៀង YouTube ជា MP3 យ៉ាងងាយស្រួលលើទូរស័ព្ទ និង PC',
      icon: '🎵',
    },
    {
      id: 'onlymp3',
      name: 'OnlyMP3 Studio',
      url: `https://en.onlymp3.to/`,
      badge: 'ទាញយក MP3 ដោយផ្ទាល់',
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
    {
      id: 'dirpy',
      name: 'Dirpy Studio',
      url: `https://dirpy.com/studio?url=${encodedUrl}`,
      badge: 'អាចកាត់តសំឡេងបាន',
      desc: 'ស្រង់យកតែសំឡេងសុទ្ធ និងអាចកំណត់កម្រិតសំឡេងតាមចិត្ត',
      icon: '✂️',
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
