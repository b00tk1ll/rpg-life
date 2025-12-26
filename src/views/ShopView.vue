<script setup>
import { useGameStore } from '../stores/game'
import TutorialOverlay from '../components/TutorialOverlay.vue'
import { ref, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'

const gameStore = useGameStore()

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

const notification = ref({ show: false, message: '', type: 'success' })

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => notification.value.show = false, 2000)
}

const buyReward = (reward) => {
  const success = gameStore.removeCoins(reward.cost)
  if (success) {
    showNotification(`Comprado: ${reward.text}! Aproveite. 🎉`, 'success')
  } else {
    showNotification('Moedas insuficientes! 💸', 'error')
  }
}

const showAddModal = ref(false)
const newRewardText = ref('')
const newRewardCost = ref(50)

const addReward = () => {
  if (newRewardText.value && newRewardCost.value > 0) {
    rewards.value.push({ id: Date.now(), text: newRewardText.value, cost: newRewardCost.value })
    newRewardText.value = ''
    newRewardCost.value = 50
    showAddModal.value = false
    showNotification('Recompensa adicionada! ✨')
  }
}
</script>

<template>
  <div class="space-y-6 pb-20">
    <!-- Notification Toast -->
    <Transition name="fade">
      <div 
        v-if="notification.show" 
        :class="notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'"
        class="fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-[100] text-white font-bold"
      >
        {{ notification.message }}
      </div>
    </Transition>
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
        <button @click="showAddModal = true" class="bg-yellow-600 hover:bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">+</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          v-for="reward in rewards" 
          :key="reward.id"
          class="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col justify-between hover:border-yellow-500 transition-colors group"
        >
          <span class="font-medium text-lg mb-2 group-hover:text-yellow-300 transition-colors">{{ reward.text }}</span>
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

    <!-- Add Reward Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div class="bg-slate-800 p-6 rounded-lg max-w-sm w-full border border-yellow-500 shadow-2xl relative">
        <button @click="showAddModal = false" class="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>
        
        <h2 class="text-xl font-bold text-yellow-400 mb-4">Nova Recompensa</h2>
        
        <input 
          v-model="newRewardText" 
          type="text" 
          placeholder="Ex: Assistir um filme" 
          class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white mb-4 focus:border-yellow-500 outline-none"
        >
        
        <div class="flex items-center gap-2 mb-4">
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
          @click="addReward"
          :disabled="!newRewardText || newRewardCost <= 0"
          class="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-600 text-white font-bold py-3 rounded"
        >
          Adicionar Recompensa
        </button>
      </div>
    </div>
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
