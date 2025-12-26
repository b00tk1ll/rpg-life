# RPG Life ⚔️

**RPG Life** é uma aplicação de produtividade gamificada projetada para transformar suas tarefas diárias, hábitos e reflexões em uma jornada de RPG épica. Ganhe XP, suba de nível e melhore seu personagem enquanto gerencia sua vida real.

## 🚀 Funcionalidades

- **Missões (Missions):** Gerencie suas tarefas pendentes. Conclua missões para ganhar XP.
- **Hábitos (Habits):** Acompanhe suas rotinas diárias e mantenha a consistência.
- **Reflexões (Reflexões):** Um espaço para registrar seus pensamentos e progresso mental.
- **Loja (Shop):** Gaste seu ouro (ou pontos) em recompensas.
- **Sistema de Nível:** Evolua seu avatar (gerado dinamicamente com Minidenticons) conforme completa objetivos.
- **PWA Ready:** Instale a aplicação no seu celular ou desktop para acesso rápido.
- **IA Integration:** Dicas inteligentes e ajuda com a "Regra dos 2 Minutos".

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Vue.js 3](https://vuejs.org/) (Composition API)
- **Estado:** [Pinia](https://pinia.vuejs.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Arquitetura:** [Vite](https://vitejs.dev/)
- **Ícones:** [Lucide Vue Next](https://lucide.dev/guide/packages/lucide-vue-next)
- **Gráficos:** [Chart.js](https://www.chartjs.org/) com `vue-chartjs`
- **Avatares:** [Minidenticons](https://github.com/laurentpayot/minidenticons)
- **PWA:** `vite-plugin-pwa`

## 📦 Como Instalar e Rodar

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd RPG_LIFE
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione sua chave da API (se necessário):
    ```env
    VITE_OPENROUTER_API_KEY=sua_chave_aqui
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  **Build para produção:**
    ```bash
    npm run build
    ```

## 📄 Licença

Este projeto está sob a licença ISC. Confira o arquivo [package.json](package.json) para mais detalhes.

---
Feito com ❤️ para gamificar a vida!
