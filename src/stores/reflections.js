import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useReflectionStore = defineStore('reflections', {
    state: () => ({
        reflections: useStorage('rpg-reflections', [])
    }),

    actions: {
        addReflection(text) {
            this.reflections.unshift({
                id: Date.now(),
                date: new Date().toLocaleDateString('pt-BR'),
                text
            })
        },

        updateReflection(id, text) {
            const reflection = this.reflections.find(r => r.id === id)
            if (reflection) {
                reflection.text = text
            }
        },

        deleteReflection(id) {
            this.reflections = this.reflections.filter(r => r.id !== id)
        }
    }
})
