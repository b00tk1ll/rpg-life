export function registerPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('✅ PWA Service Worker registrado com sucesso!')

                // Verificar atualizações periodicamente
                setInterval(() => {
                    registration.update()
                }, 60 * 60 * 1000) // Verifica a cada 1 hora

                // Detectar quando há uma nova versão disponível
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nova versão disponível
                            if (confirm('🎮 Nova versão do RPG Life disponível! Deseja atualizar agora?')) {
                                window.location.reload()
                            }
                        }
                    })
                })
            }).catch(error => {
                console.log('❌ Falha ao registrar Service Worker:', error)
            })
        })
    }
}
