<script setup>
import { ref } from 'vue'

const props = defineProps({
  mission: {
    type: Object,
    required: true,
    validator: (m) => m && typeof m.id !== 'undefined' && typeof m.text === 'string'
  },
  rewardColor: {
    type: String,
    default: 'text-yellow-500'
  }
})

const emit = defineEmits(['click', 'long-press'])

// Long press logic
const longPressTimer = ref(null)
const touchStartPos = ref({ x: 0, y: 0 })
const clickBlocked = ref(false)

const startLongPress = (event) => {
  clickBlocked.value = false
  
  if (event.touches && event.touches[0]) {
    touchStartPos.value = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    }
  }
  
  longPressTimer.value = setTimeout(() => {
    clickBlocked.value = true
    emit('long-press', props.mission)
  }, 600)
}

const handleTouchMove = (event) => {
  if (event.touches && event.touches[0] && longPressTimer.value) {
    const moveX = Math.abs(event.touches[0].clientX - touchStartPos.value.x)
    const moveY = Math.abs(event.touches[0].clientY - touchStartPos.value.y)
    
    if (moveX > 10 || moveY > 10) {
      cancelLongPress()
    }
  }
}

const cancelLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const handleClick = () => {
  if (!clickBlocked.value) {
    emit('click', props.mission)
  }
  clickBlocked.value = false
}
</script>

<template>
  <div 
    class="flex items-center justify-between gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer select-none group relative"
    :class="{ 'opacity-50 grayscale': mission.completed }"
    @click="handleClick"
    @mousedown="startLongPress($event)"
    @mouseup="cancelLongPress"
    @mouseleave="cancelLongPress"
    @touchstart="startLongPress($event)"
    @touchmove="handleTouchMove"
    @touchend="cancelLongPress"
  >
    <span :class="{ 'line-through text-slate-500': mission.completed }">{{ mission.text }}</span>
    
    <div class="flex items-center gap-2">

      <span v-if="mission.completed" class="text-green-400 font-bold">✓</span>
      <span v-else class="font-mono text-sm whitespace-nowrap" :class="rewardColor">{{ mission.reward }} 🪙</span>
    </div>
  </div>
</template>
