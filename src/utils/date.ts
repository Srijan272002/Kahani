export function formatDate(dateString: string): string {
  if (!dateString) return 'Release date unknown';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function getYearFromDate(dateString: string): string {
  if (!dateString) return 'Year unknown';
  
  const date = new Date(dateString);
  return date.getFullYear().toString();
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return 'Runtime unknown';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${minutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
} 