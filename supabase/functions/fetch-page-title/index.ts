const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Fetching page title for:', formattedUrl);

    const response = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch page: ${response.status}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    
    // Extract title from HTML
    let title = '';
    
    // Try og:title first
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitleMatch) {
      title = ogTitleMatch[1];
    }
    
    // Fall back to <title> tag
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1];
      }
    }
    
    // Clean up the title
    title = title
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
    
    if (!title) {
      // Use domain as fallback
      try {
        const urlObj = new URL(formattedUrl);
        title = urlObj.hostname.replace('www.', '');
      } catch {
        title = 'Untitled Page';
      }
    }

    console.log('Extracted title:', title);

    return new Response(
      JSON.stringify({ success: true, title }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching page title:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to fetch page title' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
