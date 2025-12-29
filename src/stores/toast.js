import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const notifications = ref([])

    const show = (message, type = 'success', duration = 3000) => {
        const id = Date.now()
        notifications.value.push({ id, message, type })
        setTimeout(() => {
            remove(id)
        }, duration)
    }

    const remove = (id) => {
        notifications.value = notifications.value.filter(n => n.id !== id)
    }

    return {
        notifications,
        show,
        remove
    }
})
