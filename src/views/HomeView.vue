<script setup>
import { useGameStore } from '../stores/game'
import { useMissionStore } from '../stores/missions'
import ProgressChart from '../components/ProgressChart.vue'
import { computed, onMounted } from 'vue'

const gameStore = useGameStore()
const missionStore = useMissionStore()

// Initialize resets on component mount (not during import)
onMounted(() => {
  missionStore.checkDailyReset()
})

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
      <h2 class="text-xl font-bold mb-4 text-white">XP Semanal</h2>
      <div class="h-64 bg-slate-900 rounded border border-slate-700 p-2">
        <ProgressChart />
      </div>
    </div>
  </div>
</template>
