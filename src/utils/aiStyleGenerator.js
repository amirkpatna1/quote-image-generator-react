const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const THEME_MAPPING = {
  inspiring: ['mountains', 'sunset', 'space', 'flowers'],
  motivational: ['mountains', 'road', 'sports', 'nature'],
  thoughtful: ['forest', 'minimal', 'abstract', 'dark'],
  melancholic: ['rain', 'dark', 'night', 'ocean'],
  energetic: ['sunset', 'sports', 'city', 'space'],
  peaceful: ['forest', 'flowers', 'beach', 'ocean'],
  professional: ['architecture', 'minimal', 'city', 'abstract'],
  romantic: ['sunset', 'flowers', 'beach', 'nature'],
  dark: ['dark', 'night', 'abstract', 'rain'],
  nature: ['nature', 'forest', 'mountains', 'beach'],
};

const COLOR_MAPPING = {
  inspiring: { text: '#ffd700', overlay: '#1a0900', opacity: 0.45 },
  motivational: { text: '#ffffff', overlay: '#0f0c29', opacity: 0.55 },
  thoughtful: { text: '#b8b8b8', overlay: '#1a1a1a', opacity: 0.6 },
  melancholic: { text: '#a0d8d8', overlay: '#001a2e', opacity: 0.5 },
  energetic: { text: '#ffd700', overlay: '#0f0c29', opacity: 0.5 },
  peaceful: { text: '#c8e6c9', overlay: '#0a1a0a', opacity: 0.5 },
  professional: { text: '#e8e8e8', overlay: '#1a1a2e', opacity: 0.55 },
  romantic: { text: '#ffb6c1', overlay: '#2d1a2e', opacity: 0.45 },
  dark: { text: '#ffffff', overlay: '#000000', opacity: 0.7 },
  nature: { text: '#ffffff', overlay: '#0a3d62', opacity: 0.5 },
};

const FONT_MAPPING = {
  inspiring: 'serif',
  motivational: 'sans',
  thoughtful: 'serif',
  melancholic: 'serif',
  energetic: 'sans',
  peaceful: 'sans',
  professional: 'sans',
  romantic: 'script',
  dark: 'serif',
  nature: 'sans',
};

const LAYOUT_MAPPING = {
  inspiring: 'centered-large',
  motivational: 'classic',
  thoughtful: 'minimal',
  melancholic: 'minimal',
  energetic: 'bold',
  peaceful: 'centered-small',
  professional: 'classic',
  romantic: 'centered-large',
  dark: 'minimal',
  nature: 'classic',
};

export async function generateStyleRecommendations(quotes) {
  if (!API_KEY) {
    console.error('Claude API key not configured');
    return null;
  }

  try {
    const quoteTexts = quotes.map(q => q.quote).join('\n---\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Analyze these quotes and categorize them into ONE dominant sentiment/mood (choose one: inspiring, motivational, thoughtful, melancholic, energetic, peaceful, professional, romantic, dark, nature).

Quotes:
${quoteTexts}

Respond with ONLY this JSON (no markdown, no extra text):
{
  "sentiment": "one of: inspiring, motivational, thoughtful, melancholic, energetic, peaceful, professional, romantic, dark, nature",
  "reasoning": "one sentence why"
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.content[0].text.trim();
    const parsed = JSON.parse(responseText);

    const sentiment = parsed.sentiment.toLowerCase();
    const validSentiment = Object.keys(COLOR_MAPPING).includes(sentiment) ? sentiment : 'inspiring';

    return {
      sentiment: validSentiment,
      reasoning: parsed.reasoning,
      theme: THEME_MAPPING[validSentiment][0],
      fontStyle: FONT_MAPPING[validSentiment],
      layoutTemplate: LAYOUT_MAPPING[validSentiment],
      ...COLOR_MAPPING[validSentiment],
    };
  } catch (error) {
    console.error('Style recommendation error:', error);
    return null;
  }
}
