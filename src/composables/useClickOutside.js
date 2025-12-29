import { onMounted, onUnmounted } from 'vue'

/**
 * Composable for detecting clicks outside specified elements
 * 
 * @param {Function} callback - Function to call when click outside is detected
 * @param {Object} options - Configuration options
 * @param {string} options.menuSelector - CSS selector for the menu element (default: '.dropdown-menu')
 * @param {string} options.triggerSelector - CSS selector for the trigger element (default: '.dropdown-trigger')
 * 
 * @example
 * // In your component:
 * import { useClickOutside } from '@/composables/useClickOutside'
 * 
 * const openMenuId = ref(null)
 * 
 * useClickOutside(() => {
 *   openMenuId.value = null
 * }, { menuSelector: '.dropdown-menu', triggerSelector: '.dropdown-trigger' })
 */
export function useClickOutside(callback, options = {}) {
    const {
        menuSelector = '.dropdown-menu',
        triggerSelector = '.dropdown-trigger'
    } = options

    const handleClickOutside = (event) => {
        const isOutsideMenu = !event.target.closest(menuSelector)
        const isOutsideTrigger = !event.target.closest(triggerSelector)

        if (isOutsideMenu && isOutsideTrigger) {
            callback(event)
        }
    }

    onMounted(() => {
        document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside)
    })

    return {
        handleClickOutside
    }
}
