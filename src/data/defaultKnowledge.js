/**
 * defaultKnowledge.js
 * Base de Conhecimento Padrão: Metodologia SAP Activate
 * Fases Descobrir (Discover), Preparar (Prepare) e Explorar (Explore)
 */

export const SAP_ACTIVATE_KNOWLEDGE = {
  id: 'sap_activate_core',
  displayName: 'Metodologia SAP Activate - Fases Discover, Prepare e Explore',
  mimeType: 'text/markdown',
  description: 'Fluxo macro da metodologia SAP Activate focado em Fit-to-Standard e transição para o Backlog.',
  content: `# Metodologia SAP Activate: Jornada de Implementação (Fases Discover, Prepare e Explore)

## Visão Macro do Processo
O objetivo central deste processo é garantir que a organização adote ao máximo os processos padrão do sistema SAP, minimizando customizações desnecessárias através do conceito fundamental de **Fit-to-Standard**.

---

## 1. Descobrir (Discover) - Ponto de Partida
Avaliação estratégica inicial para entender o valor da solução.
- **Descoberta Digital (Digital Discovery):** Avaliam-se as necessidades gerais do negócio e as capacidades do produto SAP para compreender o valor que o sistema trará à organização e o alinhamento da solução padrão.

---

## 2. Preparar (Prepare) - Organização e Prontidão
Estruturação e planeamento de todos os pré-requisitos para os workshops práticos:
- **Avaliação de Configuração Orientada pelo Negócio:** Define o direcionamento inicial de como o negócio opera e como isso se encaixa no sistema padrão.
- **Preparação do Workshop Fit-to-Standard:** Planeamento das agendas, definição dos participantes chave (*key users*) e preparação dos cenários que serão demonstrados.
- **Lista de Integrações e Interfaces:** Identificação prévia dos sistemas legados e terceiros que precisarão se comunicar com o SAP.
- **Preparação do Sistema Fit-to-Standard:** Configuração do ambiente de demonstração (como o Sandbox) com dados de teste para ser utilizado nos workshops práticos.
- **Autoatendimento do Cliente:** Atividades preliminares em que a equipa do cliente começa a familiarizar-se com a solução e a documentação dos processos padrão.

---

## 3. Explorar (Explore) - O Coração da Análise
Esta fase divide-se em três etapas principais:

### A. Fit-to-Standard (Análise de Aderência)
1. **Executar Workshop – Identificar Requisitos:**
   - **Demonstração:** Mostra-se o processo padrão (standard) funcionando no sistema.
   - **Perguntas de Configuração Orientadas pelo Negócio:** Questiona-se como o negócio deve ser configurado dentro dos limites do padrão SAP.
   - **Feedback do Cliente & Fluxos de Processo / Scripts Padrão:** O cliente valida se o fluxo padrão atende às suas operações diárias.

2. **Documentar Resultados do Workshop:**
   - **Decisões Principais – Processos de Negócio:** Registo das escolhas e caminhos acordados.
   - **Confirmação do Escopo:** Validação formal dos processos que estão dentro do projeto.
   - **Diagramas de Processo:** Mapeamento visual das etapas.
   - **Tarefas de OCM (Organizational Change Management):** Gestão de mudança organizacional para preparar os colaboradores.
   - **Backlog Inicial:** Lista de demandas geradas no workshop.
   - **Requisitos Delta (GAPs):** Identificação das lacunas ou necessidades de negócio que o padrão do SAP não atende nativamente.

### B. Execução de Cenários Padrão pelo Cliente
- **Hands-on direto:** Os utilizadores e key users do cliente testam e executam os cenários padrão diretamente no sistema para validar a compreensão prática.

### C. Definição da Solução (Converter Requisitos Delta em Itens do Backlog)
Os requisitos Delta (lacunas identificadas) são detalhados e categorizados nas frentes técnicas do projeto:
- **Integração:** Conexão com sistemas legados e externos.
- **Extensibilidade:** Customizações e desenvolvimentos necessários (ex.: RICEFW - Reports, Interfaces, Conversions, Enhancements, Forms, Workflows).
- **Gerenciamento de Saídas (Output Management):** Formulários, relatórios e impressões (como notas fiscais, DANFE, pedidos e relatórios gerenciais).
- **Análises (Analytics):** Dashboards, KPIs e relatórios analíticos no SAP Fiori / CDS Views.
- **Dados Mestres (Master Data):** Estruturação, saneamento e migração dos dados essenciais (clientes, fornecedores, materiais, plano de contas).
- **Documentação Aprimorada da Solução:** Consolidação final dos cenários para orientar e iniciar a fase de construção (**Realize**).
`
};
