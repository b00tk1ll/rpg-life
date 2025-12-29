<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirmar'
  },
  message: {
    type: String,
    default: 'Tem certeza que deseja realizar esta ação?'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  type: {
    type: String,
    default: 'danger', // 'danger' | 'warning' | 'info'
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  }
})

defineEmits(['confirm', 'cancel'])

const getBorderColor = (type) => {
  switch (type) {
    case 'danger': return 'border-red-500'
    case 'warning': return 'border-yellow-500'
    case 'info': return 'border-blue-500'
    default: return 'border-slate-500'
  }
}

const getConfirmButtonClass = (type) => {
  switch (type) {
    case 'danger': return 'bg-red-600 hover:bg-red-500'
    case 'warning': return 'bg-yellow-600 hover:bg-yellow-500'
    case 'info': return 'bg-blue-600 hover:bg-blue-500'
    default: return 'bg-slate-600 hover:bg-slate-500'
  }
}
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="title" 
    :border-color="getBorderColor(type)"
    @close="$emit('cancel')"
  >
    <p class="text-slate-300 text-sm mb-6">{{ message }}</p>
    
    <div class="flex gap-3">
      <button 
        @click="$emit('cancel')"
        class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded transition-colors"
      >
        {{ cancelText }}
      </button>
      <button 
        @click="$emit('confirm')"
        class="flex-1 text-white font-bold py-3 rounded transition-colors"
        :class="getConfirmButtonClass(type)"
      >
        {{ confirmText }}
      </button>
    </div>
  </BaseModal>
</template>
