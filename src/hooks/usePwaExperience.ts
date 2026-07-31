import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import type {
  BeforeInstallPromptEvent,
  PwaInstallOutcome,
} from '../types/pwa'

export type InstallAppResult =
  | PwaInstallOutcome
  | 'unavailable'
  | 'error'

function isStandaloneMode(): boolean {
  const navigatorWithStandalone =
    navigator as Navigator & {
      standalone?: boolean
    }

  return (
    window.matchMedia(
      '(display-mode: standalone)',
    ).matches ||
    navigatorWithStandalone.standalone === true
  )
}

function getBuildIdFromHtml(
  html: string,
): string | null {
  const parsedDocument =
    new DOMParser().parseFromString(
      html,
      'text/html',
    )

  return (
    parsedDocument
      .querySelector(
        'meta[name="app-build-id"]',
      )
      ?.getAttribute('content') ?? null
  )
}

function usePwaExperience() {
  const [isOnline, setIsOnline] = useState(
    () => navigator.onLine,
  )

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(
      null,
    )

  const [isInstalled, setIsInstalled] =
    useState(isStandaloneMode)

  const [
    isUpdateAvailable,
    setIsUpdateAvailable,
  ] = useState(false)

  useEffect(() => {
    const displayModeQuery = window.matchMedia(
      '(display-mode: standalone)',
    )

    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    function handleBeforeInstallPrompt(
      event: Event,
    ) {
      event.preventDefault()

      setInstallPrompt(
        event as BeforeInstallPromptEvent,
      )
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    function handleDisplayModeChange(
      event: MediaQueryListEvent,
    ) {
      setIsInstalled(event.matches)

      if (event.matches) {
        setInstallPrompt(null)
      }
    }

    window.addEventListener('online', handleOnline)

    window.addEventListener(
      'offline',
      handleOffline,
    )

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt,
    )

    window.addEventListener(
      'appinstalled',
      handleAppInstalled,
    )

    displayModeQuery.addEventListener(
      'change',
      handleDisplayModeChange,
    )

    return () => {
      window.removeEventListener(
        'online',
        handleOnline,
      )

      window.removeEventListener(
        'offline',
        handleOffline,
      )

      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )

      window.removeEventListener(
        'appinstalled',
        handleAppInstalled,
      )

      displayModeQuery.removeEventListener(
        'change',
        handleDisplayModeChange,
      )
    }
  }, [])

  useEffect(() => {
    if (
      !import.meta.env.PROD ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    let registration:
      | ServiceWorkerRegistration
      | null = null

    let updateIntervalId:
      | number
      | undefined

    async function checkForAppUpdate() {
      if (!navigator.onLine) {
        return
      }

      const updateCheckUrl =
        `${import.meta.env.BASE_URL}index.html` +
        `?pwa-update-check=${Date.now()}`

      try {
        const response = await fetch(
          updateCheckUrl,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          return
        }

        const latestHtml = await response.text()

        const latestBuildId =
          getBuildIdFromHtml(latestHtml)

        if (
          latestBuildId !== null &&
          latestBuildId !== __BUILD_ID__
        ) {
          setIsUpdateAvailable(true)
        }
      } catch (error) {
        if (navigator.onLine) {
          console.error(
            'アプリの更新を確認できませんでした。',
            error,
          )
        }
      }
    }

    function checkServiceWorkerUpdate() {
      registration?.update().catch((error) => {
        console.error(
          'Service Workerの更新を確認できませんでした。',
          error,
        )
      })
    }

    function checkForUpdates() {
      void checkForAppUpdate()
      checkServiceWorkerUpdate()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        checkForUpdates()
      }
    }

    async function registerServiceWorker() {
      const serviceWorkerUrl =
        `${import.meta.env.BASE_URL}sw.js?v=${encodeURIComponent(
          __BUILD_ID__,
        )}`

      try {
        registration =
          await navigator.serviceWorker.register(
            serviceWorkerUrl,
            {
              updateViaCache: 'none',
            },
          )

        console.log(
          'Service Workerが登録されました。',
          registration.scope,
        )

        await checkForAppUpdate()

        updateIntervalId = window.setInterval(
          checkForUpdates,
          60 * 60 * 1000,
        )
      } catch (error) {
        console.error(
          'Service Workerの登録に失敗しました。',
          error,
        )
      }
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    )

    void registerServiceWorker()

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )

      if (updateIntervalId !== undefined) {
        window.clearInterval(updateIntervalId)
      }
    }
  }, [])

  const installApp = useCallback(
    async (): Promise<InstallAppResult> => {
      if (installPrompt === null) {
        return 'unavailable'
      }

      try {
        const result =
          await installPrompt.prompt()

        setInstallPrompt(null)

        return result.outcome
      } catch (error) {
        console.error(
          'アプリをインストールできませんでした。',
          error,
        )

        setInstallPrompt(null)

        return 'error'
      }
    },
    [installPrompt],
  )

  const reloadForUpdate = useCallback(() => {
    window.location.reload()
  }, [])

  return {
    isOnline,
    isInstalled,
    canInstall:
      installPrompt !== null && !isInstalled,
    isUpdateAvailable,
    installApp,
    reloadForUpdate,
  }
}

export default usePwaExperience