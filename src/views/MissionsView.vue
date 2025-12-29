<script setup>
import { useMissionStore } from '../stores/missions'
import { useGameStore } from '../stores/game'
import TwoMinuteRule from '../components/TwoMinuteRule.vue'
import TutorialOverlay from '../components/TutorialOverlay.vue'
import MissionItem from '../components/MissionItem.vue'
import BaseModal from '../components/BaseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { computed, ref, onMounted } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { MISSION_REWARDS } from '../utils/constants'

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
const showMissionModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const newMissionText = ref('')
const selectedCategory = ref('main')

// Delete state
const showDeleteConfirm = ref(false)
const missionToDelete = ref(null)

const categoryLabels = {
  main: { name: 'Principal', reward: MISSION_REWARDS.MAIN, color: 'text-yellow-500' },
  secondary: { name: 'Secundária', reward: MISSION_REWARDS.SECONDARY, color: 'text-blue-300' },
  bonus: { name: 'Bónus', reward: MISSION_REWARDS.BONUS, color: 'text-green-400' }
}

const openAddModal = (category) => {
  isEditing.value = false
  editingId.value = null
  selectedCategory.value = category
  newMissionText.value = ''
  showMissionModal.value = true
}

const openEditModal = (mission, category) => {
    isEditing.value = true
    editingId.value = mission.id
    selectedCategory.value = category
    newMissionText.value = mission.text
    showMissionModal.value = true
}

const saveMission = () => {
  if (!newMissionText.value.trim()) return

  if (isEditing.value) {
      missionStore.updateMission(selectedCategory.value, editingId.value, newMissionText.value)
  } else {
      missionStore.addMission(selectedCategory.value, newMissionText.value, categoryLabels[selectedCategory.value].reward)
  }
  
  newMissionText.value = ''
  showMissionModal.value = false
}

// Item interactions
const handleClick = (mission, category) => {
    missionStore.toggleMission(category, mission.id)
}

const confirmDeleteFromModal = () => {
    isEditing.value = false
    showMissionModal.value = false
    missionToDelete.value = { category: selectedCategory.value, id: editingId.value }
    showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (missionToDelete.value) {
    missionStore.deleteMission(missionToDelete.value.category, missionToDelete.value.id)
  }
  showDeleteConfirm.value = false
  missionToDelete.value = null
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
        <MissionItem
          v-for="mission in mainMissions"
          :key="mission.id"
          :mission="mission"
          reward-color="text-yellow-500"
          @click="handleClick(mission, 'main')"
          @long-press="openEditModal(mission, 'main')"
          @edit="openEditModal(mission, 'main')"
        />
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
        <MissionItem
          v-for="mission in secondaryMissions"
          :key="mission.id"
          :mission="mission"
          reward-color="text-blue-300"
          @click="handleClick(mission, 'secondary')"
          @long-press="openEditModal(mission, 'secondary')"
          @edit="openEditModal(mission, 'secondary')"
        />
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
        <MissionItem
          v-for="mission in bonusMissions"
          :key="mission.id"
          :mission="mission"
          reward-color="text-green-400"
          @click="handleClick(mission, 'bonus')"
          @long-press="openEditModal(mission, 'bonus')"
          @edit="openEditModal(mission, 'bonus')"
        />
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

    <!-- Add/Edit Mission Modal -->
    <BaseModal
      :show="showMissionModal"
      :title="isEditing ? `Editar Missão ${categoryLabels[selectedCategory].name}` : `Nova Missão ${categoryLabels[selectedCategory].name}`"
      border-color="border-blue-500"
      @close="showMissionModal = false"
    >
        <input 
          v-model="newMissionText" 
          type="text" 
          placeholder="Descreva a missão..." 
          class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white mb-4 focus:border-blue-500 outline-none"
          @keyup.enter="saveMission"
          autofocus
        >
        
        <div class="text-sm text-slate-400 mb-4">
          Recompensa: <span class="text-yellow-400 font-bold">{{ categoryLabels[selectedCategory].reward }} 🪙</span>
        </div>
        
        <div class="flex gap-3">
          <button 
            v-if="isEditing"
            @click="confirmDeleteFromModal"
            class="bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200 p-3 rounded transition-colors"
            title="Deletar Missão"
          >
            <Trash2 :size="20" />
          </button>
          <button 
            @click="saveMission"
            :disabled="!newMissionText.trim()"
            class="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-3 rounded transition-colors"
          >
            {{ isEditing ? 'Salvar Alterações' : 'Adicionar Missão' }}
          </button>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteConfirm"
      title="Deletar Missão?"
      message="Tem certeza que deseja deletar esta missão? Esta ação não pode ser desfeita."
      confirm-text="Deletar"
      cancel-text="Cancelar"
      type="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>


