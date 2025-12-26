<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  content: {
    type: Array,
    required: true
  },
  tips: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'skipAll'])

const handleClose = () => {
  emit('close')
}

const handleSkipAll = () => {
  emit('skipAll')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[150] p-4 backdrop-blur-sm animate-fade-in">
    <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full border border-indigo-500/30 shadow-2xl overflow-hidden animate-slide-up">
      
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6 border-b border-indigo-500/30">
        <div class="text-5xl text-center mb-3">{{ icon }}</div>
        <h2 class="text-2xl font-bold text-white text-center">{{ title }}</h2>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        
        <!-- Main Content -->
        <div class="space-y-3">
          <p 
            v-for="(paragraph, index) in content" 
            :key="index"
            class="text-slate-300 leading-relaxed"
          >
            {{ paragraph }}
          </p>
        </div>

        <!-- Tips Section -->
        <div v-if="tips.length > 0" class="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 class="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Dicas Importantes</span>
          </h3>
          <ul class="space-y-2">
            <li 
              v-for="(tip, index) in tips" 
              :key="index"
              class="text-sm text-slate-400 flex items-start gap-2"
            >
              <span class="text-indigo-400 mt-0.5">•</span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-2">
          <button 
            @click="handleClose"
            class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            ✓ Entendi!
          </button>
          
          <button 
            @click="handleSkipAll"
            class="w-full bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-300 text-sm py-2 rounded-lg transition-all"
          >
            Pular todos os tutoriais
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
