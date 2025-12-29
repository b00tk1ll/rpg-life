<script setup>
import { useHabitStore } from '../stores/habits'
import { useGameStore } from '../stores/game'
import TutorialOverlay from '../components/TutorialOverlay.vue'
import BaseModal from '../components/BaseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import HabitItem from '../components/HabitItem.vue'
import { computed, ref, onMounted } from 'vue'
import { Trash2, Plus } from 'lucide-vue-next'

const habitStore = useHabitStore()
const gameStore = useGameStore()

// Tutorial state
const showTutorial = ref(false)

onMounted(() => {
  if (!gameStore.onboarding.visitedViews.habits && 
      !gameStore.onboarding.skippedTutorials &&
      gameStore.onboarding.completed) {
    setTimeout(() => {
      showTutorial.value = true
    }, 300)
  }
})

const closeTutorial = () => {
  gameStore.markViewVisited('habits')
  showTutorial.value = false
}

const skipAllTutorials = () => {
  gameStore.skipAllTutorials()
  showTutorial.value = false
}

const positiveHabits = computed(() => habitStore.habits.filter(h => h.type === 'positive'))
const negativeHabits = computed(() => habitStore.habits.filter(h => h.type === 'negative'))

// Modal state
const showHabitModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const selectedType = ref('positive')
const newHabitText = ref('')
const newHabitXp = ref(10)

// Delete state
const showDeleteConfirm = ref(false)
const habitToDelete = ref(null)

const openAddModal = (type) => {
  isEditing.value = false
  editingId.value = null
  selectedType.value = type
  newHabitText.value = ''
  newHabitXp.value = 10
  showHabitModal.value = true
}

const openEditModal = (habit) => {
    isEditing.value = true
    editingId.value = habit.id
    selectedType.value = habit.type
    newHabitText.value = habit.text
    // For negative habits, the penalty is roughly double the base value we want to show as 'input'.
    // Storing mechanism: 
    // positive: xp = value, penalty = 0
    // negative: xp = 0, penalty = value * 2
    // So to get the input 'value', we divide penalty by 2 for negative habits.
    newHabitXp.value = habit.type === 'positive' ? habit.xp : (habit.penalty / 2)
    showHabitModal.value = true
}

const saveHabit = () => {
  if (!newHabitText.value.trim()) return
  
  if (isEditing.value) {
      habitStore.updateHabit(editingId.value, newHabitText.value, selectedType.value, parseInt(newHabitXp.value))
  } else {
      habitStore.addHabit(newHabitText.value, selectedType.value, parseInt(newHabitXp.value))
  }
  
  showHabitModal.value = false
}

const handleHabitClick = (habit) => {
    habitStore.triggerHabit(habit.id)
}

const handleLongPress = (habit) => {
    habitToDelete.value = habit.id
    showDeleteConfirm.value = true
}

const confirmDeleteFromModal = () => {
    isEditing.value = false
    showHabitModal.value = false
    habitToDelete.value = editingId.value
    showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (habitToDelete.value) {
    habitStore.removeHabit(habitToDelete.value)
  }
  showDeleteConfirm.value = false
  habitToDelete.value = null
}
</script>

<template>
  <div class="space-y-6 pb-20">
    <!-- Positive Habits -->
    <section class="bg-slate-800 rounded-xl p-4 border border-blue-900 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-green-400">✨ Hábitos Positivos</h2>
        <button @click="openAddModal('positive')" class="bg-green-600 hover:bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
          <Plus :size="20" />
        </button>
      </div>
      <div class="grid grid-cols-1 gap-3">
        <HabitItem
          v-for="habit in positiveHabits"
          :key="habit.id"
          :habit="habit"
          type="positive"
          @click="handleHabitClick"
          @long-press="openEditModal"
          @edit="openEditModal"
        />
      </div>
    </section>

    <!-- Negative Habits -->
    <section class="bg-slate-800 rounded-xl p-4 border border-red-900 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-red-400">💀 Hábitos Negativos</h2>
        <button @click="openAddModal('negative')" class="bg-red-600 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
          <Plus :size="20" />
        </button>
      </div>
      <div class="grid grid-cols-1 gap-3">
        <HabitItem
          v-for="habit in negativeHabits"
          :key="habit.id"
          :habit="habit"
          type="negative"
          @click="handleHabitClick"
          @long-press="openEditModal"
          @edit="openEditModal"
        />
      </div>
      <p class="text-xs text-red-300 mt-2 text-center opacity-70">
        ⚠️ Penalidade é o dobro do ganho! Cuidado.
      </p>
    </section>

    <!-- Tutorial Overlay -->
    <TutorialOverlay 
      v-if="showTutorial"
      title="❤️ Hábitos"
      icon="❤️"
      :content="[
        'Bem-vindo à seção de Hábitos! Aqui você rastreia comportamentos diários que formam a base do seu crescimento.',
        'Hábitos positivos concedem XP quando completados. Hábitos negativos causam penalidade (o dobro do valor) se você ceder a eles.'
      ]"
      :tips="[
        'Marque hábitos todos os dias para criar sequências (streaks)',
        'Quanto maior a consistência, maior o progresso!',
        'Comece com 2-3 hábitos e adicione mais gradualmente',
        'Hábitos negativos têm penalidade dobrada - use com cuidado',
        'Pressione e segure um hábito para deletá-lo'
      ]"
      @close="closeTutorial"
      @skip-all="skipAllTutorials"
    />

    <!-- Add/Edit Habit Modal -->
    <BaseModal
      :show="showHabitModal"
      :title="isEditing ? (selectedType === 'positive' ? 'Editar Hábito Positivo' : 'Editar Hábito Negativo') : (selectedType === 'positive' ? 'Novo Hábito Positivo' : 'Novo Hábito Negativo')"
      :border-color="selectedType === 'positive' ? 'border-green-500' : 'border-red-500'"
      @close="showHabitModal = false"
    >
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Nome do Hábito</label>
            <input 
              v-model="newHabitText" 
              type="text" 
              placeholder="Ex: Beber água" 
              class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-indigo-500 outline-none"
              @keyup.enter="saveHabit"
              autofocus
            >
          </div>
          
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
              {{ selectedType === 'positive' ? 'Valor de XP' : 'Penalidade Base' }}
            </label>
            <input 
              v-model.number="newHabitXp" 
              type="number" 
              min="1"
              class="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-indigo-500 outline-none"
            >
             <p v-if="selectedType === 'negative'" class="text-xs text-red-400 mt-1">
                A penalidade real será o dobro: -{{ newHabitXp * 2 }} XP
            </p>
          </div>
          
          <div class="flex gap-3">
            <button 
              v-if="isEditing"
              @click="confirmDeleteFromModal"
              class="bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200 p-3 rounded transition-colors"
              title="Deletar Hábito"
            >
              <Trash2 :size="20" />
            </button>
            <button 
              @click="saveHabit"
              :disabled="!newHabitText.trim()"
              class="flex-1 font-bold py-3 rounded disabled:bg-slate-600 transition-colors text-white"
              :class="selectedType === 'positive' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'"
            >
              {{ isEditing ? 'Salvar Alterações' : 'Adicionar Hábito' }}
            </button>
          </div>
        </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteConfirm"
      title="Deletar Hábito?"
      message="Tem certeza que deseja deletar este hábito? Esta ação não pode ser desfeita."
      confirm-text="Deletar"
      cancel-text="Cancelar"
      type="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>


