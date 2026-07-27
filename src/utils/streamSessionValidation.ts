export const getStreamUrlError = (
  value: string,
): string | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return 'http または https のURLを入力してください。';
    }

    return null;
  } catch {
    return '正しい配信URLを入力してください。';
  }
};

export const normalizeHashtags = (value: string): string => {
  const normalizedTags = value
    .split(/[\s,、，]+/)
    .map((tag) => tag.replace(/^#+/, '').trim())
    .filter(Boolean)
    .map((tag) => `#${tag}`);

  return Array.from(new Set(normalizedTags)).join(' ');
};

export const hasScheduledTimePassed = (
  scheduledAt: string,
  currentTime = Date.now(),
): boolean => {
  if (!scheduledAt) {
    return false;
  }

  const scheduledTime = new Date(scheduledAt).getTime();

  if (Number.isNaN(scheduledTime)) {
    return false;
  }

  return scheduledTime <= currentTime;
};