# Artefatos BPMN 2.0 no Activiti

Este documento apresenta uma análise detalhada dos artefatos BPMN 2.0 suportados pelo Activiti, incluindo suas especificações técnicas, representação XML e propriedades.

## Sumário

1. [Introdução](#introdução)
2. [Visão Geral dos Artefatos BPMN 2.0 no Activiti](#visão-geral-dos-artefatos-bpmn-20-no-activiti)
3. [Eventos](#eventos)
   - [Eventos de Início](#eventos-de-início)
   - [Eventos de Fim](#eventos-de-fim)
   - [Eventos Intermediários](#eventos-intermediários)
   - [Eventos de Borda](#eventos-de-borda)
4. [Tarefas](#tarefas)
   - [Tarefas de Usuário](#tarefas-de-usuário)
   - [Tarefas de Serviço](#tarefas-de-serviço)
   - [Tarefas de Script](#tarefas-de-script)
   - [Tarefas de Recebimento](#tarefas-de-recebimento)
   - [Tarefas Manuais](#tarefas-manuais)
   - [Tarefas de Envio](#tarefas-de-envio)
   - [Tarefas de Regras de Negócio](#tarefas-de-regras-de-negócio)
5. [Gateways](#gateways)
   - [Gateway Exclusivo](#gateway-exclusivo)
   - [Gateway Paralelo](#gateway-paralelo)
   - [Gateway Inclusivo](#gateway-inclusivo)
   - [Gateway Baseado em Eventos](#gateway-baseado-em-eventos)
6. [Fluxos de Sequência](#fluxos-de-sequência)
7. [Subprocessos](#subprocessos)
8. [Extensões Específicas do Activiti](#extensões-específicas-do-activiti)
9. [Referências](#referências)

## Introdução

O Activiti é um motor de workflow de código aberto que implementa a especificação BPMN 2.0 (Business Process Model and Notation). Ele suporta um conjunto abrangente de elementos BPMN 2.0, permitindo a modelagem, implantação e execução de processos de negócios complexos.

Este documento detalha os artefatos BPMN 2.0 suportados pelo Activiti, suas representações XML, propriedades e atributos, fornecendo uma referência técnica para desenvolvedores que desejam implementar processos de negócios usando o Activiti.

## Visão Geral dos Artefatos BPMN 2.0 no Activiti

O Activiti suporta os principais elementos da especificação BPMN 2.0, incluindo:

- Eventos (início, fim, intermediários e de borda)
- Tarefas (usuário, serviço, script, etc.)
- Gateways (exclusivo, paralelo, inclusivo, baseado em eventos)
- Fluxos de sequência
- Subprocessos
- Extensões específicas do Activiti

Todos os processos BPMN no Activiti são definidos em arquivos XML que seguem o esquema BPMN 2.0, com extensões específicas do Activiti para funcionalidades adicionais.

A estrutura básica de um arquivo BPMN 2.0 no Activiti é a seguinte:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:activiti="http://activiti.org/bpmn"
             targetNamespace="http://www.activiti.org/bpmn2.0">
  <process id="myProcess" name="My Process" isExecutable="true">
    <!-- Elementos do processo -->
  </process>
</definitions>
```

## Eventos

### Eventos de Início

Os eventos de início marcam o ponto de partida de um processo ou subprocesso.

#### None Start Event (Evento de Início Simples)

**Representação XML:**
```xml
<startEvent id="startEvent" name="Start event" />
```

**Propriedades:**
- `id`: Identificador único do evento
- `name`: Nome descritivo do evento
- `activiti:formKey`: (Opcional) Especifica o formulário associado ao evento de início
- `activiti:initiator`: (Opcional) Variável que armazenará o ID do usuário que iniciou o processo

#### Timer Start Event (Evento de Início Temporizado)

**Representação XML:**
```xml
<startEvent id="timerStart">
  <timerEventDefinition>
    <timeCycle>R3/PT10H</timeCycle>
  </timerEventDefinition>
</startEvent>
```

**Propriedades:**
- Propriedades padrão de um evento de início
- Definição de timer:
  - `timeDate`: Data específica para iniciar o processo (formato ISO 8601)
  - `timeDuration`: Duração após a qual o processo deve iniciar
  - `timeCycle`: Expressão para iniciar o processo periodicamente

#### Message Start Event (Evento de Início por Mensagem)

**Representação XML:**
```xml
<startEvent id="messageStart">
  <messageEventDefinition messageRef="newInvoiceMessage" />
</startEvent>
```

**Propriedades:**
- Propriedades padrão de um evento de início
- `messageRef`: Referência a uma definição de mensagem

### Eventos de Fim

Os eventos de fim marcam o término de um caminho de processo.

#### None End Event (Evento de Fim Simples)

**Representação XML:**
```xml
<endEvent id="endEvent" name="End event" />
```

**Propriedades:**
- `id`: Identificador único do evento
- `name`: Nome descritivo do evento

#### Error End Event (Evento de Fim com Erro)

**Representação XML:**
```xml
<endEvent id="errorEnd">
  <errorEventDefinition errorRef="myError" />
</endEvent>
```

**Propriedades:**
- Propriedades padrão de um evento de fim
- `errorRef`: Referência a uma definição de erro

### Eventos Intermediários

Os eventos intermediários ocorrem durante a execução do processo.

#### Intermediate Timer Event (Evento Intermediário Temporizado)

**Representação XML:**
```xml
<intermediateCatchEvent id="timerCatch">
  <timerEventDefinition>
    <timeDuration>PT5M</timeDuration>
  </timerEventDefinition>
</intermediateCatchEvent>
```

**Propriedades:**
- `id`: Identificador único do evento
- `name`: Nome descritivo do evento
- Definição de timer (como nos eventos de início temporizados)

#### Intermediate Message Event (Evento Intermediário de Mensagem)

**Representação XML:**
```xml
<intermediateCatchEvent id="messageCatch">
  <messageEventDefinition messageRef="paymentMessage" />
</intermediateCatchEvent>
```

**Propriedades:**
- Propriedades padrão de um evento intermediário
- `messageRef`: Referência a uma definição de mensagem

### Eventos de Borda

Os eventos de borda são anexados a atividades e podem interromper ou não a execução da atividade.

#### Boundary Timer Event (Evento de Borda Temporizado)

**Representação XML:**
```xml
<boundaryEvent id="timerBoundary" attachedToRef="userTask" cancelActivity="true">
  <timerEventDefinition>
    <timeDuration>PT10M</timeDuration>
  </timerEventDefinition>
</boundaryEvent>
```

**Propriedades:**
- `id`: Identificador único do evento
- `attachedToRef`: Referência à atividade à qual o evento está anexado
- `cancelActivity`: Indica se a atividade deve ser cancelada quando o evento for acionado (true/false)
- Definição de timer (como nos eventos temporizados)

#### Boundary Error Event (Evento de Borda de Erro)

**Representação XML:**
```xml
<boundaryEvent id="errorBoundary" attachedToRef="serviceTask">
  <errorEventDefinition errorRef="myError" />
</boundaryEvent>
```

**Propriedades:**
- Propriedades padrão de um evento de borda
- `errorRef`: Referência a uma definição de erro

## Tarefas

### Tarefas de Usuário

As tarefas de usuário representam trabalho que deve ser realizado por um usuário humano.

**Representação XML:**
```xml
<userTask id="approveTask" name="Approve Request" activiti:assignee="${manager}" activiti:formKey="approvalForm">
  <documentation>Please approve or reject this request</documentation>
  <extensionElements>
    <activiti:formProperty id="approved" name="Approved" type="boolean" required="true" />
    <activiti:formProperty id="comments" name="Comments" type="string" />
  </extensionElements>
</userTask>
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa
- `activiti:assignee`: Usuário designado para a tarefa (pode ser uma expressão)
- `activiti:candidateUsers`: Lista de usuários candidatos a realizar a tarefa
- `activiti:candidateGroups`: Lista de grupos candidatos a realizar a tarefa
- `activiti:dueDate`: Data de vencimento da tarefa
- `activiti:priority`: Prioridade da tarefa
- `activiti:formKey`: Chave do formulário associado à tarefa
- `activiti:formProperty`: Propriedades do formulário (dentro de `extensionElements`)
  - `id`: Identificador da propriedade
  - `name`: Nome descritivo da propriedade
  - `type`: Tipo de dados (string, boolean, date, enum, etc.)
  - `required`: Indica se o campo é obrigatório
  - `readable`: Indica se o campo é legível
  - `writable`: Indica se o campo é editável
  - `variable`: Nome da variável de processo associada

### Tarefas de Serviço

As tarefas de serviço representam trabalho automatizado realizado pelo sistema.

**Representação XML:**
```xml
<serviceTask id="sendEmailTask" name="Send Email" activiti:class="org.activiti.examples.SendEmailDelegate">
  <extensionElements>
    <activiti:field name="to" stringValue="customer@example.com" />
    <activiti:field name="subject" expression="${subject}" />
  </extensionElements>
</serviceTask>
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa
- `activiti:class`: Classe Java que implementa a interface JavaDelegate
- `activiti:expression`: Expressão que será avaliada e executada
- `activiti:delegateExpression`: Expressão que resolve para um objeto que implementa JavaDelegate
- `activiti:type`: Tipo de tarefa de serviço (por exemplo, "mail" para envio de e-mail)
- `activiti:field`: Campos para configuração da tarefa (dentro de `extensionElements`)
  - `name`: Nome do campo
  - `stringValue`: Valor literal do campo
  - `expression`: Expressão para o valor do campo

### Tarefas de Script

As tarefas de script executam código de script diretamente no processo.

**Representação XML:**
```xml
<scriptTask id="calculateTask" name="Calculate Total" scriptFormat="groovy">
  <script>
    total = price * quantity;
    execution.setVariable("total", total);
  </script>
</scriptTask>
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa
- `scriptFormat`: Linguagem de script (groovy, javascript, etc.)
- `script`: Código do script a ser executado
- `activiti:autoStoreVariables`: Indica se as variáveis definidas no script devem ser armazenadas automaticamente (true/false)

### Tarefas de Recebimento

As tarefas de recebimento aguardam a chegada de uma mensagem externa.

**Representação XML:**
```xml
<receiveTask id="waitForPayment" name="Wait for Payment" />
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa

### Tarefas Manuais

As tarefas manuais representam trabalho que deve ser realizado sem a assistência do motor de processos.

**Representação XML:**
```xml
<manualTask id="deliverDocuments" name="Deliver Documents" />
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa

### Tarefas de Envio

As tarefas de envio enviam uma mensagem para um participante externo.

**Representação XML:**
```xml
<sendTask id="sendInvoice" name="Send Invoice" />
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa

### Tarefas de Regras de Negócio

As tarefas de regras de negócio executam uma ou mais regras de negócio.

**Representação XML:**
```xml
<businessRuleTask id="evaluateApplication" name="Evaluate Application" activiti:rules="applicationRules" />
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa
- `activiti:rules`: Referência às regras de negócio a serem executadas

## Gateways

### Gateway Exclusivo

O gateway exclusivo (XOR) direciona o fluxo para exatamente um dos caminhos de saída.

**Representação XML:**
```xml
<exclusiveGateway id="approvalGateway" name="Approval Gateway" default="rejectFlow" />
<sequenceFlow id="approveFlow" sourceRef="approvalGateway" targetRef="approvedTask">
  <conditionExpression xsi:type="tFormalExpression">${approved == true}</conditionExpression>
</sequenceFlow>
<sequenceFlow id="rejectFlow" sourceRef="approvalGateway" targetRef="rejectedTask" />
```

**Propriedades:**
- `id`: Identificador único do gateway
- `name`: Nome descritivo do gateway
- `default`: Fluxo de sequência padrão a ser seguido se nenhuma condição for atendida

### Gateway Paralelo

O gateway paralelo (AND) divide o fluxo em múltiplos caminhos paralelos ou sincroniza múltiplos caminhos.

**Representação XML:**
```xml
<parallelGateway id="forkGateway" name="Fork Gateway" />
<sequenceFlow id="flow1" sourceRef="forkGateway" targetRef="task1" />
<sequenceFlow id="flow2" sourceRef="forkGateway" targetRef="task2" />
```

**Propriedades:**
- `id`: Identificador único do gateway
- `name`: Nome descritivo do gateway

### Gateway Inclusivo

O gateway inclusivo (OR) direciona o fluxo para um ou mais caminhos de saída.

**Representação XML:**
```xml
<inclusiveGateway id="inclusiveGateway" name="Inclusive Gateway" default="defaultFlow" />
<sequenceFlow id="flow1" sourceRef="inclusiveGateway" targetRef="task1">
  <conditionExpression xsi:type="tFormalExpression">${condition1 == true}</conditionExpression>
</sequenceFlow>
<sequenceFlow id="flow2" sourceRef="inclusiveGateway" targetRef="task2">
  <conditionExpression xsi:type="tFormalExpression">${condition2 == true}</conditionExpression>
</sequenceFlow>
<sequenceFlow id="defaultFlow" sourceRef="inclusiveGateway" targetRef="defaultTask" />
```

**Propriedades:**
- `id`: Identificador único do gateway
- `name`: Nome descritivo do gateway
- `default`: Fluxo de sequência padrão a ser seguido se nenhuma condição for atendida

### Gateway Baseado em Eventos

O gateway baseado em eventos direciona o fluxo com base no evento que ocorre primeiro.

**Representação XML:**
```xml
<eventBasedGateway id="eventGateway" name="Event Gateway" />
<intermediateCatchEvent id="timerEvent" name="Timer">
  <timerEventDefinition>
    <timeDuration>PT1H</timeDuration>
  </timerEventDefinition>
</intermediateCatchEvent>
<intermediateCatchEvent id="messageEvent" name="Message">
  <messageEventDefinition messageRef="paymentMessage" />
</intermediateCatchEvent>
<sequenceFlow id="flow1" sourceRef="eventGateway" targetRef="timerEvent" />
<sequenceFlow id="flow2" sourceRef="eventGateway" targetRef="messageEvent" />
```

**Propriedades:**
- `id`: Identificador único do gateway
- `name`: Nome descritivo do gateway

## Fluxos de Sequência

Os fluxos de sequência conectam elementos do processo e definem a ordem de execução.

**Representação XML:**
```xml
<sequenceFlow id="flow1" sourceRef="startEvent" targetRef="task1" />
<sequenceFlow id="flow2" sourceRef="task1" targetRef="gateway1" />
<sequenceFlow id="flow3" sourceRef="gateway1" targetRef="task2">
  <conditionExpression xsi:type="tFormalExpression">${amount > 1000}</conditionExpression>
</sequenceFlow>
```

**Propriedades:**
- `id`: Identificador único do fluxo
- `name`: Nome descritivo do fluxo
- `sourceRef`: Referência ao elemento de origem
- `targetRef`: Referência ao elemento de destino
- `conditionExpression`: Expressão condicional que determina se o fluxo será seguido

## Subprocessos

Os subprocessos permitem agrupar elementos de processo em uma unidade lógica.

**Representação XML:**
```xml
<subProcess id="reviewSubProcess" name="Review Process">
  <startEvent id="subStart" />
  <userTask id="reviewTask" name="Review Document" />
  <endEvent id="subEnd" />
  <sequenceFlow id="subFlow1" sourceRef="subStart" targetRef="reviewTask" />
  <sequenceFlow id="subFlow2" sourceRef="reviewTask" targetRef="subEnd" />
</subProcess>
```

**Propriedades:**
- `id`: Identificador único do subprocesso
- `name`: Nome descritivo do subprocesso
- `triggeredByEvent`: Indica se o subprocesso é acionado por um evento (true/false)

### Multi-Instance Subprocess (Subprocesso Multi-Instância)

**Representação XML:**
```xml
<subProcess id="reviewSubProcess" name="Review Process">
  <multiInstanceLoopCharacteristics isSequential="false" activiti:collection="${documents}" activiti:elementVariable="document" />
  <!-- Elementos do subprocesso -->
</subProcess>
```

**Propriedades:**
- Propriedades padrão de um subprocesso
- `multiInstanceLoopCharacteristics`: Configuração de multi-instância
  - `isSequential`: Indica se as instâncias são executadas sequencialmente (true) ou em paralelo (false)
  - `activiti:collection`: Coleção de itens a serem processados
  - `activiti:elementVariable`: Nome da variável que armazenará cada item da coleção
  - `loopCardinality`: Número fixo de instâncias
  - `completionCondition`: Condição para concluir todas as instâncias

## Extensões Específicas do Activiti

O Activiti estende a especificação BPMN 2.0 com atributos e elementos adicionais para fornecer funcionalidades específicas.

### Listeners de Execução

**Representação XML:**
```xml
<userTask id="task1" name="User Task">
  <extensionElements>
    <activiti:executionListener event="start" class="org.activiti.examples.StartTaskListener" />
    <activiti:executionListener event="end" expression="${taskEndService.notify(execution)}" />
  </extensionElements>
</userTask>
```

**Propriedades:**
- `event`: Evento que aciona o listener (start, end, take)
- `class`: Classe Java que implementa a interface ExecutionListener
- `expression`: Expressão que será avaliada quando o evento ocorrer
- `delegateExpression`: Expressão que resolve para um objeto que implementa ExecutionListener

### Listeners de Tarefa

**Representação XML:**
```xml
<userTask id="task1" name="User Task">
  <extensionElements>
    <activiti:taskListener event="create" class="org.activiti.examples.CreateTaskListener" />
    <activiti:taskListener event="complete" expression="${taskCompleteService.notify(task)}" />
  </extensionElements>
</userTask>
```

**Propriedades:**
- `event`: Evento que aciona o listener (create, assignment, complete, delete)
- `class`: Classe Java que implementa a interface TaskListener
- `expression`: Expressão que será avaliada quando o evento ocorrer
- `delegateExpression`: Expressão que resolve para um objeto que implementa TaskListener

### Campos de Tarefa de Serviço

**Representação XML:**
```xml
<serviceTask id="serviceTask" name="Service Task" activiti:class="org.activiti.examples.ServiceTaskDelegate">
  <extensionElements>
    <activiti:field name="url" stringValue="http://example.com/api" />
    <activiti:field name="method" expression="${httpMethod}" />
  </extensionElements>
</serviceTask>
```

**Propriedades:**
- `name`: Nome do campo
- `stringValue`: Valor literal do campo
- `expression`: Expressão para o valor do campo
- `string`: Valor literal do campo (alternativa a stringValue)

### Propriedades de Formulário

**Representação XML:**
```xml
<userTask id="approveTask" name="Approve Request">
  <extensionElements>
    <activiti:formProperty id="approved" name="Approved" type="boolean" required="true" />
    <activiti:formProperty id="comments" name="Comments" type="string" />
    <activiti:formProperty id="priority" name="Priority" type="enum">
      <activiti:value id="low" name="Low" />
      <activiti:value id="medium" name="Medium" />
      <activiti:value id="high" name="High" />
    </activiti:formProperty>
  </extensionElements>
</userTask>
```

**Propriedades:**
- `id`: Identificador da propriedade
- `name`: Nome descritivo da propriedade
- `type`: Tipo de dados (string, boolean, date, enum, etc.)
- `required`: Indica se o campo é obrigatório
- `readable`: Indica se o campo é legível
- `writable`: Indica se o campo é editável
- `variable`: Nome da variável de processo associada
- `activiti:value`: Valores possíveis para propriedades do tipo enum
  - `id`: Identificador do valor
  - `name`: Nome descritivo do valor

## Referências

1. Activiti User Guide - https://www.activiti.org/userguide/
2. Activiti in Action (Manning Publications) - https://livebook.manning.com/book/activiti-in-action/appendix-b
3. Activiti BPMN Extensions XSD - https://github.com/AlfrescoArchive/Activiti-Designer/blob/master/org.activiti.designer.eclipse/xsd/activiti-bpmn-extensions-5.4.xsd
4. BPMN 2.0 Specification - https://www.omg.org/spec/BPMN/2.0/
5. Activiti GitHub Repository - https://github.com/Activiti/Activiti
