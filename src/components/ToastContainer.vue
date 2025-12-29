<script setup>
import { useToastStore } from '../stores/toast'
import { storeToRefs } from 'pinia'

const toastStore = useToastStore()
const { notifications } = storeToRefs(toastStore)
</script>

<template>
  <div class="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in notifications" 
        :key="toast.id"
        class="pointer-events-auto px-6 py-3 rounded-lg shadow-lg text-white font-bold text-center"
        :class="{
          'bg-green-600': toast.type === 'success',
          'bg-red-600': toast.type === 'error',
          'bg-blue-600': toast.type === 'info',
          'bg-yellow-600': toast.type === 'warning'
        }"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
