<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useGameStore } from './stores/game'
import WelcomeModal from './components/WelcomeModal.vue'
import InstallPrompt from './components/InstallPrompt.vue'
import { ref, onMounted } from 'vue'

const gameStore = useGameStore()
const showNameModal = ref(false)
const newName = ref('')
const showWelcome = ref(false)

onMounted(() => {
  // Show welcome modal on first launch
  if (!gameStore.onboarding.completed) {
    setTimeout(() => {
      showWelcome.value = true
    }, 500)
  }
})

const openNameModal = () => {
    newName.value = gameStore.user.name
    showNameModal.value = true
}

const saveName = () => {
    if (newName.value.trim()) {
        gameStore.updateName(newName.value.trim())
        showNameModal.value = false
    }
}
</script>

<template>
  <div class="min-h-screen bg-game-bg text-game-text font-sans pb-20">
    <!-- Header -->
    <header class="bg-slate-900/95 backdrop-blur-md shadow-2xl sticky top-0 z-50 border-b border-white/10">
      <div class="container mx-auto px-4 py-3">
        <!-- Top Row: Profile & Stats -->
        <div class="flex justify-between items-center mb-3">
          <!-- Left: Profile -->
          <div 
            class="flex items-center gap-3 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors group"
            @click="openNameModal"
            title="Clique para editar perfil"
          >
            <div class="relative group-hover:scale-105 transition-transform">
              <img 
                :src="gameStore.user.avatar" 
                alt="Avatar" 
                class="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] bg-slate-800"
              >
              <div class="absolute -bottom-1 -right-1 bg-slate-800 rounded-full border border-slate-600 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                Lvl {{ gameStore.user.level }}
              </div>
            </div>
            <div class="flex flex-col">
              <span 
                class="font-bold text-white leading-tight tracking-wide group-hover:text-indigo-400 transition-colors"
                :title="gameStore.user.name"
              >
                {{ gameStore.user.name.length > 16 ? gameStore.user.name.substring(0, 16) + '...' : gameStore.user.name }}
              </span>
              <span class="text-xs text-indigo-300 font-medium tracking-wider">RPG LIFE</span>
            </div>
          </div>

          <!-- Right: Stats -->
          <div class="flex items-center gap-3">
             <div class="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50 shadow-inner">
               <span class="text-lg">🪙</span>
               <span class="font-mono font-bold text-yellow-400">{{ gameStore.user.coins }}</span>
             </div>
          </div>
        </div>

        <!-- Bottom Row: Dynamic Page Title -->
        <div v-if="$route.meta.title" class="flex items-center justify-between pb-1">
          <h2 class="text-lg font-bold text-white/90 flex items-center gap-2">
            <span class="w-1 h-5 bg-indigo-500 rounded-full"></span>
            {{ $route.meta.title }}
          </h2>
          <div class="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
            <span class="text-xs">⭐</span>
            <span class="text-xs text-indigo-300 font-mono font-bold">
              {{ gameStore.user.xp.toFixed(0) }} / {{ (100 * Math.pow(gameStore.user.level, 1.5)).toFixed(0) }} XP
            </span>
            <span class="text-[10px] text-slate-400 font-mono">({{ gameStore.levelProgress.toFixed(0) }}%)</span>
          </div>
        </div>
      </div>

      <!-- XP Bar (Slim & Integrated) -->
      <div class="absolute bottom-0 left-0 w-full h-[3px] bg-slate-800">
        <div 
          class="h-full bg-gradient-to-r from-indigo-600 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500 ease-out"
          :style="{ width: gameStore.levelProgress + '%' }"
        ></div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto p-4 animate-fade-in">
      <RouterView />
    </main>
    
    <!-- Bottom Navigation (Mobile First) -->
    <nav class="fixed bottom-0 left-0 w-full bg-slate-800 border-t border-slate-700 p-2 flex justify-around items-center z-50">
      <RouterLink to="/" class="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white active:text-game-accent transition-colors">
        <span class="text-xl">🏠</span>
        <span class="text-xs">Home</span>
      </RouterLink>
      <RouterLink to="/missions" class="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white active:text-game-accent transition-colors">
        <span class="text-xl">⚔️</span>
        <span class="text-xs">Missões</span>
      </RouterLink>
      <RouterLink to="/habits" class="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white active:text-game-accent transition-colors">
        <span class="text-xl">❤️</span>
        <span class="text-xs">Hábitos</span>
      </RouterLink>
      <RouterLink to="/reflection" class="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white active:text-game-accent transition-colors">
        <span class="text-xl">📝</span>
        <span class="text-xs">Reflexão</span>
      </RouterLink>
      <RouterLink to="/shop" class="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white active:text-game-accent transition-colors">
        <span class="text-xl">🛒</span>
        <span class="text-xs">Loja</span>
      </RouterLink>
    </nav>

    <!-- Edit Profile Modal -->
    <div v-if="showNameModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div class="bg-slate-800 p-6 rounded-2xl max-w-sm w-full border border-indigo-500/50 shadow-2xl relative animate-fade-in">
        <button @click="showNameModal = false" class="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors">✕</button>
        
        <h2 class="text-xl font-bold text-white mb-1">Editar Perfil</h2>
        <p class="text-slate-400 text-sm mb-6">Como gostaria de ser chamado?</p>
        
        <div class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wider">Nome do Herói</label>
                <input 
                  v-model="newName" 
                  type="text" 
                  placeholder="Seu nome..." 
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-bold"
                  @keyup.enter="saveName"
                  autofocus
                >
            </div>
            
            <button 
              type="button"
              @click.prevent.stop="saveName"
              :disabled="!newName.trim()"
              class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              Salvar Alterações
            </button>
        </div>
      </div>
    </div>

    <!-- Welcome Modal for First Launch -->
    <WelcomeModal 
      v-if="showWelcome" 
      @complete="showWelcome = false"
    />
    
    <!-- PWA Install Prompt -->
    <InstallPrompt />
  </div>
</template>

<style scoped>
.router-link-active {
  color: #38BDF8; /* game-accent */
}
</style>
