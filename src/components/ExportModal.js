import { sessionStore } from '../state/sessionStore.js';

export function renderExportModal(container) {
  container.innerHTML = `
    <div class="modal-backdrop" id="export-modal" style="display: none;">
      <div class="modal-card">
        <div class="modal-title">
          <span>📥 Salvar / Exportar Conversa</span>
        </div>
        <p class="modal-desc">
          Sua conversa é mantida estritamente na memória volátil (RAM). Ao clicar abaixo, o arquivo será gerado e baixado <strong>diretamente para seus Downloads</strong> sob sua demanda.
        </p>

        <div class="export-options">
          <div class="export-btn-card" id="btn-export-md">
            <div>
              <div style="font-weight: 600;">📄 Formato Markdown (.md)</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                Perfeito para ler no Obsidian, Notion ou qualquer editor de texto.
              </div>
            </div>
            <span style="font-size: 1.2rem;">➔</span>
          </div>

          <div class="export-btn-card" id="btn-export-json">
            <div>
              <div style="font-weight: 600;">💾 Formato JSON (.json)</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                Estrutura de dados completa para desenvolvedores e backup técnico.
              </div>
            </div>
            <span style="font-size: 1.2rem;">➔</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" id="btn-close-export-modal">Fechar</button>
        </div>
      </div>
    </div>
  `;

  const modal = container.querySelector('#export-modal');
  const btnClose = container.querySelector('#btn-close-export-modal');
  const btnExportMd = container.querySelector('#btn-export-md');
  const btnExportJson = container.querySelector('#btn-export-json');

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  if (btnExportMd) {
    btnExportMd.addEventListener('click', () => {
      const res = sessionStore.exportConversation('markdown');
      if (!res.success) {
        alert(res.message);
      } else {
        modal.style.display = 'none';
      }
    });
  }

  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const res = sessionStore.exportConversation('json');
      if (!res.success) {
        alert(res.message);
      } else {
        modal.style.display = 'none';
      }
    });
  }
}
