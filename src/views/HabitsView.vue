<script setup>
import { useHabitStore } from '../stores/habits'
import { useGameStore } from '../stores/game'
import TutorialOverlay from '../components/TutorialOverlay.vue'
import { computed, ref, onMounted } from 'vue'

const habitStore = useHabitStore()
const gameStore = useGameStore()

// Tutorial state
const showTutorial = ref(false)

onMounted(() => {
  if (!gameStore.onboarding.visitedViews.habits && 
      !gameStore.onboarding.skippedTutorials &&
      gameStore.onboarding.completed) {
    setTimeout(() => {
      showTutorial.value = true
    }, 300)
  }
})

const closeTutorial = () => {
  gameStore.markViewVisited('habits')
  showTutorial.value = false
}

const skipAllTutorials = () => {
  gameStore.skipAllTutorials()
  showTutorial.value = false
}

const positiveHabits = computed(() => habitStore.habits.filter(h => h.type === 'positive'))
const negativeHabits = computed(() => habitStore.habits.filter(h => h.type === 'negative'))

// Long press delete state
const longPressTimer = ref(null)
const showDeleteModal = ref(false)
const habitToDelete = ref(null)
const clickBlocked = ref(false)
const touchStartPos = ref({ x: 0, y: 0 })

// Add habit modal state
const showAddModal = ref(false)
const selectedType = ref('positive')
const newHabitText = ref('')
const newHabitXp = ref(10)

const openAddModal = (type) => {
  selectedType.value = type
  newHabitText.value = ''
  newHabitXp.value = 10
  showAddModal.value = true
}

const addHabit = () => {
  if (!newHabitText.value.trim()) return
  habitStore.addHabit(newHabitText.value, selectedType.value, parseInt(newHabitXp.value))
  showAddModal.value = false
}

// Long press functionality
const startLongPress = (habitId, event) => {
  clickBlocked.value = false
  
  // Salvar posição inicial do toque
  if (event.touches && event.touches[0]) {
    touchStartPos.value = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    }
  }
  
  longPressTimer.value = setTimeout(() => {
    clickBlocked.value = true
    habitToDelete.value = habitId
    showDeleteModal.value = true
  }, 600)
}

const handleTouchMove = (event) => {
  // Se o dedo se moveu, é scroll - cancela o long press
  if (event.touches && event.touches[0] && longPressTimer.value) {
    const moveX = Math.abs(event.touches[0].clientX - touchStartPos.value.x)
    const moveY = Math.abs(event.touches[0].clientY - touchStartPos.value.y)
    
    // Se moveu mais de 10px, é scroll
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

const handleHabitClick = (habitId) => {
  if (!clickBlocked.value) {
    habitStore.triggerHabit(habitId)
  }
  clickBlocked.value = false
}

const confirmDelete = () => {
  if (habitToDelete.value) {
    habitStore.removeHabit(habitToDelete.value)
  }
  showDeleteModal.value = false
  habitToDelete.value = null
}

const cancelDelete = () => {
  showDeleteModal.value = false
  habitToDelete.value = null
}
</script>

<template>
  <div class="space-y-6 pb-20">
    <!-- Positive Habits -->
    <section class="bg-slate-800 rounded-xl p-4 border border-blue-900 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-green-400">✨ Hábitos Positivos</h2>
        <button @click="openAddModal('positive')" class="bg-green-600 hover:bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">+</button>
      </div>
      <div class="grid grid-cols-1 gap-3">
        <button 
          v-for="habit in positiveHabits"
          :key="habit.id"
          class="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700 hover:bg-slate-800 hover:border-green-500 transition-all active:scale-95 cursor-pointer select-none"
          @click="handleHabitClick(habit.id)"
          @mousedown="startLongPress(habit.id, $event)"
          @mouseup="cancelLongPress"
          @mouseleave="cancelLongPress"
          @touchstart="startLongPress(habit.id, $event)"
          @touchmove="handleTouchMove"
          @touchend="cancelLongPress"
        >
          <span>{{ habit.text }}</span>
          <span class="text-green-400 font-bold">+{{ habit.xp }} XP</span>
        </button>
      </div>
    </section>

    <!-- Negative Habits -->
    <section class="bg-slate-800 rounded-xl p-4 border border-red-900 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-red-400">💀 Hábitos Negativos</h2>
        <button @click="openAddModal('negative')" class="bg-red-600 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">+</button>
      </div>
      <div class="grid grid-cols-1 gap-3">
        <button 
          v-for="habit in negativeHabits"
          :key="habit.id"
          class="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-red-900/50 hover:bg-slate-900 hover:border-red-500 transition-all active:scale-95 cursor-pointer select-none"
          @click="handleHabitClick(habit.id)"
          @mousedown="startLongPress(habit.id, $event)"
          @mouseup="cancelLongPress"
          @mouseleave="cancelLongPress"
          @touchstart="startLongPress(habit.id, $event)"
          @touchmove="handleTouchMove"
          @touchend="cancelLongPress"
        >
          <span>{{ habit.text }}</span>
          <span class="text-red-500 font-bold">-{{ habit.penalty }} XP</span>
        </button>
      </div>
      <p class="text-xs text-red-300 mt-2 text-center opacity-70">
        ⚠️ Penalidade é o dobro do ganho! Cuidado.
      </p>
    </section>

    <!-- Tutorial Overlay -->
    <TutorialOverlay 
      v-if="showTutorial"
      title="❤️ Hábitos"
      icon="❤️"
      :content="[
        'Bem-vindo à seção de Hábitos! Aqui você rastreia comportamentos diários que formam a base do seu crescimento.',
        'Hábitos positivos concedem XP quando completados. Hábitos negativos causam penalidade (o dobro do valor) se você ceder a eles.'
      ]"
      :tips="[
        'Marque hábitos todos os dias para criar sequências (streaks)',
        'Quanto maior a consistência, maior o progresso!',
        'Comece com 2-3 hábitos e adicione mais gradualmente',
        'Hábitos negativos têm penalidade dobrada - use com cuidado',
        'Pressione e segure um hábito para deletá-lo'
      ]"
      @close="closeTutorial"
      @skip-all="skipAllTutorials"
    />

    <!-- Add Habit Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div class="bg-slate-800 p-6 rounded-lg max-w-sm w-full border shadow-2xl relative"
           :class="selectedType === 'positive' ? 'border-green-500' : 'border-red-500'">
        <button @click="showAddModal = false" class="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>
        
        <h2 class="text-xl font-bold mb-4"
            :class="selectedType === 'positive' ? 'text-green-400' : 'text-red-400'">
          {{ selectedType === 'positive' ? '✨ Novo Hábito Positivo' : '💀 Novo Hábito Negativo' }}
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Nome do Hábito</label>
            <input 
              v-model="newHabitText" 
              type="text" 
              placeholder="Ex: Beber água" 
              class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-indigo-500 outline-none"
              @keyup.enter="addHabit"
              autofocus
            >
          </div>
          
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Valor de XP</label>
            <input 
              v-model.number="newHabitXp" 
              type="number" 
              min="1"
              class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-indigo-500 outline-none"
            >
          </div>
          
          <button 
            @click="addHabit"
            :disabled="!newHabitText.trim()"
            class="w-full font-bold py-3 rounded disabled:bg-slate-600 transition-colors"
            :class="selectedType === 'positive' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'"
          >
            Adicionar Hábito
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div class="bg-slate-800 p-6 rounded-2xl max-w-sm w-full border border-red-500/50 shadow-2xl animate-fade-in">
        <h2 class="text-xl font-bold text-red-400 mb-2">🗑️ Deletar Hábito?</h2>
        <p class="text-slate-300 text-sm mb-6">Tem certeza que deseja deletar este hábito? Esta ação não pode ser desfeita.</p>
        
        <div class="flex gap-3">
          <button 
            @click="cancelDelete"
            class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="confirmDelete"
            class="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded transition-colors"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


