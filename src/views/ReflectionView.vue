<script setup>
import { useStorage } from '@vueuse/core'
import { useGameStore } from '../stores/game'
import TutorialOverlay from '../components/TutorialOverlay.vue'
import { ref, onMounted } from 'vue'

const reflections = useStorage('rpg-reflections', [])
const currentNote = ref('')
const successMessage = ref('')
const showModal = ref(false)
const gameStore = useGameStore()

// Tutorial state
const showTutorial = ref(false)

onMounted(() => {
  if (!gameStore.onboarding.visitedViews.reflection && 
      !gameStore.onboarding.skippedTutorials &&
      gameStore.onboarding.completed) {
    setTimeout(() => {
      showTutorial.value = true
    }, 300)
  }
})

const closeTutorial = () => {
  gameStore.markViewVisited('reflection')
  showTutorial.value = false
}

const skipAllTutorials = () => {
  gameStore.skipAllTutorials()
  showTutorial.value = false
}

// Menu state
const openMenuId = ref(null)

// View/Edit reflection state
const showViewModal = ref(false)
const reflectionToView = ref(null)
const editMode = ref(false)
const editedText = ref('')

// Delete confirmation state
const showDeleteModal = ref(false)
const reflectionToDelete = ref(null)

const saveReflection = () => {
    console.log('saveReflection called')
    console.log('currentNote:', currentNote.value)
    
    if (!currentNote.value || !currentNote.value.trim()) {
        console.error('No note content')
        return
    }
    
    reflections.value.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        text: currentNote.value
    })
    console.log('Reflection saved to storage')
    
    currentNote.value = ''
    successMessage.value = 'Reflexão salva! ✨'
    setTimeout(() => {
        successMessage.value = ''
        showModal.value = false
    }, 1500)
}

const closeModal = () => {
    showModal.value = false
    currentNote.value = ''
    successMessage.value = ''
}

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const viewReflection = (reflection) => {
    openMenuId.value = null
    editMode.value = false
    reflectionToView.value = reflection
    editedText.value = reflection.text
    showViewModal.value = true
}

const editReflection = (reflection) => {
    openMenuId.value = null
    editMode.value = true
    reflectionToView.value = reflection
    editedText.value = reflection.text
    showViewModal.value = true
}

const saveEdit = () => {
    if (reflectionToView.value && editedText.value.trim()) {
        const index = reflections.value.findIndex(r => r.id === reflectionToView.value.id)
        if (index !== -1) {
            reflections.value[index].text = editedText.value.trim()
        }
        closeViewModal()
    }
}

const deleteReflection = (reflection) => {
    openMenuId.value = null
    reflectionToDelete.value = reflection.id
    showDeleteModal.value = true
}

const confirmDelete = () => {
    if (reflectionToDelete.value) {
        reflections.value = reflections.value.filter(r => r.id !== reflectionToDelete.value)
    }
    showDeleteModal.value = false
    reflectionToDelete.value = null
}

const cancelDelete = () => {
    showDeleteModal.value = false
    reflectionToDelete.value = null
}

const closeViewModal = () => {
    showViewModal.value = false
    reflectionToView.value = null
    editMode.value = false
    editedText.value = ''
}
</script>

<template>
  <div>
    <!-- Main Content -->
    <div class="space-y-6 pb-20">
      <div class="space-y-4">
          <div v-if="reflections.length === 0" class="bg-slate-900/50 border-2 border-dashed border-blue-800/30 rounded-lg p-8 text-center">
        <div class="text-5xl mb-4">📝</div>
        <h3 class="text-lg font-semibold text-blue-900 mb-2">Nenhuma reflexão ainda</h3>
        <p class="text-slate-400 text-sm mb-3">
          Use este espaço para registrar aprendizados, insights e oportunidades de melhoria.
        </p>
        <p class="text-blue-600 text-sm font-medium">
          💡 Clique no botão <span class="inline-block bg-blue-900 text-white px-2 py-1 rounded text-xs">➕</span> abaixo para começar!
        </p>
      </div>
          <div 
            v-for="r in reflections" 
            :key="r.id" 
            class="bg-slate-900 p-4 rounded border border-slate-800 hover:border-blue-800 transition-colors relative"
          >
              <div class="flex justify-between items-start mb-2">
                  <p class="text-xs text-slate-500">{{ r.date }}</p>
                  <div class="relative">
                      <button 
                          @click.stop="toggleMenu(r.id)"
                          class="text-slate-400 hover:text-white transition-colors p-1"
                      >
                          ⋮
                      </button>
                      <!-- Dropdown Menu -->
                      <div 
                          v-if="openMenuId === r.id"
                          class="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[140px] overflow-hidden"
                      >
                          <button 
                              @click="viewReflection(r)"
                              class="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
                          >
                              👁️ Ver
                          </button>
                          <button 
                              @click="editReflection(r)"
                              class="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
                          >
                              ✏️ Editar
                          </button>
                          <button 
                              @click="deleteReflection(r)"
                              class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
                          >
                              🗑️ Excluir
                          </button>
                      </div>
                  </div>
              </div>
              <p class="text-slate-200 line-clamp-3">{{ r.text }}</p>
          </div>
      </div>
    </div>

    <!-- Floating Add Button (outside main flow) -->
    <button 
      @click="showModal = true"
      class="fixed bottom-24 right-4 bg-blue-900 hover:bg-blue-800 text-white w-14 h-14 rounded-full shadow-lg transition hover:scale-110 flex items-center justify-center text-2xl"
      title="Adicionar Reflexão"
    >
      ➕
    </button>

    <!-- Tutorial Overlay -->
    <TutorialOverlay 
      v-if="showTutorial"
      title="📝 Reflexões"
      icon="📝"
      :content="[
        'Bem-vindo à seção de Reflexões! Este é seu espaço pessoal para documentar pensamentos, aprendizados e insights.',
        'Use como um diário de progresso, anotando conquistas, desafios superados e lições aprendidas no dia a dia.'
      ]"
      :tips="[
        'Anote suas conquistas do dia, por menores que sejam',
        'Use reflexões para identificar padrões de comportamento',
        'Revise reflexões antigas para ver seu progresso',
        'A escrita regular melhora autoconhecimento',
        'Clique nos 3 pontinhos para editar ou deletar reflexões'
      ]"
      @close="closeTutorial"
      @skip-all="skipAllTutorials"
    />

    <!-- View/Edit Reflection Modal -->
    <div v-if="showViewModal && reflectionToView" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div class="bg-slate-800 p-6 rounded-lg max-w-md w-full border border-blue-800 shadow-2xl relative">
        <button @click="closeViewModal" class="absolute top-2 right-2 text-slate-400 hover:text-white text-xl">✕</button>
        
        <h2 class="text-xl font-bold text-blue-700 mb-2">
            {{ editMode ? '✏️ Editar Reflexão' : '📝 Reflexão' }}
        </h2>
        <p class="text-xs text-slate-500 mb-4">{{ reflectionToView.date }}</p>
        
        <div v-if="editMode" class="space-y-4">
            <textarea 
                v-model="editedText"
                class="w-full h-64 bg-slate-900 border border-slate-700 rounded p-4 text-white focus:border-blue-800 outline-none resize-none"
                placeholder="Escreva sua reflexão..."
            ></textarea>
            <div class="flex gap-3">
                <button 
                    @click="closeViewModal"
                    class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    @click="saveEdit"
                    :disabled="!editedText.trim()"
                    class="flex-1 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-600 text-white font-bold py-3 rounded transition-colors"
                >
                    Salvar
                </button>
            </div>
        </div>
        <div v-else class="bg-slate-900 p-4 rounded border border-slate-700 max-h-96 overflow-y-auto">
          <p class="text-slate-200 whitespace-pre-wrap">{{ reflectionToView.text }}</p>
        </div>
      </div>
    </div>

    <!-- Add Reflection Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div class="bg-slate-800 p-6 rounded-lg max-w-md w-full border border-blue-800 shadow-2xl relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-slate-400 hover:text-white text-xl">✕</button>
        
        <h2 class="text-xl font-bold text-blue-700 mb-4">📝 Nova Reflexão</h2>
        <p class="text-slate-400 text-sm mb-4">O que você aprendeu? Onde pode melhorar?</p>
        
        <textarea 
            v-model="currentNote"
            class="w-full h-32 bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-blue-800 outline-none mb-4"
            placeholder="Escreva aqui..."
        ></textarea>
        
        <button 
            @click.prevent.stop="saveReflection"
            :disabled="!currentNote.trim() || !!successMessage"
            :class="successMessage ? 'bg-green-600' : 'bg-blue-900 hover:bg-blue-800'"
            class="w-full disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition-colors"
        >
            <template v-if="successMessage">
                ✓ {{ successMessage }}
            </template>
            <template v-else>
                Salvar Reflexão
            </template>
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div class="bg-slate-800 p-6 rounded-2xl max-w-sm w-full border border-red-500/50 shadow-2xl animate-fade-in">
        <h2 class="text-xl font-bold text-red-400 mb-2">🗑️ Deletar Reflexão?</h2>
        <p class="text-slate-300 text-sm mb-6">Tem certeza que deseja deletar esta reflexão? Esta ação não pode ser desfeita.</p>
        
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


