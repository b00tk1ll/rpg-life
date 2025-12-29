<script setup>
import { useReflectionStore } from '../stores/reflections'
import { useGameStore } from '../stores/game'
import TutorialOverlay from '../components/TutorialOverlay.vue'
import BaseModal from '../components/BaseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Eye, Pencil, Trash2, MoreVertical, Plus } from 'lucide-vue-next'

const reflectionStore = useReflectionStore()
const gameStore = useGameStore()
const reflections = computed(() => reflectionStore.reflections)

// Tutorial state
const showTutorial = ref(false)

onMounted(() => {
  // Tutorial logic
  if (!gameStore.onboarding.visitedViews.reflection && 
      !gameStore.onboarding.skippedTutorials &&
      gameStore.onboarding.completed) {
    setTimeout(() => {
      showTutorial.value = true
    }, 300)
  }
  
  // Click outside listener for dropdowns
  document.addEventListener('click', handleClickOutside)
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

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  // Check if click is outside dropdown menu
  if (openMenuId.value !== null && !event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-trigger')) {
    openMenuId.value = null
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const isViewing = ref(false)
const activeId = ref(null)
const currentNote = ref('')
const successMessage = ref('')

// Delete state
const showDeleteConfirm = ref(false)
const reflectionToDelete = ref(null)

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const openAddModal = () => {
    isEditing.value = false
    isViewing.value = false
    activeId.value = null
    currentNote.value = ''
    successMessage.value = ''
    showModal.value = true
}

const viewReflection = (reflection) => {
    openMenuId.value = null
    isEditing.value = false
    isViewing.value = true
    activeId.value = reflection.id
    currentNote.value = reflection.text
    showModal.value = true
}

const editReflection = (reflection) => {
    openMenuId.value = null
    isEditing.value = true
    isViewing.value = false
    activeId.value = reflection.id
    currentNote.value = reflection.text
    showModal.value = true
    
    // If coming from view mode
    if (isViewing.value) isViewing.value = false
}

const switchToEdit = () => {
    isEditing.value = true
    isViewing.value = false
}

const saveReflection = () => {
    if (!currentNote.value || !currentNote.value.trim()) return
    
    if (isEditing.value) {
        reflectionStore.updateReflection(activeId.value, currentNote.value)
        successMessage.value = 'Reflexão atualizada!'
    } else {
        reflectionStore.addReflection(currentNote.value)
        successMessage.value = 'Reflexão salva! ✨'
    }
    
    setTimeout(() => {
        showModal.value = false
        successMessage.value = ''
        currentNote.value = ''
    }, 1000)
}

const closeModal = () => {
    showModal.value = false
    currentNote.value = ''
    successMessage.value = ''
}

const promptDelete = (reflection) => {
    openMenuId.value = null
    reflectionToDelete.value = reflection
    showDeleteConfirm.value = true
}

const confirmDelete = () => {
    if (reflectionToDelete.value) {
        reflectionStore.deleteReflection(reflectionToDelete.value.id)
    }
    showDeleteConfirm.value = false
    reflectionToDelete.value = null
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
                          class="dropdown-trigger text-slate-400 hover:text-white transition-colors p-1"
                      >
                          <MoreVertical :size="20" />
                      </button>
                      <!-- Dropdown Menu -->
                      <div 
                          v-if="openMenuId === r.id"
                          class="dropdown-menu absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 min-w-[140px] overflow-hidden"
                      >
                          <button 
                              @click="viewReflection(r)"
                              class="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
                          >
                              <Eye :size="16" class="text-blue-400" /> Ver
                          </button>
                          <button 
                              @click="editReflection(r)"
                              class="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
                          >
                              <Pencil :size="16" class="text-slate-400" /> Editar
                          </button>
                          <button 
                              @click="promptDelete(r)"
                              class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
                          >
                              <Trash2 :size="16" /> Excluir
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
      @click="openAddModal"
      class="fixed bottom-24 right-4 bg-blue-900 hover:bg-blue-800 text-white w-14 h-14 rounded-full shadow-lg transition hover:scale-110 flex items-center justify-center text-2xl"
      title="Adicionar Reflexão"
    >
      <Plus :size="32" />
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

    <!-- Unified Reflection Modal (Add / View / Edit) -->
    <BaseModal
      :show="showModal"
      :title="isViewing ? 'Reflexão' : (isEditing ? 'Editar Reflexão' : 'Nova Reflexão')"
      border-color="border-blue-800"
      max-width="max-w-md"
      @close="closeModal"
    >
        <!-- View Mode Text -->
        <div v-if="isViewing" class="space-y-4">
             <div class="bg-slate-900 p-4 rounded border border-slate-700 max-h-96 overflow-y-auto">
                <p class="text-slate-200 whitespace-pre-wrap">{{ currentNote }}</p>
            </div>
            <button 
                @click="switchToEdit"
                class="w-full bg-slate-700 hover:bg-blue-900 text-white font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
            >
                <Pencil :size="18" /> Editar
            </button>
        </div>

        <!-- Edit/Add Mode Inputs -->
        <div v-else class="space-y-4">
            <p v-if="!isEditing" class="text-slate-400 text-sm">O que você aprendeu? Onde pode melhorar?</p>
            <textarea 
                v-model="currentNote"
                class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-blue-800 outline-none resize-none"
                :class="isEditing ? 'h-64' : 'h-32'"
                placeholder="Escreva aqui..."
                autofocus
            ></textarea>

            <button 
                @click="saveReflection"
                :disabled="!currentNote.trim() || !!successMessage"
                :class="successMessage ? 'bg-green-600' : 'bg-blue-900 hover:bg-blue-800'"
                class="w-full disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition-colors"
            >
                {{ successMessage ? `✓ ${successMessage}` : (isEditing ? 'Salvar Alterações' : 'Salvar Reflexão') }}
            </button>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteConfirm"
      title="Deletar Reflexão?"
      message="Tem certeza que deseja deletar esta reflexão? Esta ação não pode ser desfeita."
      confirm-text="Deletar"
      cancel-text="Cancelar"
      type="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>


