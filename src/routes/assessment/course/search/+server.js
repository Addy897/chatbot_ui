// src/routes/api/search.js
import { google } from 'googleapis';
import { YT_API } from '$env/static/private';

export async function GET({ url }) {
  const query = url.searchParams.get('query');

  const youtube = google.youtube({ version: 'v3', auth: YT_API });

  try {
    const response = await youtube.search.list({
      q: query,
      part: 'snippet',
      maxResults: 5,
      type: 'video',
    });

    return new Response(JSON.stringify({
      status: 200,
      body: response.data.items.map(item => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        description: item.snippet.description,
        videoId: item.id.videoId,
      })),
    }));
  } catch (error) {
    return new Response(JSON.stringify({
      status: 500,
      body: { error: 'Error fetching YouTube videos' },
    }));
  }
}
