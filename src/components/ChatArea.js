import { sessionStore } from '../state/sessionStore.js';
import { marked } from 'marked';

// Configuração segura do marked
marked.setOptions({
  breaks: true,
  gfm: true
});

export function renderChatArea(container) {
  function update() {
    const state = sessionStore.getState();

    if (state.messages.length === 0) {
      container.innerHTML = `
        <div class="welcome-container">
          <img src="/favicon.svg" alt="SAP Activate Bot" class="welcome-logo" />
          <h2 class="welcome-title">Especialista SAP Activate</h2>
          <p class="welcome-subtitle">
            Base de conhecimento carregada com as fases <strong>Descobrir (Discover)</strong>, <strong>Preparar (Prepare)</strong> e <strong>Explorar (Explore)</strong> com foco em <strong>Fit-to-Standard</strong> e <strong>Definição da Solução</strong>.
          </p>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 12px 0;">
            <button class="btn btn-secondary prompt-chip" data-prompt="Explique como funciona o processo de Fit-to-Standard na fase Explore e quais são as suas etapas?">
              🔍 Como funciona o Fit-to-Standard?
            </button>
            <button class="btn btn-secondary prompt-chip" data-prompt="Como os Requisitos Delta (GAPs) são convertidos em itens do Backlog na fase Explore?">
              📋 Converter Requisitos Delta em Backlog
            </button>
            <button class="btn btn-secondary prompt-chip" data-prompt="Quais são as atividades essenciais de preparação na fase Prepare antes dos workshops práticos?">
              ⚙️ Atividades da fase Prepare
            </button>
          </div>

          <div class="welcome-features">
            <div class="feature-pill">
              <span class="feature-pill-icon">📘</span>
              <div>
                <div class="feature-pill-title">Fluxo SAP Activate Ativo</div>
                <div class="feature-pill-desc">Conhecimento estruturado das 3 fases já integrado à memória do modelo.</div>
              </div>
            </div>

            <div class="feature-pill">
              <span class="feature-pill-icon">🖼️</span>
              <div>
                <div class="feature-pill-title">Análise de Diagramas e Imagens</div>
                <div class="feature-pill-desc">Arraste novos diagramas ou cole prints com Ctrl+V a qualquer momento.</div>
              </div>
            </div>

            <div class="feature-pill">
              <span class="feature-pill-icon">🛡️</span>
              <div>
                <div class="feature-pill-title">Zero Gravação no seu PC</div>
                <div class="feature-pill-desc">Tudo roda em RAM volátil. O computador permanece 100% limpo.</div>
              </div>
            </div>

            <div class="feature-pill">
              <span class="feature-pill-icon">📥</span>
              <div>
                <div class="feature-pill-title">Exportação Sob Demanda</div>
                <div class="feature-pill-desc">Salve atas e resumos técnicos em Markdown quando desejar.</div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Eventos para os chips de perguntas rápidas
      const chips = container.querySelectorAll('.prompt-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          const prompt = e.currentTarget.getAttribute('data-prompt');
          const textarea = document.getElementById('chat-textarea');
          if (textarea) {
            textarea.value = prompt;
            textarea.focus();
          }
        });
      });
      return;
    }

    let messagesHtml = '';

    for (let i = 0; i < state.messages.length; i++) {
      const msg = state.messages[i];
      const isUser = msg.role === 'user';
      const isLast = i === state.messages.length - 1;
      const showTyping = !isUser && isLast && state.isGenerating;

      let attachmentsHtml = '';
      if (msg.attachments && msg.attachments.length > 0) {
        attachmentsHtml = `
          <div class="message-attachments">
            ${msg.attachments.map(att => {
              if (att.dataUrl || (att.mimeType && att.mimeType.startsWith('image/'))) {
                return `<img src="${att.dataUrl || ''}" class="msg-thumb" alt="${att.name || 'Imagem'}" title="Clique para ampliar" onclick="window.open(this.src, '_blank')" />`;
              }
              return `<span class="pending-chip">📎 ${att.name || 'Arquivo'}</span>`;
            }).join('')}
          </div>
        `;
      }

      const parsedContent = isUser ? escapeHtml(msg.text) : marked.parse(msg.text || '');

      messagesHtml += `
        <div class="message-bubble ${isUser ? 'message-user' : 'message-bot'}">
          <div class="message-avatar ${isUser ? 'avatar-user' : 'avatar-bot'}">
            ${isUser ? '👤' : '✨'}
          </div>
          <div class="message-content ${showTyping ? 'typing-cursor' : ''}">
            ${attachmentsHtml}
            ${parsedContent}
          </div>
        </div>
      `;
    }

    container.innerHTML = messagesHtml;
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(string) {
    const p = document.createElement('p');
    p.textContent = string;
    return p.innerHTML.replace(/\n/g, '<br/>');
  }

  sessionStore.subscribe(update);
  update();
}
