export const STORAGE_KEYS = {
  checklist: 'haishin-box-checklist',
  textTemplates: 'haishin-box-templates',
  xPostDraft: 'haishin-box-x-post-draft',
  streamSession: 'haishin-box-stream-session',
  streamPresets: 'haishin-box-stream-presets',
  onboardingCompleted: 'haishin-box-onboarding-completed',
  quickLinks: 'haishin-box-quick-links',
  memo: 'haishin-box-memo',
  memoHeight: 'haishin-box-memo-height',
} as const

export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS)