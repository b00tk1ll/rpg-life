<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { generateAvatar } from '../utils/avatar'

const emit = defineEmits(['complete'])
const gameStore = useGameStore()

const currentStep = ref(0)
const userName = ref('Herói')
const previewAvatar = computed(() => generateAvatar(userName.value))

const steps = [
  {
    title: 'Bem-vindo ao RPG Life! 🎮',
    subtitle: 'Transforme sua vida em uma aventura épica',
    content: [
      'RPG Life gamifica sua rotina diária, transformando tarefas, hábitos e objetivos em missões que concedem moedas.',
      'Suba de nível, complete conquistas e desbloqueie recompensas enquanto constrói a melhor versão de si mesmo!'
    ],
    icon: '⚔️'
  },
  {
    title: 'Crie Seu Herói 🦸',
    subtitle: 'Todo herói precisa de um nome',
    content: [
      'Escolha o nome do seu personagem e comece sua jornada.',
      'Seu avatar será gerado automaticamente!'
    ],
    icon: '✨',
    hasInput: true
  },
  {
    title: 'Suas Missões Aguardam! 🗺️',
    subtitle: 'Explore todas as funcionalidades',
    content: [],
    icon: '🎯',
    features: [
      { icon: '⚔️', name: 'Missões', desc: 'Tarefas diárias que concedem moedas' },
      { icon: '❤️', name: 'Hábitos', desc: 'Crie streaks e construa consistência' },
      { icon: '📝', name: 'Reflexões', desc: 'Documente sua jornada e aprendizados' },
      { icon: '🛒', name: 'Loja', desc: 'Resgate recompensas com suas moedas' }
    ]
  }
]

const currentStepData = computed(() => steps[currentStep.value])
const isLastStep = computed(() => currentStep.value === steps.length - 1)
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return userName.value.trim().length > 0
  }
  return true
})

const nextStep = () => {
  if (currentStep.value < steps.length - 1 && canProceed.value) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const complete = () => {
  if (userName.value.trim()) {
    gameStore.updateName(userName.value.trim())
    gameStore.completeOnboarding()
    emit('complete')
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-md animate-fade-in">
    <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-lg w-full border border-indigo-500/30 shadow-2xl overflow-hidden">
      
      <!-- Progress Indicator -->
      <div class="flex gap-2 p-4 bg-slate-900/50">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="flex-1 h-1.5 rounded-full transition-all"
          :class="index <= currentStep ? 'bg-indigo-500' : 'bg-slate-700'"
        ></div>
      </div>

      <!-- Content -->
      <div class="p-8 min-h-[400px] flex flex-col">
        <!-- Step Icon -->
        <div class="text-6xl text-center mb-4 animate-bounce-slow">
          {{ currentStepData.icon }}
        </div>

        <!-- Step Title -->
        <h2 class="text-3xl font-bold text-white text-center mb-2">
          {{ currentStepData.title }}
        </h2>
        <p class="text-indigo-300 text-center mb-6 text-sm">
          {{ currentStepData.subtitle }}
        </p>

        <!-- Step Content -->
        <div class="flex-1 flex flex-col justify-center">
          
          <!-- Text Content -->
          <div v-if="currentStepData.content.length > 0" class="space-y-3 mb-6">
            <p 
              v-for="(paragraph, index) in currentStepData.content" 
              :key="index"
              class="text-slate-300 text-center leading-relaxed"
            >
              {{ paragraph }}
            </p>
          </div>

          <!-- Name Input (Step 2) -->
          <div v-if="currentStepData.hasInput" class="space-y-4">
            <div class="flex justify-center mb-4">
              <img 
                :src="previewAvatar" 
                alt="Avatar Preview" 
                class="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-lg shadow-indigo-500/50 bg-slate-800"
              >
            </div>
            <div>
              <label class="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wider text-center">
                Nome do Herói
              </label>
              <input 
                v-model="userName" 
                type="text" 
                placeholder="Digite seu nome..." 
                class="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-4 text-white text-center text-lg font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                @keyup.enter="nextStep"
                autofocus
                maxlength="20"
              >
              <p class="text-xs text-slate-500 text-center mt-2">
                Seu avatar é gerado automaticamente com base no seu nome
              </p>
            </div>
          </div>

          <!-- Features Grid (Step 3) -->
          <div v-if="currentStepData.features" class="grid grid-cols-2 gap-3">
            <div 
              v-for="feature in currentStepData.features" 
              :key="feature.name"
              class="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-indigo-500/50 transition-all"
            >
              <div class="text-3xl mb-2">{{ feature.icon }}</div>
              <h3 class="font-bold text-white mb-1 text-sm">{{ feature.name }}</h3>
              <p class="text-xs text-slate-400 leading-tight">{{ feature.desc }}</p>
            </div>
          </div>

        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-3 mt-8">
          <button 
            v-if="currentStep > 0"
            @click="prevStep"
            class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all"
          >
            ← Voltar
          </button>
          
          <button 
            v-if="!isLastStep"
            @click="nextStep"
            :disabled="!canProceed"
            class="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            Próximo →
          </button>

          <button 
            v-if="isLastStep"
            @click="complete"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            🚀 Começar Aventura!
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
