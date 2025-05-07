# Propriedades de Artefatos do Activiti Runtime Bundle para Modelagem BPMN

## 1. O que é o Activiti Runtime Bundle

O Activiti Runtime Bundle é um componente central do ecossistema Activiti/Alfresco Process Services, responsável pela execução de processos de negócio definidos em BPMN 2.0. Ele representa uma instância stateless do motor de processos Activiti, projetada para executar um conjunto imutável de definições de processos.

### Características principais:
- **Stateless**: Não mantém estado interno entre execuções de processos, o que melhora a escalabilidade e resiliência.
- **Imutabilidade de definições**: Executa um conjunto predefinido e imutável de modelos de processos.
- **Design Cloud-Native**: Construído para trabalhar com infraestrutura em nuvem, aproveitando funcionalidades do Spring Boot e Spring Cloud.
- **Integração com Cloud Connectors**: Delega tarefas de serviço para sistemas externos via Cloud Connectors, que se comunicam através de canais de mensagens.

## 2. Propriedades de Artefatos do Activiti Runtime Bundle

As propriedades de artefatos no contexto de modelagem BPMN para o Activiti são extensões do padrão BPMN 2.0 que permitem configurar comportamentos específicos do Activiti. Estas propriedades são definidas no namespace `activiti:` e são utilizadas para personalizar o comportamento dos elementos BPMN durante a execução.

### 2.1. Propriedades Gerais de Processo

| Propriedade | Tipo | Descrição | Aplicável a |
|-------------|------|-----------|-------------|
| `activiti:candidateStarterGroups` | String | Grupos autorizados a iniciar o processo | Process |
| `activiti:candidateStarterUsers` | String | Usuários autorizados a iniciar o processo | Process |
| `activiti:versionTag` | String | Tag de versão do processo | Process |
| `activiti:historyTimeToLive` | String | Tempo de retenção do histórico | Process |
| `activiti:isStartableInTasklist` | Boolean | Se o processo pode ser iniciado na lista de tarefas | Process |
| `activiti:jobPriority` | String | Prioridade de jobs para este processo | Process |

### 2.2. Propriedades de Tarefas de Usuário (User Tasks)

| Propriedade | Tipo | Descrição | Aplicável a |
|-------------|------|-----------|-------------|
| `activiti:assignee` | String | Usuário designado para a tarefa | UserTask |
| `activiti:candidateUsers` | String | Usuários candidatos a realizar a tarefa | UserTask |
| `activiti:candidateGroups` | String | Grupos candidatos a realizar a tarefa | UserTask |
| `activiti:dueDate` | String | Data limite para conclusão da tarefa | UserTask |
| `activiti:followUpDate` | String | Data de acompanhamento da tarefa | UserTask |
| `activiti:priority` | String | Prioridade da tarefa | UserTask |
| `activiti:formKey` | String | Chave do formulário associado à tarefa | UserTask, StartEvent |
| `activiti:formHandlerClass` | String | Classe que manipula o formulário | UserTask, StartEvent |

### 2.3. Propriedades de Tarefas de Serviço (Service Tasks)

| Propriedade | Tipo | Descrição | Aplicável a |
|-------------|------|-----------|-------------|
| `activiti:class` | String | Classe Java a ser executada | ServiceTask, BusinessRuleTask, SendTask |
| `activiti:delegateExpression` | String | Expressão que resolve para um delegate | ServiceTask, BusinessRuleTask, SendTask |
| `activiti:expression` | String | Expressão a ser avaliada | ServiceTask, BusinessRuleTask, SendTask, MessageEventDefinition |
| `activiti:resultVariable` | String | Nome da variável para armazenar o resultado | ServiceTask, BusinessRuleTask, SendTask |
| `activiti:type` | String | Tipo de tarefa externa | ServiceTask |
| `activiti:topic` | String | Tópico para tarefas externas | ServiceTask |
| `activiti:taskPriority` | String | Prioridade da tarefa | ServiceTask |

### 2.4. Propriedades de Tarefas de Script (Script Tasks)

| Propriedade | Tipo | Descrição | Aplicável a |
|-------------|------|-----------|-------------|
| `activiti:resultVariable` | String | Nome da variável para armazenar o resultado | ScriptTask |
| `activiti:resource` | String | Recurso externo contendo o script | ScriptTask |

### 2.5. Propriedades de Eventos (Events)

| Propriedade | Tipo | Descrição | Aplicável a |
|-------------|------|-----------|-------------|
| `activiti:initiator` | String | Variável que armazena o iniciador do processo | StartEvent |
| `activiti:formKey` | String | Chave do formulário associado ao evento | StartEvent |
| `activiti:correlationKey` | String | Chave de correlação para mensagens | MessageEventDefinition |
| `activiti:messageExpression` | String | Expressão que resolve para uma mensagem | MessageEventDefinition |
| `activiti:errorCodeVariable` | String | Variável para armazenar o código de erro | ErrorEventDefinition |
| `activiti:errorMessageVariable` | String | Variável para armazenar a mensagem de erro | ErrorEventDefinition |
| `activiti:escalationCodeVariable` | String | Variável para armazenar o código de escalação | EscalationEventDefinition |

### 2.6. Propriedades de Gateways e Fluxos

| Propriedade | Tipo | Descrição | Aplicável a |
|-------------|------|-----------|-------------|
| `activiti:async` | Boolean | Se o elemento deve ser executado assincronamente | Activity, Gateway, Event |
| `activiti:exclusive` | Boolean | Se jobs assíncronos devem ser executados exclusivamente | Activity, Gateway, Event |

### 2.7. Propriedades de Call Activities

| Propriedade | Tipo | Descrição | Aplicável a |
|-------------|------|-----------|-------------|
| `activiti:calledElementBinding` | String | Tipo de binding (latest, deployment, version) | CallActivity |
| `activiti:calledElementVersion` | String | Versão do processo chamado | CallActivity |
| `activiti:calledElementVersionTag` | String | Tag de versão do processo chamado | CallActivity |
| `activiti:calledElementTenantId` | String | ID do tenant do processo chamado | CallActivity |
| `activiti:caseRef` | String | Referência ao caso chamado | CallActivity |
| `activiti:caseBinding` | String | Tipo de binding para o caso | CallActivity |
| `activiti:caseVersion` | String | Versão do caso chamado | CallActivity |
| `activiti:caseTenantId` | String | ID do tenant do caso chamado | CallActivity |
| `activiti:variableMappingClass` | String | Classe para mapeamento de variáveis | CallActivity |
| `activiti:variableMappingDelegateExpression` | String | Expressão para mapeamento de variáveis | CallActivity |

### 2.8. Propriedades de Decisão (DMN)

| Propriedade | Tipo | Descrição | Aplicável a |
|-------------|------|-----------|-------------|
| `activiti:decisionRef` | String | Referência à tabela de decisão | BusinessRuleTask |
| `activiti:decisionRefBinding` | String | Tipo de binding para a decisão | BusinessRuleTask |
| `activiti:decisionRefVersion` | String | Versão da tabela de decisão | BusinessRuleTask |
| `activiti:mapDecisionResult` | String | Como mapear o resultado da decisão | BusinessRuleTask |
| `activiti:decisionRefTenantId` | String | ID do tenant da tabela de decisão | BusinessRuleTask |

### 2.9. Propriedades de Extensão

| Propriedade | Tipo | Descrição | Aplicável a |
|-------------|------|-----------|-------------|
| `activiti:properties` | Complex | Propriedades personalizadas | Qualquer elemento |
| `activiti:inputOutput` | Complex | Parâmetros de entrada/saída | Task, Event, Gateway, CallActivity |
| `activiti:executionListener` | Complex | Listeners de execução | Task, Gateway, Event, SequenceFlow, Process, SubProcess |
| `activiti:taskListener` | Complex | Listeners de tarefa | UserTask |
| `activiti:failedJobRetryTimeCycle` | String | Ciclo de retry para jobs falhos | Task, Event, TimerEventDefinition |
| `activiti:field` | Complex | Campos para injeção | ServiceTask, BusinessRuleTask, SendTask |

## 3. Implementação no Editor BPMN

Para implementar o suporte às propriedades do Activiti Runtime Bundle no editor BPMN da aplicação IGRP-WF, é necessário:

### 3.1. Configuração do Moddle Descriptor

Criar um arquivo `activiti.json` que define o namespace e as propriedades do Activiti:

```json
{
  "name": "Activiti",
  "uri": "http://activiti.org/bpmn",
  "prefix": "activiti",
  "xml": {
    "tagAlias": "lowerCase"
  },
  "types": [
    // Definições de tipos e propriedades aqui
  ]
}
```

### 3.2. Integração com o Editor BPMN

Modificar o componente `BpmnModeler.tsx` para incluir o moddle descriptor do Activiti:

```typescript
import activitiModdleDescriptor from './activiti.json';

// No construtor do BpmnJS
const modeler = new BpmnJS({
  // ...
  additionalModules: [
    // ...
    ActivitiPropertiesProviderModule
  ],
  moddleExtensions: {
    // ...
    activiti: activitiModdleDescriptor
  }
});
```

### 3.3. Implementação do Properties Provider

Criar um `ActivitiPropertiesProvider.ts` que adiciona grupos de propriedades específicas do Activiti ao painel de propriedades:

```typescript
class ActivitiPropertiesProvider {
  // ...
  getGroups(element) {
    return (groups) => {
      // Adicionar grupos de propriedades do Activiti com base no tipo de elemento
      if (is(element, 'bpmn:UserTask')) {
        groups.push(createUserTaskGroup(element));
      }
      if (is(element, 'bpmn:ServiceTask')) {
        groups.push(createServiceTaskGroup(element));
      }
      // ...
      return groups;
    };
  }
}
```

## 4. Bibliotecas e Componentes Recomendados

Para implementar o suporte às propriedades do Activiti no editor BPMN, recomenda-se o uso das seguintes bibliotecas:

1. **bpmn-js**: Biblioteca base para visualização e edição de diagramas BPMN.
2. **bpmn-js-properties-panel**: Painel de propriedades para edição de elementos BPMN.
3. **activiti-bpmn-moddle**: Descritor moddle para o namespace Activiti.
4. **bpmn-js-properties-panel-activiti**: Extensão do painel de propriedades para suportar propriedades do Activiti.

### Exemplos de Implementação

Existem vários projetos de código aberto que demonstram como implementar o suporte ao Activiti no editor BPMN:

- [bpmn-js-properties-panel-activiti-support](https://www.npmjs.com/package/bpmn-js-properties-panel-activiti-support)
- [BlueBiuBiu/bpmn-js-properties-panel-for-activiti](https://github.com/BlueBiuBiu/bpmn-js-properties-panel-for-activiti)
- [JoJoJotarou/bpmn-js-properties-for-activiti](https://github.com/JoJoJotarou/bpmn-js-properties-for-activiti)

## 5. Conclusão

A implementação das propriedades de artefatos do Activiti Runtime Bundle no editor BPMN da aplicação IGRP-WF permitirá aos usuários configurar processos de negócio com todas as funcionalidades suportadas pelo motor Activiti. Isso inclui a atribuição de tarefas, configuração de formulários, expressões, listeners e outras propriedades específicas do Activiti.

A abordagem recomendada é estender o editor BPMN atual com um descritor moddle personalizado para o Activiti e um provedor de propriedades que adicione grupos de propriedades específicas do Activiti ao painel de propriedades existente.

## Referências

1. [Activiti Cloud Runtime Bundle Documentation](https://github.com/Activiti/activiti-7-developers-guide/blob/master/components/activiti-cloud-application/runtime-bundle.md)
2. [Activiti BPMN Model Maven Repository](https://mvnrepository.com/artifact/org.activiti/activiti-bpmn-model)
3. [bpmn.io Forum Discussion on Activiti Properties Panel](https://forum.bpmn.io/t/activiti-properties-panel/6335)
4. [activiti-bpmn-moddle GitHub](https://github.com/igdianov/activiti-bpmn-moddle)
