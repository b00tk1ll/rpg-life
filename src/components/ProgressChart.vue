<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useGameStore } from '../stores/game'
import { computed } from 'vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const gameStore = useGameStore()

// Helper to get date string
const getDateString = (daysOffset) => {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().split('T')[0]
}

const chartData = computed(() => {
  const history = gameStore.history
  
  // Generate 7 days: 3 before, today, 3 after
  const days = []
  const dayLabels = []
  
  for (let i = -3; i <= 3; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().split('T')[0])
    
    if (i === 0) {
      dayLabels.push('Hoje')
    } else {
      dayLabels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
    }
  }

  // Calculate XP for each day from history
  // Group history by date and sum XP changes
  const xpByDay = {}
  days.forEach(day => xpByDay[day] = 0)

  // Sum XP changes per day
  history.forEach(entry => {
    if (entry.type === 'xp_gain' || entry.type === 'xp_loss') {
      if (xpByDay[entry.date] !== undefined) {
        xpByDay[entry.date] += entry.value
      }
    }
  })

  // Calculate cumulative XP up to each day
  // Start from current XP and work backwards
  const todayStr = getDateString(0)
  const dataPoints = []
  
  // For simplicity, show the XP delta for each day (gains/losses that day)
  // Future days show 0
  days.forEach((day, index) => {
    if (index <= 3) { // Past days and today
      dataPoints.push(xpByDay[day] || 0)
    } else { // Future days
      dataPoints.push(null) // No data for future
    }
  })

  return {
    labels: dayLabels,
    datasets: [
      {
        label: 'XP do Dia',
        backgroundColor: 'rgba(56, 189, 248, 0.3)',
        borderColor: '#38BDF8',
        pointBackgroundColor: '#FACC15',
        pointRadius: 6,
        data: dataPoints,
        fill: true,
        tension: 0.3
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { 
        backgroundColor: '#0F172A',
        titleColor: '#FACC15',
        bodyColor: '#fff',
        borderColor: '#16357D',
        borderWidth: 1
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMin: 0,
      suggestedMax: 50,
      ticks: { 
        color: '#94a3b8',
        stepSize: 10
      },
      grid: { color: '#1e293b' }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8' }
    }
  }
}
</script>

<template>
  <div class="w-full h-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
