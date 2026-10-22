import test from 'node:test';
import assert from 'node:assert/strict';
import { getStoredGroqKey, getStoredYouTubeKey, getStoredSpotifyCredentials, queryGroqDirect } from '../src/utils/engineClient.js';
import { getStoredTavilyKey, searchTavily } from '../src/utils/tavilyClient.js';

test('unconfigured providers fail clearly without making authenticated requests', async () => {
  assert.equal(getStoredGroqKey(), '');
  assert.equal(getStoredTavilyKey(), '');
  assert.equal(getStoredYouTubeKey(), '');
  assert.deepEqual(getStoredSpotifyCredentials(), { clientId: '', clientSecret: '' });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Unexpected network request'); };
  try {
    assert.equal((await searchTavily({ query: 'example' })).error, 'NO_KEY');
    await assert.rejects(queryGroqDirect({ query: 'example' }), /No Groq API Key/);
  } finally { globalThis.fetch = originalFetch; }
});

test('existing personal settings override empty provider defaults', () => {
  const previous = globalThis.localStorage;
  const values = new Map([
    ['psychis_groq_api_key', 'personal-groq-example'],
    ['psychis_tavily_api_key', 'personal-tavily-example'],
    ['psychis_youtube_api_key', 'personal-youtube-example'],
    ['psychis_spotify_client_id', 'personal-client-example'],
    ['psychis_spotify_client_secret', 'personal-secret-example'],
  ]);
  globalThis.localStorage = { getItem: (key) => values.get(key) ?? null };
  try {
    assert.equal(getStoredGroqKey(), 'personal-groq-example');
    assert.equal(getStoredTavilyKey(), 'personal-tavily-example');
    assert.equal(getStoredYouTubeKey(), 'personal-youtube-example');
    assert.deepEqual(getStoredSpotifyCredentials(), { clientId: 'personal-client-example', clientSecret: 'personal-secret-example' });
  } finally { globalThis.localStorage = previous; }
});
