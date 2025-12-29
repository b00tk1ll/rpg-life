<script setup>
import { useGameStore } from '../stores/game'
import TutorialOverlay from '../components/TutorialOverlay.vue'
import BaseModal from '../components/BaseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { useToastStore } from '../stores/toast'
import { ref, onMounted, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-vue-next'

const gameStore = useGameStore()
const toastStore = useToastStore()

// Tutorial state
const showTutorial = ref(false)

onMounted(() => {
  if (!gameStore.onboarding.visitedViews.shop && 
      !gameStore.onboarding.skippedTutorials &&
      gameStore.onboarding.completed) {
    setTimeout(() => {
      showTutorial.value = true
    }, 300)
  }
})

const closeTutorial = () => {
  gameStore.markViewVisited('shop')
  showTutorial.value = false
}

const skipAllTutorials = () => {
  gameStore.skipAllTutorials()
  showTutorial.value = false
}

// Persist rewards in localStorage
const rewards = useStorage('rpg-rewards', [
  { id: 1, text: 'Jogar 1h de Video Game', cost: 50 },
  { id: 2, text: 'Episódio de Série', cost: 30 },
  { id: 3, text: 'Doce / Sobremesa', cost: 100 },
])

const showNotification = (message, type = 'success') => {
  toastStore.show(message, type)
}

const buyReward = (reward) => {
  const success = gameStore.removeCoins(reward.cost)
  if (success) {
    showNotification(`Comprado: ${reward.text}! Aproveite. 🎉`, 'success')
  } else {
    showNotification('Moedas insuficientes! 💸', 'error')
  }
}

// Modal state
const showRewardModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const newRewardText = ref('')
const newRewardCost = ref(50)

// Menu state
const openMenuId = ref(null)

const toggleMenu = (id) => {
    openMenuId.value = openMenuId.value === id ? null : id
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  // Check if click is outside dropdown menu
  if (openMenuId.value !== null && !event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-trigger')) {
    openMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Delete state
const showDeleteConfirm = ref(false)
const rewardToDelete = ref(null)

const openAddModal = () => {
    openMenuId.value = null
    isEditing.value = false
    editingId.value = null
    newRewardText.value = ''
    newRewardCost.value = 50
    showRewardModal.value = true
}

const openEditModal = (reward) => {
    openMenuId.value = null
    isEditing.value = true
    editingId.value = reward.id
    newRewardText.value = reward.text
    newRewardCost.value = reward.cost
    showRewardModal.value = true
}

const saveReward = () => {
  if (newRewardText.value && newRewardCost.value > 0) {
      if (isEditing.value) {
          const index = rewards.value.findIndex(r => r.id === editingId.value)
          if (index !== -1) {
              rewards.value[index].text = newRewardText.value
              rewards.value[index].cost = newRewardCost.value
              showNotification('Recompensa atualizada! ✨')
          }
      } else {
          rewards.value.push({ id: Date.now(), text: newRewardText.value, cost: newRewardCost.value })
          showNotification('Recompensa adicionada! ✨')
      }
      showRewardModal.value = false
      newRewardText.value = ''
      newRewardCost.value = 50
  }
}

// Delete logic
const confirmDeleteReward = (reward) => {
    openMenuId.value = null
    rewardToDelete.value = reward
    showDeleteConfirm.value = true
}

const deleteReward = () => {
    if (rewardToDelete.value) {
        rewards.value = rewards.value.filter(r => r.id !== rewardToDelete.value.id)
        showNotification('Recompensa deletada.', 'success')
    }
    showDeleteConfirm.value = false
    rewardToDelete.value = null
}
</script>

<template>
  <div class="space-y-6 pb-20">

<!--
    <div class="flex justify-end items-center mb-4">
      <div class="bg-yellow-900/50 px-3 py-1 rounded border border-yellow-500 text-yellow-300 font-mono">
        {{ gameStore.user.coins }} 🪙
      </div>
    </div>
-->

    <!-- Loot Box Section -->
    <section class="bg-gradient-to-br from-purple-900 to-slate-900 rounded-xl p-6 border border-purple-500 shadow-lg text-center relative overflow-hidden group">
      <div class="absolute inset-0 bg-purple-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
      <h2 class="text-2xl font-bold text-white mb-2 relative z-10">🎁 Loot Box Lendária</h2>
      <p class="text-purple-200 text-sm mb-4 relative z-10">Complete 3 dias de streak para abrir!</p>
      <button class="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-8 rounded-full shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
        Bloqueado 🔒
      </button>
    </section>

    <!-- Custom Rewards -->
    <section class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-white">Minhas Recompensas</h2>
        <button @click="openAddModal" class="bg-yellow-600 hover:bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
          <Plus :size="20" />
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          v-for="reward in rewards" 
          :key="reward.id"
          class="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col justify-between hover:border-yellow-500 transition-colors group relative"
        >
          <div class="flex justify-between items-start mb-2">
              <span class="font-medium text-lg group-hover:text-yellow-300 transition-colors pr-8">{{ reward.text }}</span>
              
              <!-- Menu trigger -->
              <div class="relative">
                  <button 
                      @click.stop="toggleMenu(reward.id)"
                      class="dropdown-trigger text-slate-400 hover:text-white transition-colors p-1"
                  >
                      <MoreVertical :size="20" />
                  </button>
                  <!-- Dropdown Menu -->
                  <div 
                      v-if="openMenuId === reward.id"
                      class="dropdown-menu absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 min-w-[140px] overflow-hidden"
                  >
                      <button 
                          @click.stop="openEditModal(reward)"
                          class="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                          <Pencil :size="16" class="text-slate-400" /> Editar
                      </button>
                      <button 
                          @click.stop="confirmDeleteReward(reward)"
                          class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
                      >
                          <Trash2 :size="16" /> Excluir
                      </button>
                  </div>
              </div>
          </div>

          <button 
            @click="buyReward(reward)"
            class="w-full bg-slate-700 hover:bg-yellow-600 text-yellow-400 hover:text-white font-mono py-2 rounded transition-colors"
          >
            {{ reward.cost }} 🪙 Comprar
          </button>
        </div>
      </div>
    </section>

    <!-- Tutorial Overlay -->
    <TutorialOverlay 
      v-if="showTutorial"
      title="🛍️ Loja de Recompensas"
      icon="🛍️"
      :content="[
        'Bem-vindo à Loja! Aqui você pode gastar as moedas conquistadas em missões e hábitos.',
        'Customize suas próprias recompensas - qualquer coisa que te motive, de guloseimas a atividades de lazer!'
      ]"
      :tips="[
        'Defina recompensas que realmente te motivam',
        'Mantenha algumas recompensas pequenas e acessíveis',
        'Pense em experiências, não apenas objetos',
        'Balance o preço com o esforço necessário para conquistar',
        'Permita-se desfrutar das recompensas sem culpa!'
      ]"
      @close="closeTutorial"
      @skip-all="skipAllTutorials"
    />

    <!-- Add/Edit Reward Modal -->
    <BaseModal
      :show="showRewardModal"
      :title="isEditing ? 'Editar Recompensa' : 'Nova Recompensa'"
      border-color="border-yellow-500"
      @close="showRewardModal = false"
    >
        <div class="space-y-4">
            <input 
              v-model="newRewardText" 
              type="text" 
              placeholder="Ex: Assistir um filme" 
              class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-yellow-500 outline-none"
              @keyup.enter="saveReward"
            >
            
            <div class="flex items-center gap-2">
              <span class="text-slate-400">Custo:</span>
              <input 
                v-model.number="newRewardCost" 
                type="number" 
                min="1"
                class="w-35 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-yellow-500 outline-none text-center"
              >
              <span class="text-yellow-400">🪙</span>
            </div>
            
            <button 
              @click="saveReward"
              :disabled="!newRewardText || newRewardCost <= 0"
              class="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-600 text-white font-bold py-3 rounded"
            >
              {{ isEditing ? 'Salvar Alterações' : 'Adicionar Recompensa' }}
            </button>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteConfirm"
      title="Deletar Recompensa?"
      message="Tem certeza que deseja deletar esta recompensa?"
      confirm-text="Deletar"
      cancel-text="Cancelar"
      type="danger"
      @confirm="deleteReward"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
