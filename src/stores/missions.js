import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { useGameStore } from './game'
import { MISSION_REWARDS } from '../utils/constants'

export const useMissionStore = defineStore('missions', {
    state: () => ({
        // Daily missions should persist but reset daily.
        // referencing the last reset date.
        lastReset: useStorage('rpg-last-reset', new Date().toISOString().split('T')[0]),
        dailies: useStorage('rpg-dailies', {
            main: [
                {
                    id: 1,
                    text: 'Completar tarefa principal do dia',
                    reward: 25,
                    completed: false
                }
            ],
            secondary: [
                {
                    id: 2,
                    text: 'Fazer 30 minutos de exercício',
                    reward: 15,
                    completed: false
                }
            ],
            bonus: [
                {
                    id: 3,
                    text: 'Ler 10 páginas de um livro',
                    reward: 10,
                    completed: false
                }
            ]
        })
    }),

    actions: {
        checkDailyReset() {
            const today = new Date().toISOString().split('T')[0]
            if (this.lastReset !== today) {
                this.resetDailies()
                this.lastReset = today
            }
        },

        resetDailies() {
            // Logic to reset completion status of dailies
            // Ideally we have a template for dailies and we copy it.
            // For now let's assume we iterate and uncheck.
            ['main', 'secondary', 'bonus'].forEach(cat => {
                this.dailies[cat].forEach(task => task.completed = false)
            })
        },

        toggleMission(category, id) {
            const gameStore = useGameStore()
            const task = this.dailies[category].find(t => t.id === id)

            if (!task) return

            if (!task.completed) {
                // Complete the mission
                task.completed = true
                gameStore.addCoins(task.reward)
            } else {
                // Undo - remove coins (if possible)
                task.completed = false
                gameStore.removeCoins(task.reward)
            }
        },

        addMission(category, text, reward) {
            this.dailies[category].push({
                id: Date.now(),
                text,
                reward, // 25, 15, or 10
                completed: false
            })
        },

        updateMission(category, id, newText) {
            const task = this.dailies[category].find(t => t.id === id)
            if (task) {
                task.text = newText
            }
        },

        deleteMission(category, id) {
            const index = this.dailies[category].findIndex(t => t.id === id)
            if (index !== -1) {
                this.dailies[category].splice(index, 1)
            }
        }
    }
})
