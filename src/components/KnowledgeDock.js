import { sessionStore } from '../state/sessionStore.js';
import { uploadToGoogleFileAPI } from '../services/gemini.js';

export function renderKnowledgeDock(container) {
  let isUploading = false;
  let uploadStatusText = '';

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function getFileIcon(mimeType, name) {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.includes('pdf')) return '📕';
    if (name?.endsWith('.md') || name?.endsWith('.txt')) return '📝';
    return '📄';
  }

  function update() {
    const state = sessionStore.getState();

    container.innerHTML = `
      <aside class="knowledge-drawer" id="knowledge-drawer">
        <div class="drawer-header">
          <div class="drawer-title">
            <span>🧠 Conhecimento</span>
            <span class="cloud-tag">Google Cloud</span>
          </div>
          <button id="btn-close-drawer" class="btn-icon-toggle" title="Fechar painel">✕</button>
        </div>

        <div class="drawer-body">
          <!-- Zona de Upload para a Nuvem da Google -->
          <div class="upload-zone ${isUploading ? 'uploading' : ''}" id="cloud-drop-zone">
            <input type="file" id="cloud-file-input" multiple accept="image/*,.txt,.md,.pdf" style="display: none;" />
            <span class="upload-icon">${isUploading ? '⏳' : '☁️'}</span>
            <div class="upload-text-main">
              ${isUploading ? 'Enviando para o Google File API...' : 'Abastecer com Imagens ou Textos'}
            </div>
            <div class="upload-text-sub">
              ${isUploading ? uploadStatusText : 'Clique ou arraste imagens e documentos (.pdf, .txt, .md)'}
            </div>
          </div>

          <!-- Lista de Arquivos Ativos no Contexto -->
          <!-- Base de Conhecimento Estruturada Ativa -->
          <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-top: 8px;">
            Conhecimento Ativo no Bot (${(state.knowledgeDocuments || []).length})
          </div>

          <div class="knowledge-list">
            ${(state.knowledgeDocuments || []).map((doc) => `
              <div class="knowledge-item" style="border-left: 3px solid var(--accent-blue);">
                <div class="knowledge-item-info">
                  <span class="knowledge-item-icon">📘</span>
                  <div>
                    <div class="knowledge-item-name">${doc.displayName}</div>
                    <div class="knowledge-item-size">Processos Standard & Fit-to-Standard</div>
                  </div>
                </div>
                <span style="font-size: 0.7rem; color: var(--success); font-weight: 600;">ATIVO</span>
              </div>
            `).join('')}
          </div>

          <!-- Arquivos Adicionais na Nuvem -->
          <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-top: 14px;">
            Arquivos Adicionais na Nuvem (${state.knowledgeFiles.length})
          </div>

          <div class="knowledge-list" id="knowledge-list">
            ${state.knowledgeFiles.length === 0 ? `
              <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 12px 0;">
                Nenhum arquivo extra na nuvem.<br/>Você pode subir mais diagramas e PDFs acima!
              </div>
            ` : state.knowledgeFiles.map((file, index) => `
              <div class="knowledge-item" title="${file.uri || ''}">
                <div class="knowledge-item-info">
                  <span class="knowledge-item-icon">${getFileIcon(file.mimeType, file.displayName || file.name)}</span>
                  <div>
                    <div class="knowledge-item-name">${file.displayName || file.name}</div>
                    <div class="knowledge-item-size">${formatBytes(file.sizeBytes || file.size)} • Nuvem Google</div>
                  </div>
                </div>
                <button class="btn-remove-item" data-index="${index}" title="Remover do contexto">✕</button>
              </div>
            `).join('')}
          </div>

          <!-- Aviso de Zero Gravação Local -->
          <div class="privacy-notice">
            🛡️ <strong>Zero Espaço no seu Aparelho:</strong><br/>
            Estes arquivos são enviados e hospedados diretamente nos servidores da <strong>Google File API</strong> e lidos na nuvem pelo Gemini. Nada fica salvo no seu disco rígido!
          </div>
        </div>
      </aside>
    `;

    // Eventos
    const btnCloseDrawer = container.querySelector('#btn-close-drawer');
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener('click', () => {
        const drawer = document.getElementById('knowledge-drawer');
        if (drawer) drawer.classList.remove('drawer-open');
      });
    }

    const dropZone = container.querySelector('#cloud-drop-zone');
    const fileInput = container.querySelector('#cloud-file-input');

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => {
        if (!sessionStore.getState().apiKey) {
          alert('Por favor, digite sua chave do Google AI Studio no topo antes de subir arquivos para a nuvem da Google.');
          return;
        }
        fileInput.click();
      });

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFilesUpload(e.dataTransfer.files);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFilesUpload(e.target.files);
        }
      });
    }

    // Botões de remover arquivo da nuvem
    const removeBtns = container.querySelectorAll('.btn-remove-item');
    removeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        sessionStore.removeKnowledgeFile(idx);
      });
    });
  }

  async function handleFilesUpload(fileList) {
    const state = sessionStore.getState();
    if (!state.apiKey) {
      alert('Por favor, informe sua chave do Google AI Studio no topo antes de enviar arquivos para a nuvem da Google.');
      return;
    }

    isUploading = true;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      uploadStatusText = `Enviando "${file.name}" (${i + 1}/${fileList.length})...`;
      update();

      try {
        const googleCloudFile = await uploadToGoogleFileAPI(file, state.apiKey);
        sessionStore.addKnowledgeFile({
          displayName: file.name,
          name: googleCloudFile.name,
          uri: googleCloudFile.uri,
          mimeType: googleCloudFile.mimeType,
          sizeBytes: googleCloudFile.sizeBytes
        });
      } catch (err) {
        alert(`Erro ao enviar "${file.name}": ${err.message}`);
      }
    }

    isUploading = false;
    uploadStatusText = '';
    update();
  }

  sessionStore.subscribe(update);
  update();
}
