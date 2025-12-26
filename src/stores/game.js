import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { generateAvatar } from '../utils/avatar'

export const useGameStore = defineStore('game', {
    state: () => {
        const user = useStorage('rpg-user', {
            name: 'Player',
            avatar: generateAvatar('Player'),
            xp: 0,
            level: 1,
            coins: 0,
            xpToNextLevel: 100
        })

        // Migration: Force update to new Minidenticons style
        // We check if it's the old 'ui-avatars' OR if it's our previous simple generated SVG (starts with data:image/svg+xml;base64)
        // Minidenticons uses utf8 encoding in our new utility, so we can detect the change.
        if (
            !user.value.avatar ||
            user.value.avatar.includes('ui-avatars.com') ||
            user.value.avatar.includes('base64')
        ) {
            user.value.avatar = generateAvatar(user.value.name)
        }

        return {
            user,
            history: useStorage('rpg-history', []),
            onboarding: useStorage('rpg-onboarding', {
                completed: false,
                visitedViews: {
                    missions: false,
                    habits: false,
                    reflection: false,
                    shop: false
                },
                skippedTutorials: false
            })
        }
    },

    actions: {
        addXp(amount) {
            this.user.xp += amount
            this.checkLevelUp()
            this.logHistory(amount, 'xp_gain')
        },

        removeXp(amount) {
            if (this.user.xp - amount < 0) this.user.xp = 0
            else this.user.xp -= amount
            this.logHistory(-amount, 'xp_loss')
        },

        addCoins(amount) {
            this.user.coins += amount
            this.logHistory(amount, 'coin_gain')
        },

        removeCoins(amount) {
            if (this.user.coins >= amount) {
                this.user.coins -= amount
                this.logHistory(-amount, 'coin_spend')
                return true
            }
            return false
        },

        checkLevelUp() {
            // Simple leveling formula: Level = 1 + floor(0.1 * sqrt(XP))
            // Or explicit thresholds. Let's use specific thresholds for now.
            const threshold = 100 * Math.pow(this.user.level, 1.5)

            if (this.user.xp >= threshold) {
                this.user.level++
                // Play sound or notification logic here later
            }
        },

        updateName(newName) {
            if (!newName) return
            this.user.name = newName
            this.user.avatar = generateAvatar(newName)
        },

        logHistory(value, type) {
            const today = new Date().toISOString().split('T')[0]
            this.history.push({
                date: today,
                value,
                type,
                timestamp: Date.now()
            })
        },

        completeOnboarding() {
            this.onboarding.completed = true
        },

        markViewVisited(viewName) {
            this.onboarding.visitedViews[viewName] = true
        },

        skipAllTutorials() {
            this.onboarding.skippedTutorials = true
            // Mark all views as visited
            Object.keys(this.onboarding.visitedViews).forEach(key => {
                this.onboarding.visitedViews[key] = true
            })
        }
    },

    getters: {
        levelProgress: (state) => {
            const threshold = 100 * Math.pow(state.user.level, 1.5)
            const prevThreshold = 100 * Math.pow(state.user.level - 1, 1.5)
            // Calculate percentage within current level
            // This is a simplified view; for level 1, prev is 0.
            return (state.user.xp / threshold) * 100
        },

        totalXpEarned: (state) => {
            const gained = state.history
                .filter(entry => entry.type === 'xp_gain')
                .reduce((total, entry) => total + entry.value, 0)
            const lost = state.history
                .filter(entry => entry.type === 'xp_loss')
                .reduce((total, entry) => total + Math.abs(entry.value), 0)
            return gained - lost
        },

        totalCoinsEarned: (state) => {
            const gained = state.history
                .filter(entry => entry.type === 'coin_gain')
                .reduce((total, entry) => total + entry.value, 0)
            const spent = state.history
                .filter(entry => entry.type === 'coin_spend')
                .reduce((total, entry) => total + Math.abs(entry.value), 0)
            return gained - spent
        }
    }
})
