export function formatDate(date, options = {}) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const divisions = [
    { amount: 31536000, name: 'year' },
    { amount: 2592000, name: 'month' },
    { amount: 86400, name: 'day' },
    { amount: 3600, name: 'hour' },
    { amount: 60, name: 'minute' },
  ];

  for (const division of divisions) {
    const count = Math.floor(seconds / division.amount);
    if (count >= 1) return `${count} ${division.name}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function readingTime(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
