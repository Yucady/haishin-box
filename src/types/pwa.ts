export type PwaInstallOutcome =
  | 'accepted'
  | 'dismissed'

export type BeforeInstallPromptEvent =
  Event & {
    prompt: () => Promise<{
      outcome: PwaInstallOutcome
      platform: string
    }>
  }