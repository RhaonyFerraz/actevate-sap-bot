/**
 * sessionStore.js
 * Gerenciador de estado 100% em memória RAM (volátil).
 * NENHUM dado é persistido em localStorage, indexedDB ou cookies por padrão.
 * Ao fechar a aba ou recarregar, tudo é limpo da memória.
 */

import { SAP_ACTIVATE_KNOWLEDGE } from '../data/defaultKnowledge.js';

class SessionStore {
  constructor() {
    this.state = {
      apiKey: '',
      selectedModel: 'gemini-2.0-flash',
      systemInstruction: `Você é um Consultor Especialista Sênior na Metodologia SAP Activate e no conceito Fit-to-Standard.
Você deve basear rigorosamente suas respostas nos processos e fluxos da jornada de implementação SAP Activate das fases:
1. Descobrir (Discover) - Descoberta Digital
2. Preparar (Prepare) - Avaliação Orientada pelo Negócio, Preparação do Workshop Fit-to-Standard, Lista de Integrações, Preparação do Sistema/Sandbox e Autoatendimento.
3. Explorar (Explore) - Fit-to-Standard (Demonstração, Perguntas de Configuração, Feedback, Scripts Padrão), Documentação (Decisões, Escopo, Processos, OCM, Backlog Inicial, Requisitos Delta/GAPs), Execução Hands-on pelo Cliente, e Definição da Solução (Categorização dos Deltas em Integração, Extensibilidade/RICEFW, Gerenciamento de Saídas, Análises, Dados Mestres e Documentação Aprimorada).
Sempre responda com autoridade, clareza profissional, passo a passo e relacionando as fases e etapas conforme o fluxo fornecido.`,
      knowledgeDocuments: [SAP_ACTIVATE_KNOWLEDGE], // Conhecimento estruturado de texto
      knowledgeFiles: [], // Arquivos adicionais na nuvem da Google (Google File API)
      messages: [],
      pendingAttachments: [],
      isGenerating: false,
      pwaInstallPrompt: null
    };

    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setApiKey(key) {
    this.state.apiKey = key.trim();
    this.notify();
  }

  setModel(model) {
    this.state.selectedModel = model;
    this.notify();
  }

  setSystemInstruction(instruction) {
    this.state.systemInstruction = instruction;
    this.notify();
  }

  addKnowledgeFile(fileData) {
    this.state.knowledgeFiles.push(fileData);
    this.notify();
  }

  removeKnowledgeFile(index) {
    this.state.knowledgeFiles.splice(index, 1);
    this.notify();
  }

  addPendingAttachment(attachment) {
    this.state.pendingAttachments.push(attachment);
    this.notify();
  }

  removePendingAttachment(index) {
    this.state.pendingAttachments.splice(index, 1);
    this.notify();
  }

  clearPendingAttachments() {
    this.state.pendingAttachments = [];
    this.notify();
  }

  addMessage(message) {
    this.state.messages.push({
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date(),
      ...message
    });
    this.notify();
  }

  updateLastModelMessage(chunkText) {
    const lastMsg = this.state.messages[this.state.messages.length - 1];
    if (lastMsg && lastMsg.role === 'model') {
      lastMsg.text += chunkText;
      this.notify();
    }
  }

  setIsGenerating(status) {
    this.state.isGenerating = status;
    this.notify();
  }

  setPwaInstallPrompt(prompt) {
    this.state.pwaInstallPrompt = prompt;
    this.notify();
  }

  /**
   * Limpeza total da memória RAM
   */
  clearSession() {
    this.state.messages = [];
    this.state.pendingAttachments = [];
    this.state.isGenerating = false;
    this.notify();
  }

  /**
   * Exporta a conversa sob demanda diretamente para download
   * sem salvar nada no disco local automaticamente
   */
  exportConversation(format = 'markdown') {
    if (this.state.messages.length === 0) {
      return { success: false, message: 'Nenhuma mensagem para exportar.' };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    let blob, filename;

    if (format === 'json') {
      const exportData = {
        exportedAt: new Date().toISOString(),
        model: this.state.selectedModel,
        knowledgeFilesCount: this.state.knowledgeFiles.length,
        messages: this.state.messages
      };
      blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      filename = `conversa-gemini-${timestamp}.json`;
    } else {
      // Markdown
      let md = `# Histórico de Conversa - Gemini Bot\n`;
      md += `*Exportado em: ${new Date().toLocaleString('pt-BR')}*\n`;
      md += `*Modelo: ${this.state.selectedModel}*\n\n`;

      if (this.state.knowledgeFiles.length > 0) {
        md += `## Base de Conhecimento Utilizada na Nuvem\n`;
        this.state.knowledgeFiles.forEach((file, idx) => {
          md += `- [${idx + 1}] **${file.displayName || file.name}** (${file.mimeType})\n`;
        });
        md += `\n---\n\n`;
      }

      md += `## Mensagens\n\n`;
      for (const msg of this.state.messages) {
        const autor = msg.role === 'user' ? '👤 Você' : '✨ Gemini';
        md += `### ${autor} *(${new Date(msg.timestamp).toLocaleTimeString('pt-BR')})*\n\n`;
        
        if (msg.attachments && msg.attachments.length > 0) {
          md += `*Anexos:*\n`;
          for (const att of msg.attachments) {
            md += `- 📎 ${att.name || 'Arquivo/Imagem'} (${att.mimeType})\n`;
          }
          md += `\n`;
        }

        md += `${msg.text}\n\n---\n\n`;
      }

      blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      filename = `conversa-gemini-${timestamp}.md`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, filename };
  }
}

export const sessionStore = new SessionStore();
