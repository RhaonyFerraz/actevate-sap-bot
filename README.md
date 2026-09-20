# Gemini Cloud Bot — SAP Activate PWA 🤖

Chatbot PWA inteligente especializado em **Metodologia SAP Activate** e **Fit-to-Standard**, conectado diretamente à **API do Google Gemini** com suporte a multimodalidade (imagens + textos) e armazenamento na **Google File API (nuvem da Google)**.

---

## ✨ Funcionalidades

- 🧠 **Base de Conhecimento SAP Activate** embutida (Discover → Prepare → Explore)
- ☁️ **Google File API** — Upload de imagens e documentos direto para a nuvem da Google (zero bytes no seu computador)
- 💬 **Streaming em tempo real** com renderização completa de Markdown
- 🖼️ **Multimodal** — cole imagens com `Ctrl+V`, arraste ou faça upload
- 🛡️ **Zero armazenamento local** — tudo roda em RAM volátil (sem localStorage, sem indexedDB)
- 📥 **Exportação sob demanda** — baixe a conversa em `.md` ou `.json` quando quiser
- 📲 **PWA instalável** — funciona como app nativo no celular (Android/iOS) e no PC (Windows/Mac)

---

## 🚀 Como Usar Localmente

### 1. Clone o repositório
```bash
git clone https://github.com/RhaonyFerraz/actevate-sap-bot.git
cd actevate-sap-bot
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse no navegador: **http://localhost:5173**

### 4. Obtenha sua chave gratuita do Google Gemini
- Acesse [aistudio.google.com](https://aistudio.google.com/)
- Crie uma chave de API gratuita
- Cole no campo **"Chave Google AI Studio..."** no topo do app

---

## 📁 Estrutura do Projeto

```
actevate-sap-bot/
├── index.html                    # HTML5 semântico com meta tags PWA
├── vite.config.js                # Configuração do Vite
├── public/
│   ├── favicon.svg               # Ícone do app
│   ├── manifest.webmanifest      # Manifesto para instalação como PWA
│   └── sw.js                     # Service Worker
└── src/
    ├── index.css                 # Design moderno, tema escuro (glassmorphism)
    ├── main.js                   # Inicialização do app
    ├── data/
    │   └── defaultKnowledge.js   # Base de conhecimento SAP Activate embutida
    ├── state/
    │   └── sessionStore.js       # Estado 100% volátil em RAM
    ├── services/
    │   └── gemini.js             # Google Gemini API + Google File API
    └── components/
        ├── Header.js             # Barra superior: modelo, chave, PWA
        ├── KnowledgeDock.js      # Painel da Base de Conhecimento na nuvem
        ├── ChatArea.js           # Área de chat com streaming e markdown
        ├── InputBar.js           # Input com drag & drop e Ctrl+V
        └── ExportModal.js        # Exportação de conversa sob demanda
```

---

## 🛡️ Privacidade

> ⚠️ **A sua chave de API NÃO está no código!** Ela é digitada diretamente na interface e mantida apenas na memória RAM da sessão ativa. Ao fechar a aba, tudo é zerado sem deixar rastros no computador.

---

## 🔧 Build para Produção

```bash
npm run build
```

Os arquivos compilados serão gerados na pasta `dist/`.

---

## 📜 Licença

Este projeto é privado e de uso pessoal.
