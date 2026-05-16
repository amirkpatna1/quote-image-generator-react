export const PLATFORM_PACKS = [
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Feed, stories, carousel, and reel cover.',
    videoLabel: 'Instagram Reel',
    videoSize: '1080x1920',
    exports: [
      { id: 'feed', label: 'Feed Posts', folder: 'feed-posts', size: '1080x1350', mode: 'quotes' },
      { id: 'stories', label: 'Stories', folder: 'stories', size: '1080x1920', mode: 'quotes' },
      { id: 'carousel', label: 'Carousel', folder: 'carousel', size: '1080', mode: 'carousel' },
      { id: 'reel-cover', label: 'Reel Cover', folder: 'reel-cover', size: '1080x1920', mode: 'carousel-cover' },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Feed visuals, stories, carousel, and reel cover.',
    videoLabel: 'Facebook Reel',
    videoSize: '1080x1920',
    exports: [
      { id: 'feed', label: 'Feed Posts', folder: 'feed-posts', size: '1200x630', mode: 'quotes' },
      { id: 'stories', label: 'Stories', folder: 'stories', size: '1080x1920', mode: 'quotes' },
      { id: 'carousel', label: 'Carousel', folder: 'carousel', size: '1080', mode: 'carousel' },
      { id: 'reel-cover', label: 'Reel Cover', folder: 'reel-cover', size: '1080x1920', mode: 'carousel-cover' },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Thumbnails, community posts, and Shorts cover.',
    videoLabel: 'YouTube Short',
    videoSize: '1080x1920',
    exports: [
      { id: 'thumbnail', label: 'Thumbnails', folder: 'thumbnails', size: '1280x720', mode: 'quotes' },
      { id: 'community', label: 'Community Posts', folder: 'community-posts', size: '1080', mode: 'quotes' },
      { id: 'shorts-cover', label: 'Shorts Cover', folder: 'shorts-cover', size: '1080x1920', mode: 'carousel-cover' },
    ],
  },
];

export const DEFAULT_CAROUSEL_OPTIONS = {
  title: '',
  subtitle: '',
  cta: 'Follow for more',
  ctaSubtitle: 'Save this and share it with someone who needs it.',
  limit: 5,
};

export function slugify(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'asset';
}

export function getPlatformPack(platformId) {
  return PLATFORM_PACKS.find((platform) => platform.id === platformId);
}

export function buildCarouselSlides(quotes, options = {}) {
  const selectedQuotes = quotes.slice(0, Math.max(1, Math.min(options.limit || quotes.length, quotes.length)));
  const totalSlides = selectedQuotes.length;
  const baseTheme = selectedQuotes[0]?.theme || options.theme || 'nature';
  const title = options.title?.trim() || `Save these ${totalSlides} quotes`;
  const subtitle = options.subtitle?.trim() || `${totalSlides} swipe-worthy slides for your audience`;
  const cta = options.cta?.trim() || DEFAULT_CAROUSEL_OPTIONS.cta;
  const ctaSubtitle = options.ctaSubtitle?.trim() || DEFAULT_CAROUSEL_OPTIONS.ctaSubtitle;

  const coverSlide = {
    slide_role: 'cover',
    quote: title,
    author: subtitle,
    theme: baseTheme,
    source: 'Swipe through',
    attribution_status: 'original',
    backgroundIndex: 0,
    layoutTemplate: 'spotlight',
    textAlign: 'center',
  };

  const quoteSlides = selectedQuotes.map((quote, index) => ({
    ...quote,
    slide_role: 'quote',
    source: quote.source || `Slide ${index + 1} of ${totalSlides}`,
    backgroundIndex: index,
  }));

  const ctaSlide = {
    slide_role: 'cta',
    quote: cta,
    author: ctaSubtitle,
    theme: selectedQuotes.at(-1)?.theme || baseTheme,
    source: 'Save and share',
    attribution_status: 'original',
    backgroundIndex: Math.max(selectedQuotes.length - 1, 0),
    layoutTemplate: 'frame',
    textAlign: 'center',
  };

  return [coverSlide, ...quoteSlides, ctaSlide];
}
