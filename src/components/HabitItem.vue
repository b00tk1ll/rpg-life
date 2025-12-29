<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  habit: Object,
  type: {
    type: String,
    default: 'positive' // 'positive' or 'negative'
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
    emit('long-press', props.habit)
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
    emit('click', props.habit)
  }
  clickBlocked.value = false
}

const isPositive = computed(() => props.type === 'positive')
</script>

<template>
  <div 
    class="flex items-center justify-between p-4 rounded-lg border transition-all active:scale-95 cursor-pointer select-none group relative"
    :class="isPositive 
      ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 hover:border-green-500' 
      : 'bg-slate-950 border-red-900/50 hover:bg-slate-900 hover:border-red-500'"
    @click="handleClick"
    @mousedown="startLongPress($event)"
    @mouseup="cancelLongPress"
    @mouseleave="cancelLongPress"
    @touchstart="startLongPress($event)"
    @touchmove="handleTouchMove"
    @touchend="cancelLongPress"
  >
    <span>{{ habit.text }}</span>
    
    <div class="flex items-center gap-2">

      
      <span class="font-bold" :class="isPositive ? 'text-green-400' : 'text-red-500'">
        {{ isPositive ? '+' : '-' }}{{ isPositive ? habit.xp : habit.penalty }} XP
      </span>
    </div>
  </div>
</template>
