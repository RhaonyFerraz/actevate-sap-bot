import { sessionStore } from '../state/sessionStore.js';

export function renderHeader(container) {
  let showKey = false;

  function update() {
    const state = sessionStore.getState();
    const hasPwaPrompt = !!state.pwaInstallPrompt;

    container.innerHTML = `
      <header class="app-header">
        <div class="brand-section">
          <img src="/favicon.svg" alt="Logo" class="brand-icon" id="header-logo" />
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h1 class="brand-title">Gemini Cloud Bot</h1>
              <span class="brand-badge" title="Roda 100% na memória RAM. Nenhum dado é salvo no seu PC!">Volátil (Zero PC Storage)</span>
            </div>
          </div>
        </div>

        <div class="header-controls">
          <!-- Seletor de Modelo -->
          <select id="select-model" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; background: var(--bg-secondary);">
            <option value="gemini-2.0-flash" ${state.selectedModel === 'gemini-2.0-flash' ? 'selected' : ''}>⚡ Gemini 2.0 Flash</option>
            <option value="gemini-1.5-flash" ${state.selectedModel === 'gemini-1.5-flash' ? 'selected' : ''}>🌟 Gemini 1.5 Flash</option>
            <option value="gemini-2.5-flash" ${state.selectedModel === 'gemini-2.5-flash' ? 'selected' : ''}>🚀 Gemini 2.5 Flash</option>
          </select>

          <!-- Input da Chave da API (Apenas em RAM) -->
          <div class="api-key-container" title="Sua chave fica segura estritamente na memória RAM da sessão ativa">
            <input 
              type="${showKey ? 'text' : 'password'}" 
              id="input-api-key" 
              class="api-key-input" 
              placeholder="Chave Google AI Studio..." 
              value="${state.apiKey}" 
            />
            <button id="btn-toggle-key-visibility" class="btn-icon-toggle" title="Mostrar/Ocultar Chave">
              ${showKey ? '👁️' : '🔒'}
            </button>
          </div>

          <!-- Botão Base de Conhecimento -->
          <button id="btn-toggle-knowledge" class="btn btn-secondary" title="Gerenciar Imagens e Textos na Nuvem">
            📁 Base de Conhecimento (${state.knowledgeFiles.length})
          </button>

          <!-- Botão Exportar Conversa Sob Demanda -->
          <button id="btn-open-export" class="btn btn-secondary" title="Baixar histórico da conversa apenas se quiser">
            📥 Salvar Conversa
          </button>

          <!-- Botão Limpar Memória -->
          <button id="btn-clear-chat" class="btn btn-danger" title="Zerar todas as mensagens da memória RAM">
            🗑️ Limpar
          </button>

          <!-- Botão Instalar PWA (se disponível) -->
          ${hasPwaPrompt ? `
            <button id="btn-install-pwa" class="btn btn-primary" title="Instalar como aplicativo no celular ou PC">
              📲 Instalar App
            </button>
          ` : ''}
        </div>
      </header>
    `;

    // Eventos
    const selectModel = container.querySelector('#select-model');
    if (selectModel) {
      selectModel.addEventListener('change', (e) => {
        sessionStore.setModel(e.target.value);
      });
    }

    const inputApiKey = container.querySelector('#input-api-key');
    if (inputApiKey) {
      inputApiKey.addEventListener('input', (e) => {
        sessionStore.setApiKey(e.target.value);
      });
    }

    const btnToggleKey = container.querySelector('#btn-toggle-key-visibility');
    if (btnToggleKey) {
      btnToggleKey.addEventListener('click', () => {
        showKey = !showKey;
        update();
      });
    }

    const btnToggleKnowledge = container.querySelector('#btn-toggle-knowledge');
    if (btnToggleKnowledge) {
      btnToggleKnowledge.addEventListener('click', () => {
        const drawer = document.getElementById('knowledge-drawer');
        if (drawer) {
          drawer.classList.toggle('drawer-open');
        }
      });
    }

    const btnOpenExport = container.querySelector('#btn-open-export');
    if (btnOpenExport) {
      btnOpenExport.addEventListener('click', () => {
        const modal = document.getElementById('export-modal');
        if (modal) {
          modal.style.display = 'flex';
        }
      });
    }

    const btnClearChat = container.querySelector('#btn-clear-chat');
    if (btnClearChat) {
      btnClearChat.addEventListener('click', () => {
        if (confirm('Deseja limpar todas as mensagens da memória volátil? Essa ação não pode ser desfeita.')) {
          sessionStore.clearSession();
        }
      });
    }

    const btnInstallPwa = container.querySelector('#btn-install-pwa');
    if (btnInstallPwa && state.pwaInstallPrompt) {
      btnInstallPwa.addEventListener('click', async () => {
        state.pwaInstallPrompt.prompt();
        const choice = await state.pwaInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          sessionStore.setPwaInstallPrompt(null);
        }
      });
    }
  }

  sessionStore.subscribe(update);
  update();
}
