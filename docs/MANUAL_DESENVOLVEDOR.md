# Manual do Desenvolvedor - IGRP Workflow Studio

Este manual destina-se a desenvolvedores que pretendem contribuir, entender a arquitetura ou modificar o IGRP Workflow Studio.

## 1. Visão Geral do Projeto

O IGRP Workflow Studio é uma aplicação moderna para desenho e gestão de fluxos de trabalho, construída com React, TypeScript e BPMN.js.

### 1.1. Funcionalidades Principais

- 🔄 Designer visual de processos BPMN
- 📁 Organização hierárquica com Workspaces, Áreas e SubÁreas
- 🚀 UI moderna e responsiva construída com React e Tailwind CSS
- 🔒 Desenvolvimento seguro com TypeScript (Type-safe)
- 📦 Arquitetura modular com estrutura monorepo
- 📝 Editor integrado de formulários para elementos com formKey
- 📊 Editor integrado de tabelas de decisão para elementos com decision table

## 2. Começar (Ambiente de Desenvolvimento)

Siga estes passos para configurar o ambiente de desenvolvimento local:

1.  **Instalar dependências:**
    ```bash
    npm install
    ```

2.  **Iniciar o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

3.  **Abrir no navegador:**
    Aceda a [http://localhost:5173](http://localhost:5173).

## 3. Estrutura do Projeto

O projeto está organizado da seguinte forma:

```
packages/
├── igrp-wf-engine/      # Biblioteca principal do motor de workflow
│   ├── src/
│   │   ├── core/        # Lógica de negócio principal
│   │   ├── types/       # Definições de tipos TypeScript
│   │   └── utils/       # Funções utilitárias
│   └── package.json
│
└── igrp-wf-studio-ui/   # Aplicação UI baseada em React
    ├── src/
    │   ├── components/  # Componentes UI reutilizáveis
    │   │   ├── bpmn/    # Componentes relacionados ao BPMN
    │   │   │   ├── editors/  # Editores integrados (formulários e decisões)
    │   │   │   └── ...
    │   ├── pages/       # Páginas da aplicação
    │   ├── services/    # Serviços para comunicação com backend
    │   └── lib/         # Funções utilitárias
    └── package.json
```

## 4. Arquitetura Detalhada

### 4.1. Pacote do Motor (`igrp-wf-engine`)

O motor de workflow principal (`igrp-wf-engine`) é responsável por:

-   Gestão de Workspaces
-   Manuseamento de definições de processos
-   Operações de sistema de ficheiros (inferido, pode necessitar de confirmação)
-   Definições de tipos TypeScript

Este pacote contém a lógica central e as abstrações necessárias para o funcionamento dos fluxos de trabalho.

### 4.2. Pacote da UI (`igrp-wf-studio-ui`)

A interface do utilizador (`igrp-wf-studio-ui`) é construída com as seguintes tecnologias:

-   **React:** Para a arquitetura de componentes.
-   **Tailwind CSS:** Para estilização.
-   **BPMN.js:** Para a modelação de processos BPMN.
-   **React Router:** Para navegação entre páginas.
-   **JSONForms:** Para edição visual de formulários.
-   **DMN.js:** Para edição visual de tabelas de decisão.

Este pacote foca-se na apresentação e interação com o utilizador, consumindo os serviços fornecidos pelo `igrp-wf-engine`.

## 5. Funcionalidades Centrais (Perspetiva Técnica)

### 5.1. Workspaces

-   Permite a criação e gestão de Workspaces de workflow.
-   Organiza processos numa estrutura hierárquica.
-   Rastreia o estado e metadados da Workspace.
-   Do ponto de vista técnico, envolve modelos de dados para Workspaces, APIs para CRUD (Create, Read, Update, Delete) e lógica para versionamento e ciclo de vida.

### 5.2. Áreas & SubÁreas

-   Agrupam processos relacionados em áreas lógicas.
-   Permitem a criação de uma organização aninhada com subáreas.
-   Gerem configurações e permissões específicas da área.
-   Tecnicamente, isto implica relações entre entidades (Workspace -> Área -> SubÁrea -> Processo) e mecanismos de herança de permissões ou configurações.

### 5.3. Designer de Processos

-   Designer visual de processos BPMN 2.0 integrado.
-   Validação de processos em tempo real.
-   Painel de propriedades para configuração de elementos BPMN.
-   Funcionalidade de importação/exportação de diagramas BPMN.
-   A integração com BPMN.js é crucial aqui, envolvendo a sua API para manipulação de diagramas, serialização para XML (BPMN) e a ligação de eventos do modelador com a lógica da aplicação (e.g., guardar alterações, popular painel de propriedades).
-   Suporte completo para todos os atributos BPMN do Activiti.
-   Funcionalidade de zoom no canvas com controles visuais e atalhos de teclado.

### 5.4. Editores Integrados

#### 5.4.1. Editor de Formulários

-   Integração com elementos BPMN que suportam formKey (UserTask, StartEvent).
-   Interface visual para criação e edição de formulários usando JSONForms.
-   Persistência dos formulários associados aos elementos BPMN.
-   Exportação dos formulários junto com as definições do processo.

#### 5.4.2. Editor de Tabelas de Decisão

-   Integração com elementos BPMN que suportam decision table (BusinessRuleTask).
-   Interface visual para criação e edição de tabelas de decisão usando DMN.js.
-   Persistência das tabelas de decisão associadas aos elementos BPMN.
-   Exportação das tabelas de decisão junto com as definições do processo.

## 6. Desenvolvimento e Contribuições

### 6.1. Processo de Desenvolvimento

-   O desenvolvimento é feito nos pacotes `igrp-wf-engine` e `igrp-wf-studio-ui`.
-   Utilize os scripts NPM definidos no `package.json` raiz e nos `package.json` dos pacotes para construir, testar e executar a aplicação.
-   Siga as convenções de código e estilo existentes.

### 6.2. Como Contribuir

1.  Faça um Fork do repositório.
2.  Crie uma branch para a sua funcionalidade (`git checkout -b feature/nova-funcionalidade`).
3.  Faça commit das suas alterações (`git commit -am 'Adiciona nova funcionalidade'`).
4.  Faça push para a branch (`git push origin feature/nova-funcionalidade`).
5.  Crie um Pull Request.

## 7. Integração com Editores Externos

### 7.1. Integração com Form.js

Para integrar o editor de formulários com elementos BPMN:

1. Selecione um elemento que suporte formKey (UserTask, StartEvent).
2. No painel de propriedades, localize a seção "Formulário".
3. Clique no botão "Editar Formulário" para abrir o editor visual.
4. Crie ou edite o formulário usando a interface visual.
5. Salve o formulário para associá-lo ao elemento BPMN.

O formulário será persistido e referenciado no atributo formKey do elemento.

### 7.2. Integração com DMN.js

Para integrar o editor de tabelas de decisão com elementos BPMN:

1. Selecione um elemento BusinessRuleTask.
2. No painel de propriedades, localize a seção "Tabela de Decisão".
3. Clique no botão "Editar Tabela de Decisão" para abrir o editor visual.
4. Crie ou edite a tabela de decisão usando a interface visual.
5. Salve a tabela de decisão para associá-la ao elemento BPMN.

A tabela de decisão será persistida e referenciada no elemento BPMN.

## 8. Serviços de Armazenamento

### 8.1. FormStorageService

Serviço responsável pela persistência e recuperação de formulários:

- `saveForm(processId, elementId, formData)`: Salva um formulário associado a um elemento.
- `getForm(processId, elementId)`: Recupera um formulário associado a um elemento.
- `deleteForm(processId, elementId)`: Remove um formulário associado a um elemento.
- `exportForms(processId)`: Exporta todos os formulários associados a um processo.

### 8.2. DecisionStorageService

Serviço responsável pela persistência e recuperação de tabelas de decisão:

- `saveDecision(processId, elementId, decisionData)`: Salva uma tabela de decisão associada a um elemento.
- `getDecision(processId, elementId)`: Recupera uma tabela de decisão associada a um elemento.
- `deleteDecision(processId, elementId)`: Remove uma tabela de decisão associada a um elemento.
- `exportDecisions(processId)`: Exporta todas as tabelas de decisão associadas a um processo.

## 9. Licença

Este projeto está licenciado sob a Licença MIT.
