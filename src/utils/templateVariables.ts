import type { StreamSession } from '../types/streamSession';

export const TEMPLATE_VARIABLES = [
  'title',
  'date',
  'time',
  'url',
  'hashtags',
] as const;

export type TemplateVariable =
  (typeof TEMPLATE_VARIABLES)[number];

export const TEMPLATE_VARIABLE_LABELS: Record<
  TemplateVariable,
  string
> = {
  title: '配信タイトル',
  date: '配信日',
  time: '開始時刻',
  url: '配信URL',
  hashtags: 'ハッシュタグ',
};

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export const getTemplateVariableValues = (
  session: StreamSession,
): Record<TemplateVariable, string> => {
  const scheduledDate = new Date(session.scheduledAt);
  const hasValidScheduledDate =
    session.scheduledAt !== '' &&
    !Number.isNaN(scheduledDate.getTime());

  return {
    title: session.title.trim(),
    date: hasValidScheduledDate
      ? dateFormatter.format(scheduledDate)
      : '',
    time: hasValidScheduledDate
      ? timeFormatter.format(scheduledDate)
      : '',
    url: session.streamUrl.trim(),
    hashtags: session.hashtags.trim(),
  };
};

export const replaceTemplateVariables = (
  text: string,
  session: StreamSession,
): string => {
  const values = getTemplateVariableValues(session);

  return text.replace(
    /\{(title|date|time|url|hashtags)\}/g,
    (_match, variableName: string) =>
      values[variableName as TemplateVariable],
  );
};

export const getMissingTemplateVariables = (
  text: string,
  session: StreamSession,
): TemplateVariable[] => {
  const values = getTemplateVariableValues(session);

  return TEMPLATE_VARIABLES.filter(
    (variable) =>
      text.includes(`{${variable}}`) &&
      values[variable] === '',
  );
};

export const createStreamAnnouncement = (
  session: StreamSession,
): string => {
  const values = getTemplateVariableValues(session);
  const sections: string[] = [];

  if (session.status === 'live') {
    sections.push('配信を開始しました！');
  } else if (session.status === 'ended') {
    sections.push(
      '本日の配信は終了しました。\nありがとうございました！',
    );
  } else if (values.date && values.time) {
    sections.push(
      `${values.date} ${values.time}から配信します！`,
    );
  } else {
    sections.push('配信のお知らせです！');
  }

  if (values.title) {
    sections.push(`【${values.title}】`);
  }

  if (values.url) {
    sections.push(values.url);
  }

  if (values.hashtags) {
    sections.push(values.hashtags);
  }

  return sections.join('\n\n');
};