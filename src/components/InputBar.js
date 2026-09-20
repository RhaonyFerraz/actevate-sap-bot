import { sessionStore } from '../state/sessionStore.js';
import { fileToBase64, streamGeminiChat } from '../services/gemini.js';

export function renderInputBar(container) {
  function update() {
    const state = sessionStore.getState();

    container.innerHTML = `
      <div class="input-dock">
        <!-- Bandeja de Pré-visualização de Anexos Pendentes -->
        ${state.pendingAttachments.length > 0 ? `
          <div class="pending-preview-tray">
            ${state.pendingAttachments.map((att, idx) => `
              <div class="pending-chip">
                ${att.dataUrl ? `<img src="${att.dataUrl}" class="pending-thumb" alt="${att.name}" />` : '📎'}
                <span>${att.name}</span>
                <button class="btn-chip-remove" data-index="${idx}" title="Remover anexo">✕</button>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Caixa de Entrada -->
        <div class="input-box" id="chat-input-box">
          <input type="file" id="chat-file-input" multiple accept="image/*,.txt,.md,.pdf" style="display: none;" />
          
          <button id="btn-attach-file" class="btn-attach" title="Anexar imagem ou documento (ou cole com Ctrl+V)">
            📎
          </button>

          <textarea 
            id="chat-textarea" 
            class="chat-textarea" 
            placeholder="Pergunte algo ou cole uma imagem com Ctrl+V..." 
            rows="1"
            ${state.isGenerating ? 'disabled' : ''}
          ></textarea>

          <button id="btn-send-message" class="btn-send" title="Enviar mensagem (Enter)" ${state.isGenerating ? 'disabled' : ''}>
            ${state.isGenerating ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    `;

    // Eventos
    const textarea = container.querySelector('#chat-textarea');
    const sendBtn = container.querySelector('#btn-send-message');
    const attachBtn = container.querySelector('#btn-attach-file');
    const fileInput = container.querySelector('#chat-file-input');
    const inputBox = container.querySelector('#chat-input-box');

    // Auto-resize do textarea
    if (textarea) {
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
      });

      // Enviar com Enter (sem Shift)
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      });

      // Suporte nativo a colar imagem com Ctrl+V
      textarea.addEventListener('paste', async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              const base64Obj = await fileToBase64(blob);
              sessionStore.addPendingAttachment({
                name: 'screenshot-' + Date.now() + '.png',
                ...base64Obj
              });
            }
          }
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', handleSendMessage);
    }

    if (attachBtn && fileInput) {
      attachBtn.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files.length > 0) {
          for (const file of e.target.files) {
            const base64Obj = await fileToBase64(file);
            sessionStore.addPendingAttachment(base64Obj);
          }
          fileInput.value = '';
        }
      });
    }

    // Drag & Drop no input
    if (inputBox) {
      inputBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        inputBox.style.borderColor = 'var(--accent-purple)';
      });

      inputBox.addEventListener('dragleave', () => {
        inputBox.style.borderColor = '';
      });

      inputBox.addEventListener('drop', async (e) => {
        e.preventDefault();
        inputBox.style.borderColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          for (const file of e.dataTransfer.files) {
            const base64Obj = await fileToBase64(file);
            sessionStore.addPendingAttachment(base64Obj);
          }
        }
      });
    }

    // Botões de remover anexo pendente
    const removeBtns = container.querySelectorAll('.btn-chip-remove');
    removeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        sessionStore.removePendingAttachment(idx);
      });
    });
  }

  async function handleSendMessage() {
    const state = sessionStore.getState();
    const textarea = container.querySelector('#chat-textarea');
    const text = textarea?.value?.trim() || '';
    const attachments = [...state.pendingAttachments];

    if (!text && attachments.length === 0) return;
    if (state.isGenerating) return;

    if (!state.apiKey) {
      alert('Por favor, informe sua chave do Google AI Studio no topo da tela antes de enviar.');
      return;
    }

    // 1. Adicionar mensagem do usuário
    sessionStore.addMessage({
      role: 'user',
      text,
      attachments
    });

    // 2. Limpar input e anexos pendentes
    if (textarea) {
      textarea.value = '';
      textarea.style.height = 'auto';
    }
    sessionStore.clearPendingAttachments();

    // 3. Adicionar placeholder para a resposta do modelo
    sessionStore.addMessage({
      role: 'model',
      text: ''
    });

    sessionStore.setIsGenerating(true);

    // 4. Iniciar streaming com Gemini
    await streamGeminiChat({
      apiKey: state.apiKey,
      model: state.selectedModel,
      messages: sessionStore.getState().messages.slice(0, -1), // Mensagens até a pergunta atual
      knowledgeFiles: state.knowledgeFiles,
      knowledgeDocuments: state.knowledgeDocuments || [],
      systemInstruction: state.systemInstruction,
      onChunk: (chunk) => {
        sessionStore.updateLastModelMessage(chunk);
      },
      onFinish: () => {
        sessionStore.setIsGenerating(false);
      },
      onError: (err) => {
        sessionStore.updateLastModelMessage(`\n\n⚠️ **Erro:** ${err.message}`);
        sessionStore.setIsGenerating(false);
      }
    });
  }

  sessionStore.subscribe(update);
  update();
}
