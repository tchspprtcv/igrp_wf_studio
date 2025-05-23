# Documentação do Editor de Formulários IGRP-WF-Studio

## Visão Geral

Esta documentação descreve as melhorias avançadas implementadas no editor de formulários do IGRP-WF-Studio. As melhorias incluem um sistema de drag and drop avançado, grid/layout flexível e suporte para elementos complexos como tabelas e componentes aninhados.

## Funcionalidades Implementadas

### 1. Sistema de Drag and Drop Avançado

- **Reorganização de componentes** com feedback visual durante o arrasto
- **Movimentação entre níveis** permitindo arrastar componentes para dentro/fora de painéis
- **Duplicação de componentes** preservando todas as propriedades e configurações

### 2. Sistema de Grid e Layout

- **Opções de largura configuráveis**: 25%, 33%, 50%, 66%, 75% e 100%
- **Controles de alinhamento**: esquerda, centro e direita
- **Opções de espaçamento** personalizáveis
- **Layout responsivo** adaptável a diferentes tamanhos de tela

### 3. Elementos Complexos

- **Editor de tabelas** com configuração de colunas e tipos de dados
- **Componentes aninhados** com suporte para até 2 níveis
- **Integração perfeita** com o sistema de drag and drop e grid/layout

## Estrutura de Arquivos

```
src/components/bpmn/editors/
├── FormEditorModal.tsx         # Componente principal do editor de formulários
├── TableComponents.tsx         # Componentes para criação e edição de tabelas
├── NestedComponents.tsx        # Componentes para elementos aninhados
├── ComplexComponentsIntegration.tsx  # Integração de elementos complexos
└── FormEditorIntegration.tsx   # Módulo de integração completa
```

## Guia de Integração

### Passo 1: Adicionar os arquivos ao projeto

Adicione todos os arquivos ao diretório `src/components/bpmn/editors/` do projeto.

### Passo 2: Importar o módulo de integração

No componente que precisa abrir o editor de formulários (geralmente `BpmnPropertiesPanel.tsx`), importe o módulo de integração:

```typescript
import { openFormEditor } from './editors/FormEditorIntegration';
```

### Passo 3: Utilizar a função de abertura do editor

```typescript
// Exemplo de uso no BpmnPropertiesPanel.tsx
const handleOpenFormEditor = () => {
  openFormEditor(
    formKey,
    (formKey, formData) => {
      // Callback de salvamento
      saveFormData(formKey, formData);
    },
    () => {
      // Callback de fechamento
      console.log('Editor fechado');
    }
  );
};
```

## Exemplos de Uso

### Exemplo 1: Adicionar um componente de tabela

```typescript
import { createTableComponent } from './editors/FormEditorIntegration';

// Criar uma tabela com 3 colunas
const tableComponent = createTableComponent(3);

// Adicionar ao formDefinition
setFormDefinition({
  ...formDefinition,
  components: [...formDefinition.components, {
    id: `table_${Date.now()}`,
    type: 'table',
    label: 'Tabela',
    data: tableComponent
  }]
});
```

### Exemplo 2: Adicionar um componente aninhado

```typescript
import { createNestedComponent } from './editors/FormEditorIntegration';

// Criar um container aninhado
const nestedComponent = createNestedComponent('container');

// Adicionar ao formDefinition
setFormDefinition({
  ...formDefinition,
  components: [...formDefinition.components, {
    id: `nested_${Date.now()}`,
    type: 'nested',
    label: 'Container',
    data: nestedComponent
  }]
});
```

## Decisões Técnicas

### Styled Components

- Utilização do prefixo `$` para propriedades transientes (evitando avisos de DOM)
- Componentes estilizados para garantir consistência visual
- Estilos encapsulados para evitar conflitos com outros componentes

### TypeScript

- Tipagem forte para garantir robustez do código
- Interfaces bem definidas para componentes e propriedades
- Verificações de nulidade para evitar erros em tempo de execução

### React Hooks

- Uso de `useCallback` para funções que são passadas como props
- Gerenciamento cuidadoso da ordem de declaração para evitar erros de inicialização
- Dependências bem definidas para evitar loops infinitos

## Limitações e Considerações

- O aninhamento de componentes está limitado a 2 níveis conforme solicitado
- A edição de tabelas suporta apenas configuração de colunas e tipos de dados
- O sistema de grid/layout é baseado em Flexbox para garantir compatibilidade

## Manutenção e Extensão

Para adicionar novos tipos de componentes complexos:

1. Crie um novo arquivo com os componentes necessários
2. Adicione o tipo ao método `isComplexComponent` no arquivo `ComplexComponentsIntegration.tsx`
3. Implemente as funções de criação, edição e renderização para o novo tipo
4. Atualize o módulo de integração para incluir o novo tipo

## Solução de Problemas

### Erro: "Cannot access X before initialization"

Este erro ocorre quando há problemas na ordem de declaração de funções. Verifique:
- A ordem das declarações de funções e hooks
- Dependências circulares entre hooks useCallback
- Referências a funções antes de sua declaração

### Erro: "Identifier X has already been declared"

Este erro ocorre quando há duplicidade de declarações. Verifique:
- Funções ou variáveis declaradas mais de uma vez
- Importações duplicadas
- Nomes em conflito no mesmo escopo

### Erro: "Property X does not exist on type Y"

Este erro ocorre quando há problemas de tipagem. Verifique:
- Definições de interfaces e tipos
- Verificações de nulidade antes de acessar propriedades
- Conversões de tipo explícitas quando necessário
