import './index.css';
import { sessionStore } from './state/sessionStore.js';
import { renderHeader } from './components/Header.js';
import { renderKnowledgeDock } from './components/KnowledgeDock.js';
import { renderChatArea } from './components/ChatArea.js';
import { renderInputBar } from './components/InputBar.js';
import { renderExportModal } from './components/ExportModal.js';

// Inicializar aplicativo
function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <div class="ambient-glow glow-top-left"></div>
    <div class="ambient-glow glow-bottom-right"></div>

    <div id="header-container"></div>
    
    <div class="main-content">
      <div id="knowledge-container"></div>
      <main class="chat-section">
        <div class="chat-history" id="chat-container"></div>
        <div id="input-container"></div>
      </main>
    </div>

    <div id="modal-container"></div>
  `;

  // Renderizar componentes
  renderHeader(document.getElementById('header-container'));
  renderKnowledgeDock(document.getElementById('knowledge-container'));
  renderChatArea(document.getElementById('chat-container'));
  renderInputBar(document.getElementById('input-container'));
  renderExportModal(document.getElementById('modal-container'));

  // Registrar PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Service Worker PWA registrado com sucesso:', reg.scope))
        .catch((err) => console.log('Falha no registro do Service Worker:', err));
    });
  }

  // Capturar evento de instalação do PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    sessionStore.setPwaInstallPrompt(e);
  });
}

document.addEventListener('DOMContentLoaded', initApp);
