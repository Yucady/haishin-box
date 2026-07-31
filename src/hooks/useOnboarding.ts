import { useCallback, useState } from 'react'

import { STORAGE_KEYS } from '../constants/storageKeys'

function shouldShowOnboarding(): boolean {
    try {
        return (
        localStorage.getItem(
            STORAGE_KEYS.onboardingCompleted,
        ) !== 'true'
        )
    } catch (error) {
        console.error(
        '初回案内の状態を読み込めませんでした。',
        error,
        )

        return true
    }
}

export function useOnboarding() {
    const [isOnboardingOpen, setIsOnboardingOpen] =
        useState(shouldShowOnboarding)

    const completeOnboarding = useCallback(() => {
        try {
        localStorage.setItem(
            STORAGE_KEYS.onboardingCompleted,
            'true',
        )
        } catch (error) {
        console.error(
            '初回案内の状態を保存できませんでした。',
            error,
        )
        }

        setIsOnboardingOpen(false)
    }, [])

    const openOnboarding = useCallback(() => {
        setIsOnboardingOpen(true)
    }, [])

    return {
        isOnboardingOpen,
        completeOnboarding,
        openOnboarding,
    }
}