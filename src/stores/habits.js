import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { useGameStore } from './game'

export const useHabitStore = defineStore('habits', {
    state: () => ({
        habits: useStorage('rpg-habits', [
            { id: 1, text: 'Beber Água (2L)', type: 'positive', xp: 10, penalty: 0 },
            { id: 2, text: 'Ler 10 min', type: 'positive', xp: 15, penalty: 0 },
            { id: 3, text: 'Comer Fast Food', type: 'negative', xp: 0, penalty: 20 }, // Lose 20 XP
        ])
    }),

    actions: {
        triggerHabit(habitId) {
            const gameStore = useGameStore()
            const habit = this.habits.find(h => h.id === habitId)

            if (!habit) return

            if (habit.type === 'positive') {
                gameStore.addXp(habit.xp)
                // Check for bonus if needed
            } else if (habit.type === 'negative') {
                // Penalty is double the gain roughly, defined in local property
                gameStore.removeXp(habit.penalty)
            }
        },

        addHabit(text, type, value) {
            this.habits.push({
                id: Date.now(),
                text,
                type,
                xp: type === 'positive' ? value : 0,
                penalty: type === 'negative' ? value * 2 : 0
            })
        },

        removeHabit(id) {
            this.habits = this.habits.filter(h => h.id !== id)
        }
    }
})
