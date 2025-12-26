<script setup>
import { useMissionStore } from '../stores/missions'
import { useGameStore } from '../stores/game'
import TwoMinuteRule from '../components/TwoMinuteRule.vue'
import TutorialOverlay from '../components/TutorialOverlay.vue'
import { computed, ref, onMounted } from 'vue'

const missionStore = useMissionStore()
const gameStore = useGameStore()

// Tutorial state
const showTutorial = ref(false)

onMounted(() => {
  if (!gameStore.onboarding.visitedViews.missions && 
      !gameStore.onboarding.skippedTutorials &&
      gameStore.onboarding.completed) {
    setTimeout(() => {
      showTutorial.value = true
    }, 300)
  }
})

const closeTutorial = () => {
  gameStore.markViewVisited('missions')
  showTutorial.value = false
}

const skipAllTutorials = () => {
  gameStore.skipAllTutorials()
  showTutorial.value = false
}

// Groups
const mainMissions = computed(() => missionStore.dailies.main)
const secondaryMissions = computed(() => missionStore.dailies.secondary)
const bonusMissions = computed(() => missionStore.dailies.bonus)

// Modal state
const showAddModal = ref(false)
const newMissionText = ref('')
const selectedCategory = ref('main')

// Long press delete state
const longPressTimer = ref(null)
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const clickBlocked = ref(false)
const touchStartPos = ref({ x: 0, y: 0 })

const categoryLabels = {
  main: { name: 'Principal', reward: 25, color: 'yellow' },
  secondary: { name: 'Secundária', reward: 15, color: 'blue' },
  bonus: { name: 'Bónus', reward: 10, color: 'green' }
}

const openAddModal = (category) => {
  selectedCategory.value = category
  showAddModal.value = true
}

const addMission = () => {
  if (!newMissionText.value.trim()) return
  missionStore.addMission(selectedCategory.value, newMissionText.value, categoryLabels[selectedCategory.value].reward)
  newMissionText.value = ''
  showAddModal.value = false
}

// Long press functionality
const startLongPress = (category, id, event) => {
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
    itemToDelete.value = { category, id }
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

const handleClick = (category, id) => {
  if (!clickBlocked.value) {
    missionStore.toggleMission(category, id)
  }
  clickBlocked.value = false
}

const confirmDelete = () => {
  if (itemToDelete.value) {
    missionStore.deleteMission(itemToDelete.value.category, itemToDelete.value.id)
  }
  showDeleteModal.value = false
  itemToDelete.value = null
}

const cancelDelete = () => {
  showDeleteModal.value = false
  itemToDelete.value = null
}
</script>

<template>
  <div class="space-y-6 pb-20">
    <!-- Main Missions -->
    <section class="bg-slate-800 rounded-xl p-4 border border-blue-900 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-yellow-400">🔥 Missões Principais</h2>
        <button @click="openAddModal('main')" class="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">+</button>
      </div>
      <div v-if="mainMissions.length === 0" class="text-slate-500 text-sm italic">Nenhuma missão principal ativa.</div>
      <div class="space-y-2">
        <div 
          v-for="mission in mainMissions" 
          :key="mission.id"
          class="flex items-center justify-between gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer select-none"
          :class="{ 'opacity-50 grayscale': mission.completed }"
          @click="handleClick('main', mission.id)"
          @mousedown="startLongPress('main', mission.id, $event)"
          @mouseup="cancelLongPress"
          @mouseleave="cancelLongPress"
          @touchstart="startLongPress('main', mission.id, $event)"
          @touchmove="handleTouchMove"
          @touchend="cancelLongPress"
        >
          <span :class="{ 'line-through text-slate-500': mission.completed }">{{ mission.text }}</span>
          <div class="flex items-center gap-2">
            <span v-if="mission.completed" class="text-green-400 font-bold">✓</span>
            <span v-else class="text-yellow-500 font-mono text-sm">25 🪙</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Secondary Missions -->
    <section class="bg-slate-800 rounded-xl p-4 border border-blue-900 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-blue-300">🛡️ Missões Secundárias</h2>
        <button @click="openAddModal('secondary')" class="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">+</button>
      </div>
      <div v-if="secondaryMissions.length === 0" class="text-slate-500 text-sm italic">Nenhuma missão secundária.</div>
      <div class="space-y-2">
        <div 
          v-for="mission in secondaryMissions" 
          :key="mission.id"
          class="flex items-center justify-between gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer select-none"
          :class="{ 'opacity-50 grayscale': mission.completed }"
          @click="handleClick('secondary', mission.id)"
          @mousedown="startLongPress('secondary', mission.id, $event)"
          @mouseup="cancelLongPress"
          @mouseleave="cancelLongPress"
          @touchstart="startLongPress('secondary', mission.id, $event)"
          @touchmove="handleTouchMove"
          @touchend="cancelLongPress"
        >
          <span :class="{ 'line-through text-slate-500': mission.completed }">{{ mission.text }}</span>
          <div class="flex items-center gap-2">
            <span v-if="mission.completed" class="text-green-400 font-bold">✓</span>
            <span v-else class="text-yellow-500 font-mono text-sm">15 🪙</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Bonus Missions -->
    <section class="bg-slate-800 rounded-xl p-4 border border-blue-900 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-green-400">🌱 Bônus</h2>
        <button @click="openAddModal('bonus')" class="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">+</button>
      </div>
      <div v-if="bonusMissions.length === 0" class="text-slate-500 text-sm italic">Nenhum bónus disponível.</div>
      <div class="space-y-2">
        <div 
          v-for="mission in bonusMissions" 
          :key="mission.id"
          class="flex items-center justify-between gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer select-none"
          :class="{ 'opacity-50 grayscale': mission.completed }"
          @click="handleClick('bonus', mission.id)"
          @mousedown="startLongPress('bonus', mission.id, $event)"
          @mouseup="cancelLongPress"
          @mouseleave="cancelLongPress"
          @touchstart="startLongPress('bonus', mission.id, $event)"
          @touchmove="handleTouchMove"
          @touchend="cancelLongPress"
        >
          <span :class="{ 'line-through text-slate-500': mission.completed }">{{ mission.text }}</span>
          <div class="flex items-center gap-2">
            <span v-if="mission.completed" class="text-green-400 font-bold">✓</span>
            <span v-else class="text-yellow-500 font-mono text-sm">10 🪙</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Two Minute Rule Button -->
    <TwoMinuteRule />

    <!-- Tutorial Overlay -->
    <TutorialOverlay 
      v-if="showTutorial"
      title="⚔️ Missões"
      icon="⚔️"
      :content="[
        'Bem-vindo à seção de Missões! Aqui você gerencia suas tarefas diárias organizadas em três categorias.',
        'Missões Principais têm maior recompensa, Secundárias são tarefas de apoio, e Bônus são extras opcionais.'
      ]"
      :tips="[
        'Missões principais dão mais moedas!',
        'Complete todas as missões diárias para maximizar recompensas',
        'Use a Regra dos 2 Minutos em missões difíceis de começar',
        'Use o botao com o ⚡ para IA simplificar missões difíceis',
        'Missões resetam diariamente à meia-noite',
        'Pressione e segure uma missão para deletá-la'
      ]"
      @close="closeTutorial"
      @skip-all="skipAllTutorials"
    />

    <!-- Add Mission Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div class="bg-slate-800 p-6 rounded-lg max-w-sm w-full border border-blue-500 shadow-2xl relative">
        <button @click="showAddModal = false" class="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>
        
        <h2 class="text-xl font-bold text-blue-400 mb-4">
          Nova Missão {{ categoryLabels[selectedCategory].name }}
        </h2>
        
        <input 
          v-model="newMissionText" 
          type="text" 
          placeholder="Descreva a missão..." 
          class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white mb-4 focus:border-blue-500 outline-none"
          @keyup.enter="addMission"
          autofocus
        >
        
        <div class="text-sm text-slate-400 mb-4">
          Recompensa: <span class="text-yellow-400 font-bold">{{ categoryLabels[selectedCategory].reward }} 🪙</span>
        </div>
        
        <button 
          @click="addMission"
          :disabled="!newMissionText.trim()"
          class="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-3 rounded"
        >
          Adicionar Missão
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div class="bg-slate-800 p-6 rounded-2xl max-w-sm w-full border border-red-500/50 shadow-2xl animate-fade-in">
        <h2 class="text-xl font-bold text-red-400 mb-2">🗑️ Deletar Missão?</h2>
        <p class="text-slate-300 text-sm mb-6">Tem certeza que deseja deletar esta missão? Esta ação não pode ser desfeita.</p>
        
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


