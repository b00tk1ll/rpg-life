<script setup>
import { ref } from 'vue'
import { useMissionStore } from '../stores/missions'

const missionStore = useMissionStore()

const showModal = ref(false)
const taskInput = ref('')
const suggestion = ref(null)
const isLoading = ref(false)
const error = ref('')

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

const systemPrompt = `Atua como um mentor de RPG e especialista em produtividade baseado na "Técnica dos 2 Minutos".

REGRAS:
1. Se a tarefa é simples e rápida (menos de 10 minutos), marque como "Ideal".
2. Se a tarefa é vaga, complexa ou demora mais de 30 minutos, marque como "Grande".

IMPORTANTE:
- Se for "Ideal": NÃO mude a tarefa! Apenas melhore a escrita do usuário de forma clara e concisa. Mantenha a essência original.
- Se for "Grande": Crie uma versão mínima de até 10 minutos para começar o movimento.

Responda APENAS em JSON válido:
{
  "status": "Ideal" ou "Grande",
  "sugestao_2_minutos": "Se Ideal: a tarefa original melhorada. Se Grande: o título da tarefa da ação mínima",
  "frase_motivacional": "Frase curta estilo narrador de jogo usando o contexto da missão."
}`

const generateSuggestion = async () => {
  if (!taskInput.value.trim()) return
  
  isLoading.value = true
  error.value = ''
  suggestion.value = null

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'RPG Life'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Missão do jogador: "${taskInput.value}"` }
        ],
        temperature: 0.7,
        max_tokens: 10000
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (content) {
      try {
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          suggestion.value = {
            status: parsed.status || 'Grande',
            sugestao_2_minutos: parsed.sugestao_2_minutos || 'Faça por 2 minutos.',
            frase_motivacional: parsed.frase_motivacional || 'O primeiro passo é o mais importante!'
          }
        }
      } catch {
        // Fallback: extract fields with regex
        const sugestaoMatch = content.match(/"sugestao_2_minutos"\s*:\s*"([^"]+)"/)
        const fraseMatch = content.match(/"frase_motivacional"\s*:\s*"([^"]+)"/)
        const statusMatch = content.match(/"status"\s*:\s*"([^"]+)"/)
        
        suggestion.value = {
          status: statusMatch?.[1] || 'Grande',
          sugestao_2_minutos: sugestaoMatch?.[1] || 'Faça por apenas 2 minutos.',
          frase_motivacional: fraseMatch?.[1] || 'Cada jornada começa com um passo!'
        }
      }
    }
  } catch (err) {
    console.error('OpenRouter Error:', err)
    error.value = 'Erro ao conectar com a IA. Usando modo offline.'
    suggestion.value = {
      status: 'Grande',
      sugestao_2_minutos: 'Faça essa tarefa por apenas 2 minutos cronometrados.',
      frase_motivacional: 'Mesmo sem conexão, o herói não para!'
    }
  } finally {
    isLoading.value = false
  }
}

const successMessage = ref('')

const addAsMission = () => {
  console.log('addAsMission called')
  console.log('suggestion.value:', suggestion.value)
  console.log('taskInput.value:', taskInput.value)
  
  const missionText = suggestion.value?.sugestao_2_minutos || taskInput.value
  console.log('missionText to add:', missionText)
  
  if (!missionText || !missionText.trim()) {
    console.error('No mission text to add')
    return
  }
  
  missionStore.addMission('bonus', missionText, 10)
  console.log('Mission added to store')
  
  successMessage.value = 'Missão adicionada como Bônus! ✨'
  setTimeout(() => {
    successMessage.value = ''
    closeModal()
  }, 1500)
}

const closeModal = () => {
  showModal.value = false
  suggestion.value = null
  taskInput.value = ''
  error.value = ''
  successMessage.value = ''
}
</script>

<template>
  <div>
    <button 
      @click="showModal = true"
      class="fixed bottom-24 right-4 bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-full shadow-lg z-40 transition hover:scale-110"
      title="Regra dos 2 Minutos (Anti-Procrastinação)"
    >
      ⚡
    </button>

    <div v-if="showModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div class="bg-slate-800 p-6 rounded-lg max-w-md w-full border border-orange-500 shadow-2xl relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>
        
        <h2 class="text-xl font-bold text-orange-400 mb-4">⚡ Regra dos 2 Minutos</h2>
        <p class="text-sm text-slate-300 mb-4">Está procrastinando? Digite a tarefa difícil e a IA vai simplificá-la.</p>
        
        <input 
          v-model="taskInput" 
          type="text" 
          placeholder="Ex: Estudar 2 horas para a prova" 
          class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white mb-4 focus:border-orange-500 outline-none"
          @keyup.enter="generateSuggestion"
          :disabled="isLoading"
        >
        
        <button 
          @click="generateSuggestion"
          :disabled="isLoading || !taskInput.trim()"
          class="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded mb-4 flex items-center justify-center gap-2"
        >
          <span v-if="isLoading" class="animate-spin">⏳</span>
          <span>{{ isLoading ? 'Analisando...' : '🤖 Analisar com IA' }}</span>
        </button>

        <p v-if="error" class="text-red-400 text-sm mb-4 text-center">{{ error }}</p>

        <!-- AI Response -->
        <div v-if="suggestion" class="bg-slate-900/80 p-4 rounded-lg border border-orange-500/50 space-y-4">
          
          <!-- Se for IDEAL -->
          <div v-if="suggestion.status === 'Ideal'" class="text-center">
            <p class="text-green-300 font-bold text-lg mt-2">🟢 Missão Ideal!</p>
            <p class="text-slate-400 text-sm">Esta tarefa já está no tamanho certo. Podes começar agora!</p>
          </div>

          <!-- Se for GRANDE -->
          <div v-else class="text-center">
            <p class="text-red-300 font-bold text-lg mt-2">🔴 Missão Grande</p>
            <div class="bg-orange-900/30 p-4 rounded border border-orange-500/30 mt-3">
              <p class="text-orange-200 font-bold text-xl">🎯 {{ suggestion.sugestao_2_minutos }}</p>
            </div>
          </div>

          <!-- Frase Motivacional (sempre visível) -->
          <p class="text-slate-400 italic text-sm text-center border-t border-slate-700 pt-3">
            "{{ suggestion.frase_motivacional }}"
          </p>

          <!-- Botão para adicionar como missão -->
          <button 
            @click.prevent.stop="addAsMission"
            :disabled="!!successMessage"
            class="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-green-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition-colors mt-4"
          >
            <template v-if="successMessage">
              ✓ {{ successMessage }}
            </template>
            <template v-else>
              ➕ Add como Missão Bônus
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
