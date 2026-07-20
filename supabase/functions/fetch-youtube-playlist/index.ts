const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoItem {
  videoId: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  author?: string;
  position: number;
}

function extractPlaylistId(url: string): string | null {
  try {
    const u = new URL(url);
    const list = u.searchParams.get('list');
    return list;
  } catch {
    return null;
  }
}

function unescapeJson(s: string): string {
  try { return JSON.parse('"' + s + '"'); } catch { return s; }
}

// Parse ytInitialData JSON blob from YouTube playlist HTML
function parseVideos(html: string): { title: string; videos: VideoItem[] } {
  let playlistTitle = 'YouTube Playlist';
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitle) playlistTitle = ogTitle[1];

  const videos: VideoItem[] = [];
  const seen = new Set<string>();
  let position = 0;

  // New YouTube layout: lockupViewModel blocks containing a videoId + lockupMetadataViewModel.title.content
  const lockupRegex = /"lockupViewModel":\{"contentImage":\{"thumbnailViewModel"[\s\S]*?"metadata":\{"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/g;
  // Also need videoId for each; capture within same chunk
  const blockRegex = /"lockupViewModel":\{([\s\S]*?)"rendererContext":\{[\s\S]*?\}\}\}/g;

  // Simpler: iterate metadata occurrences and pair with nearest preceding videoId in the same lockup block
  const lockupSplits = html.split('"lockupViewModel":{');
  for (let i = 1; i < lockupSplits.length; i++) {
    const chunk = lockupSplits[i].slice(0, 8000);
    const idMatch = chunk.match(/"videoId":"([a-zA-Z0-9_-]{6,})"/);
    const titleMatch = chunk.match(/"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"/);
    if (!idMatch || !titleMatch) continue;
    const videoId = idMatch[1];
    if (seen.has(videoId)) continue;
    const title = unescapeJson(titleMatch[1]) || 'Untitled video';

    let author = '';
    const authorMatch = chunk.match(/"metadataParts":\[\{"text":\{"content":"((?:[^"\\]|\\.)*)"/);
    if (authorMatch) author = unescapeJson(authorMatch[1]);

    videos.push({
      videoId,
      title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      author,
      position,
    });
    seen.add(videoId);
    position++;
  }

  // Fallback: legacy playlistVideoRenderer
  if (videos.length === 0) {
    const rendererRegex = /"playlistVideoRenderer":\s*\{([\s\S]*?)"trackingParams"/g;
    let match;
    while ((match = rendererRegex.exec(html)) !== null) {
      const chunk = match[1];
      const idMatch = chunk.match(/"videoId":"([^"]+)"/);
      if (!idMatch) continue;
      const videoId = idMatch[1];
      if (seen.has(videoId)) continue;
      let title = '';
      const runMatch = chunk.match(/"title":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"((?:[^"\\]|\\.)*)"/);
      if (runMatch) title = unescapeJson(runMatch[1]);
      else {
        const simpleMatch = chunk.match(/"title":\s*\{[^}]*"simpleText":\s*"((?:[^"\\]|\\.)*)"/);
        if (simpleMatch) title = unescapeJson(simpleMatch[1]);
      }
      videos.push({
        videoId,
        title: title || 'Untitled video',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        position,
      });
      seen.add(videoId);
      position++;
    }
  }

  return { title: playlistTitle, videos };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ success: false, error: 'URL required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      return new Response(JSON.stringify({ success: false, error: 'Not a playlist URL' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    console.log('Fetching playlist:', playlistUrl);

    const resp = await fetch(playlistUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!resp.ok) {
      return new Response(JSON.stringify({ success: false, error: `Fetch failed: ${resp.status}` }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = await resp.text();
    const { title, videos } = parseVideos(html);

    console.log(`Playlist "${title}" parsed with ${videos.length} videos`);

    return new Response(JSON.stringify({ success: true, playlistId, title, videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('fetch-youtube-playlist error:', err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
