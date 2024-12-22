const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

type ImageSize =
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'original';

export function getImageUrl(path: string | null, size: ImageSize = 'original'): string {
  if (!path) return '/placeholder-image.jpg';
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
}

export function formatRating(rating: number): string {
  if (!rating) return 'Not rated';
  return `${rating.toFixed(1)}/10`;
}

export function getColorForRating(rating: number): string {
  if (!rating) return 'text-gray-400 dark:text-gray-500';
  if (rating >= 8) return 'text-green-500 dark:text-green-400';
  if (rating >= 6) return 'text-yellow-500 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
}

export function formatCurrency(amount: number): string {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLanguage(iso: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(iso) || iso;
  } catch {
    return iso;
  }
}

export function formatCountry(iso: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso) || iso;
  } catch {
    return iso;
  }
} 