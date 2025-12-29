<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  title: String,
  borderColor: {
    type: String,
    default: 'border-blue-500'
  },
  titleColor: {
    type: String,
    default: '' // If empty, will be derived from borderColor
  },
  maxWidth: {
    type: String,
    default: 'max-w-sm'
  }
})

defineEmits(['close'])

// Compute title color - use explicit prop or derive from border color
const computedTitleColor = computed(() => {
  if (props.titleColor) return props.titleColor
  // Fallback: derive from border color (for backwards compatibility)
  return props.borderColor.replace('border-', 'text-').replace('/50', '')
})
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" 
    @click.self="$emit('close')"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="title ? 'modal-title' : undefined"
  >
    <div 
      class="bg-slate-800 p-6 rounded-lg w-full shadow-2xl relative border animate-fade-in"
      :class="[borderColor, maxWidth]"
    >
      <button 
        @click="$emit('close')" 
        class="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
        aria-label="Fechar modal"
      >✕</button>
      
      <h2 
        v-if="title" 
        id="modal-title"
        class="text-xl font-bold mb-4" 
        :class="computedTitleColor"
      >
        {{ title }}
      </h2>
      
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
