# Implementação das Propriedades do Activiti Runtime Bundle no Editor BPMN

## Visão Geral

Este documento descreve a implementação das propriedades do Activiti Runtime Bundle no editor BPMN da aplicação IGRP-WF. A implementação inclui a criação de um descritor moddle para o Activiti, a modificação do componente BpmnModeler para incluir o descritor moddle do Activiti, e a implementação de um provedor de propriedades para o Activiti.

## Arquivos Implementados

### 1. Descritor Moddle do Activiti (`activiti.json`)

Criamos um arquivo `activiti.json` que define o namespace e as propriedades do Activiti. Este arquivo contém a definição de todas as propriedades específicas do Activiti Runtime Bundle, incluindo:

- Propriedades para tarefas assíncronas
- Propriedades para tarefas de serviço
- Propriedades para tarefas de usuário
- Propriedades para atividades de chamada
- Propriedades para processos
- Propriedades para multi-instâncias
- Propriedades para listeners de execução e tarefa
- E muitas outras propriedades específicas do Activiti

O arquivo está localizado em `/src/bpmn/activiti.json`.

### 2. Provedor de Propriedades do Activiti (`ActivitiPropertiesProvider.ts`)

Implementamos um provedor de propriedades para o Activiti que adiciona grupos de propriedades específicas do Activiti ao painel de propriedades. Este provedor inclui:

- Grupo de propriedades gerais do Activiti para todas as tarefas
- Grupo de propriedades específicas para tarefas de serviço
- Grupo de propriedades específicas para tarefas de usuário
- Grupo de propriedades específicas para atividades de chamada
- Grupo de propriedades específicas para processos
- Grupo de propriedades específicas para multi-instâncias
- Grupo de propriedades específicas para listeners

O arquivo está localizado em `/src/components/bpmn/ActivitiPropertiesProvider.ts`.

### 3. Modificação do Componente BpmnModeler (`BpmnModeler.tsx`)

Modificamos o componente `BpmnModeler.tsx` para incluir o descritor moddle do Activiti e o provedor de propriedades do Activiti. As modificações incluem:

- Importação do descritor moddle do Activiti
- Importação do provedor de propriedades do Activiti
- Adição do provedor de propriedades do Activiti aos módulos adicionais do modeler
- Adição do descritor moddle do Activiti às extensões moddle do modeler
- Atualização do XML padrão para incluir o namespace do Activiti

O arquivo está localizado em `/src/components/bpmn/BpmnModeler.tsx`.

## Propriedades Implementadas

### Propriedades Gerais do Activiti

- **Asynchronous**: Define se a tarefa é executada de forma assíncrona
- **Exclusive**: Define se o job é executado exclusivamente
- **Job Priority**: Define a prioridade para jobs relacionados a este elemento

### Propriedades de Tarefas de Serviço

- **Java Class**: Define a classe Java a ser executada
- **Expression**: Define a expressão que resolve para uma implementação de delegado
- **Delegate Expression**: Define a expressão de delegado
- **Result Variable**: Define o nome da variável para armazenar o resultado

### Propriedades de Tarefas de Usuário

- **Assignee**: Define o usuário atribuído a esta tarefa
- **Candidate Users**: Define a lista de usuários candidatos
- **Candidate Groups**: Define a lista de grupos candidatos
- **Due Date**: Define a data de vencimento da tarefa
- **Priority**: Define a prioridade da tarefa
- **Form Key**: Define a chave do formulário a ser usado

### Propriedades de Atividades de Chamada

- **Called Element Binding**: Define o tipo de vinculação para o processo chamado
- **Called Element Version**: Define a versão do processo chamado
- **Called Element Version Tag**: Define a tag de versão do processo chamado
- **Called Element Tenant ID**: Define o ID do tenant do processo chamado

### Propriedades de Processos

- **Candidate Starter Groups**: Define a lista de grupos candidatos a iniciar o processo
- **Candidate Starter Users**: Define a lista de usuários candidatos a iniciar o processo
- **Version Tag**: Define a tag de versão do processo
- **History Time To Live**: Define o tempo de vida do histórico em dias
- **Is Startable In Tasklist**: Define se o processo pode ser iniciado a partir da lista de tarefas

### Propriedades de Multi-Instâncias

- **Asynchronous Before**: Define se a tarefa é executada de forma assíncrona antes de entrar na atividade
- **Asynchronous After**: Define se a tarefa é executada de forma assíncrona após a atividade
- **Failed Job Retry Time Cycle**: Define o ciclo de tempo de nova tentativa para jobs com falha

## Como Testar

Para testar as alterações, siga os seguintes passos:

1. Inicie a aplicação IGRP-WF
2. Crie um novo processo ou abra um processo existente
3. Selecione diferentes elementos BPMN (tarefas, eventos, gateways, etc.)
4. Verifique se as propriedades específicas do Activiti estão sendo exibidas no painel de propriedades
5. Edite as propriedades e verifique se as alterações são refletidas no XML do processo

## Conclusão

A implementação das propriedades do Activiti Runtime Bundle no editor BPMN da aplicação IGRP-WF permite que os usuários definam e editem todas as propriedades específicas do Activiti diretamente no editor BPMN, sem a necessidade de editar manualmente o XML do processo. Isso melhora significativamente a experiência do usuário e facilita a criação e edição de processos BPMN que serão executados no Activiti Runtime Bundle.