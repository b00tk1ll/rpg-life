<script setup>
import { useGameStore } from '../stores/game'
import { useMissionStore } from '../stores/missions'
import ProgressChart from '../components/ProgressChart.vue'
import { computed } from 'vue'

const gameStore = useGameStore()
const missionStore = useMissionStore()

// Initialize resets
missionStore.checkDailyReset()

// Calculate mission progress
const missionProgress = computed(() => {
  const allMissions = [
    ...missionStore.dailies.main,
    ...missionStore.dailies.secondary,
    ...missionStore.dailies.bonus
  ]
  
  if (allMissions.length === 0) return 0
  
  const completed = allMissions.filter(m => m.completed).length
  return Math.round((completed / allMissions.length) * 100)
})
</script>

<template>
  <div class="space-y-6">
    <!---
    <div class="bg-slate-800 rounded-lg p-6 shadow-md border border-slate-700">
      <h2 class="text-2xl font-bold mb-4 text-white">Status do Jogador</h2>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-slate-900 p-4 rounded border border-blue-500/30">
          <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">XP Atual</p>
          <p class="text-2xl font-mono font-bold text-blue-300">{{ gameStore.user.xp }} <span class="text-sm">XP</span></p>
        </div>
        <div class="bg-slate-900 p-4 rounded border border-yellow-500/30">
          <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Moedas Atuais</p>
          <p class="text-2xl font-mono font-bold text-yellow-400">{{ gameStore.user.coins }} <span class="text-lg">🪙</span></p>
        </div>
        
        <div class="bg-gradient-to-br from-indigo-900/30 to-slate-900 p-4 rounded border border-indigo-500/50 relative overflow-hidden">
          <div class="absolute top-0 right-0 text-5xl opacity-10">⭐</div>
          <p class="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">XP Total Ganho</p>
          <p class="text-2xl font-mono font-bold text-indigo-200">{{ gameStore.totalXpEarned }} <span class="text-sm">XP</span></p>
        </div>
        <div class="bg-gradient-to-br from-amber-900/30 to-slate-900 p-4 rounded border border-amber-500/50 relative overflow-hidden">
          <div class="absolute top-0 right-0 text-5xl opacity-10">💰</div>
          <p class="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">Moedas Total Ganhas</p>
          <p class="text-2xl font-mono font-bold text-amber-200">{{ gameStore.totalCoinsEarned }} <span class="text-lg">🪙</span></p>
        </div>
      </div>
    </div>
    -->

    <!-- Active Missions Quick View -->
    <div class="bg-slate-800 rounded-lg p-6 shadow-md border border-slate-700">
      <h2 class="text-xl font-bold mb-2 text-white">Missões Ativas</h2>
      <p class="text-sm text-slate-400 mb-4">Complete suas missões diárias para ganhar recompensas.</p>
      <div class="flex gap-2">
        <div class="flex-1 bg-slate-700 rounded h-2">
            <div 
              class="bg-green-500 h-full rounded transition-all" 
              :style="{ width: missionProgress + '%' }"
            ></div>
        </div>
      </div>
      <p class="text-xs text-right mt-1 text-slate-500">{{ missionProgress }}% Concluído</p>
    </div>

    <div class="bg-slate-800 rounded-lg p-6 shadow-md border border-slate-700">
      <h2 class="text-xl font-bold mb-4 text-white">Gráfico de 7 Dias</h2>
      <div class="h-64 bg-slate-900 rounded border border-slate-700 p-2">
        <ProgressChart />
      </div>
    </div>
  </div>
</template>
