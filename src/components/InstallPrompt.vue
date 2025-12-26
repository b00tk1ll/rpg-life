<template>
  <Transition name="slide-up">
    <div v-if="shouldShowPrompt" class="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div class="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl shadow-2xl p-4 backdrop-blur-lg border border-white/20">
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div class="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Download class="w-6 h-6 text-white" />
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-white font-bold text-sm mb-1">
              Instalar RPG Life
            </h3>
            <p class="text-white/90 text-xs mb-3">
              Instale o app no seu dispositivo e use offline!
            </p>
            
            <!-- Buttons -->
            <div class="flex gap-2">
              <button
                @click="installApp"
                class="flex-1 bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/90 transition-all transform hover:scale-105 active:scale-95"
              >
                Instalar
              </button>
              <button
                @click="dismissPrompt"
                class="px-4 py-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
          
          <!-- Close button -->
          <button
            @click="dismissPrompt"
            class="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
  
  <!-- Install Button (Fixed Bottom Right) - Only on Home -->
  <Transition name="scale">
    <button
      v-if="shouldShowButton"
      @click="showPrompt"
      class="fixed bottom-24 right-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-110 active:scale-95 z-40 group"
      title="Instalar App"
    >
      <Download class="w-6 h-6" />
      <span class="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Instalar App
      </span>
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Download, X } from 'lucide-vue-next'

const route = useRoute()
const showInstallPrompt = ref(false)
const showInstallButton = ref(false)
const canInstall = ref(false)
const isMobile = ref(false)
let deferredPrompt = null

const DISMISS_KEY = 'pwa_install_dismissed_at'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 dias em milissegundos

// Mostrar apenas na home
const isHome = computed(() => route.path === '/')

// Mostrar prompt apenas se estiver na home E o prompt estiver ativo
const shouldShowPrompt = computed(() => isHome.value && showInstallPrompt.value)

// Mostrar botão apenas se estiver na home E puder instalar
const shouldShowButton = computed(() => isHome.value && showInstallButton.value)

// Verificar se o usuário dispensou recentemente
function wasDismissedRecently() {
  const dismissedAt = localStorage.getItem(DISMISS_KEY)
  if (!dismissedAt) return false
  
  const dismissTime = parseInt(dismissedAt)
  const now = Date.now()
  const timePassed = now - dismissTime
  
  console.log(`⏱️ Tempo desde última dispensa: ${Math.floor(timePassed / (1000 * 60 * 60 * 24))} dias`)
  
  return timePassed < DISMISS_DURATION
}

onMounted(() => {
  console.log('🔍 InstallPrompt: Component mounted')
  
  // Verificar se foi dispensado recentemente
  if (wasDismissedRecently()) {
    console.log('⏸️ Usuário dispensou recentemente - aguardando 7 dias')
    return
  }
  
  // Detectar dispositivo móvel
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  isMobile.value = /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase())
  const isAndroid = /android/i.test(userAgent.toLowerCase())
  const isIOS = /iphone|ipad|ipod/i.test(userAgent.toLowerCase())
  
  console.log('📱 User Agent:', userAgent)
  console.log('📱 Is Mobile:', isMobile.value)
  console.log('📱 Is Android:', isAndroid)
  console.log('🍎 Is iOS:', isIOS)
  
  // Detectar se o app já está instalado
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isInWebAppiOS = window.navigator['standalone'] === true
  
  console.log('📱 Display mode standalone:', isStandalone)
  console.log('🍎 iOS web app mode:', isInWebAppiOS)
  
  if (isStandalone || isInWebAppiOS) {
    console.log('✅ App já está instalado - não mostrar prompt')
    return
  }
  
  console.log('⏳ Aguardando evento beforeinstallprompt...')
  
  // Capturar o evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🎯 Evento beforeinstallprompt capturado!')
    // Prevenir o prompt padrão do navegador
    e.preventDefault()
    // Guardar o evento para usar depois
    deferredPrompt = e
    canInstall.value = true
    
    // Mostrar notificação após 3 segundos (apenas na home)
    setTimeout(() => {
      if (route.path === '/') {
        console.log('📢 Mostrando notificação de instalação (Home)')
        showInstallPrompt.value = true
      }
      showInstallButton.value = true
    }, 3000)
  })
  
  // Detectar quando o app for instalado
  window.addEventListener('appinstalled', () => {
    console.log('✅ App instalado com sucesso!')
    showInstallPrompt.value = false
    showInstallButton.value = false
    canInstall.value = false
    deferredPrompt = null
    // Limpar registro de dispensa
    localStorage.removeItem(DISMISS_KEY)
  })
  
  // Fallback para Android: mostrar botão mesmo sem evento
  setTimeout(() => {
    if (!deferredPrompt && !isStandalone && !isInWebAppiOS) {
      console.log('⚠️ Evento beforeinstallprompt não foi disparado')
      
      // Em dispositivos Android Chrome, mostrar o botão mesmo assim
      if (isAndroid && userAgent.includes('Chrome')) {
        console.log('📱 Android Chrome detectado - mostrando botão de instalação')
        showInstallButton.value = true
        canInstall.value = false // marca que não tem deferredPrompt
        
        // Mostrar notificação também
        if (route.path === '/') {
          setTimeout(() => {
            showInstallPrompt.value = true
          }, 500)
        }
      } else {
        console.log('💡 Motivos possíveis:')
        console.log('   - Navegador não suporta (Firefox, Safari)')
        console.log('   - App já foi instalado anteriormente')
        console.log('   - Critérios do PWA não foram atendidos')
      }
    }
  }, 5000)
})

async function installApp() {
  console.log('🚀 Install button clicked')
  
  if (!deferredPrompt) {
    console.log('❌ deferredPrompt não disponível')
    
    // Instruções específicas por plataforma
    const userAgent = navigator.userAgent || ''
    const isAndroid = /android/i.test(userAgent)
    const isIOS = /iphone|ipad|ipod/i.test(userAgent)
    
    let message = 'Para instalar este app:\n\n'
    
    if (isAndroid) {
      message += '📱 Android (Chrome):\n'
      message += '1. Toque no menu (⋮) no canto superior direito\n'
      message += '2. Selecione "Instalar app" ou "Adicionar à tela inicial"\n'
      message += '3. Confirme a instalação'
    } else if (isIOS) {
      message += '🍎 iPhone/iPad (Safari):\n'
      message += '1. Toque no botão Compartilhar (□↑)\n'
      message += '2. Role para baixo e toque em "Adicionar à Tela de Início"\n'
      message += '3. Toque em "Adicionar"'
    } else {
      message += 'Chrome/Edge Desktop:\n'
      message += 'Clique no menu (⋮) e selecione "Instalar App"'
    }
    
    alert(message)
    return
  }
  
  console.log('📱 Mostrando prompt de instalação...')
  
  // Mostrar o prompt de instalação
  deferredPrompt.prompt()
  
  // Aguardar a escolha do usuário
  const { outcome } = await deferredPrompt.userChoice
  
  console.log('👤 Usuário escolheu:', outcome)
  
  if (outcome === 'accepted') {
    console.log('✅ Usuário aceitou a instalação')
    // Limpar registro de dispensa
    localStorage.removeItem(DISMISS_KEY)
  } else {
    console.log('❌ Usuário recusou a instalação')
  }
  
  // Resetar o prompt
  deferredPrompt = null
  showInstallPrompt.value = false
}

function dismissPrompt() {
  console.log('👋 Usuário dispensou a notificação')
  
  // Salvar timestamp da dispensa
  const now = Date.now()
  localStorage.setItem(DISMISS_KEY, now.toString())
  console.log('💾 Dispensa salva - não mostrar por 7 dias')
  
  // Esconder tudo
  showInstallPrompt.value = false
  showInstallButton.value = false
}

function showPrompt() {
  if (canInstall.value) {
    showInstallPrompt.value = true
  } else {
    installApp()
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(2rem);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
