# Guia Técnico Completo: Artefatos BPMN 2.0 no Activiti

Este documento técnico apresenta uma análise detalhada dos artefatos BPMN 2.0 suportados pelo Activiti, incluindo suas especificações técnicas, representação XML, propriedades, exemplos práticos de implementação, dicas de uso e limitações conhecidas.

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
8. [Anotações de Texto (Text Annotations)](#anotações-de-texto-text-annotations)
9. [Grupos (Groups)](#grupos-groups)
10. [Associações (Associations)](#associações-associations)
11. [Data Objects e Data Stores](#data-objects-e-data-stores)
12. [Extensões Específicas do Activiti](#extensões-específicas-do-activiti)
13. [Comparação entre BPMN 2.0 e Implementação do Activiti](#comparação-entre-bpmn-20-e-implementação-do-activiti)
14. [Dicas e Melhores Práticas](#dicas-e-melhores-práticas)
15. [Limitações Conhecidas e Soluções Alternativas](#limitações-conhecidas-e-soluções-alternativas)
16. [Referências](#referências)

## Introdução

O Activiti é um motor de workflow de código aberto que implementa a especificação BPMN 2.0 (Business Process Model and Notation). Ele suporta um conjunto abrangente de elementos BPMN 2.0, permitindo a modelagem, implantação e execução de processos de negócios complexos.

Este documento detalha os artefatos BPMN 2.0 suportados pelo Activiti, suas representações XML, propriedades e atributos, fornecendo uma referência técnica para desenvolvedores que desejam implementar processos de negócios usando o Activiti. Além disso, inclui exemplos práticos de implementação, trechos de código XML e Java, dicas de uso e limitações conhecidas.

## Visão Geral dos Artefatos BPMN 2.0 no Activiti

O Activiti suporta os principais elementos da especificação BPMN 2.0, incluindo:

- Eventos (início, fim, intermediários e de borda)
- Tarefas (usuário, serviço, script, etc.)
- Gateways (exclusivo, paralelo, inclusivo, baseado em eventos)
- Fluxos de sequência
- Subprocessos
- Anotações de texto
- Grupos
- Associações
- Data Objects e Data Stores
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

**Exemplo Prático:**
```xml
<startEvent id="startEvent" name="Iniciar Processo de Aprovação" 
           activiti:formKey="startForm" 
           activiti:initiator="initiatorUser" />
```

**Implementação Java:**
```java
// Criar um evento de início
StartEvent startEvent = new StartEvent();
startEvent.setId("startEvent");
startEvent.setName("Iniciar Processo de Aprovação");
startEvent.setFormKey("startForm");
startEvent.setInitiator("initiatorUser");
process.addFlowElement(startEvent);
```

**Dicas de Uso:**
- Use `activiti:formKey` para associar um formulário específico ao evento de início
- Use `activiti:initiator` para rastrear quem iniciou o processo
- Mantenha o ID curto mas descritivo para facilitar referências em expressões

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

**Exemplo Prático:**
```xml
<!-- Iniciar processo em uma data específica -->
<startEvent id="timerStart1">
  <timerEventDefinition>
    <timeDate>2025-12-31T23:59:59</timeDate>
  </timerEventDefinition>
</startEvent>

<!-- Iniciar processo após 10 minutos -->
<startEvent id="timerStart2">
  <timerEventDefinition>
    <timeDuration>PT10M</timeDuration>
  </timerEventDefinition>
</startEvent>

<!-- Iniciar processo a cada segunda-feira às 9h -->
<startEvent id="timerStart3">
  <timerEventDefinition>
    <timeCycle>0 0 9 ? * MON</timeCycle>
  </timerEventDefinition>
</startEvent>
```

**Implementação Java:**
```java
// Criar um evento de início temporizado
StartEvent timerStart = new StartEvent();
timerStart.setId("timerStart");

// Definir o timer para executar a cada hora
TimerEventDefinition timerDefinition = new TimerEventDefinition();
timerDefinition.setTimeCycle("R/PT1H");
timerStart.setEventDefinitions(Collections.singletonList(timerDefinition));

process.addFlowElement(timerStart);
```

**Dicas de Uso:**
- Use expressões cron para timers recorrentes complexos
- Para timers baseados em duração, use o formato ISO 8601 (P[n]Y[n]M[n]DT[n]H[n]M[n]S)
- Teste cuidadosamente os timers em ambiente de desenvolvimento antes de implantar em produção

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

**Exemplo Prático:**
```xml
<definitions>
  <!-- Definição da mensagem -->
  <message id="newInvoiceMessage" name="New Invoice Message" />
  
  <process id="invoiceProcess">
    <startEvent id="messageStart">
      <messageEventDefinition messageRef="newInvoiceMessage" />
    </startEvent>
    <!-- Resto do processo -->
  </process>
</definitions>
```

**Implementação Java:**
```java
// Criar um modelo BPMN
BpmnModel bpmnModel = new BpmnModel();

// Definir a mensagem
Message message = new Message();
message.setId("newInvoiceMessage");
message.setName("New Invoice Message");
bpmnModel.addMessage(message);

// Criar o processo
Process process = new Process();
process.setId("invoiceProcess");
bpmnModel.addProcess(process);

// Criar um evento de início por mensagem
StartEvent messageStart = new StartEvent();
messageStart.setId("messageStart");

MessageEventDefinition messageDefinition = new MessageEventDefinition();
messageDefinition.setMessageRef("newInvoiceMessage");
messageStart.setEventDefinitions(Collections.singletonList(messageDefinition));

process.addFlowElement(messageStart);

// Iniciar uma instância do processo via mensagem
RuntimeService runtimeService = processEngine.getRuntimeService();
runtimeService.startProcessInstanceByMessage("New Invoice Message");
```

**Dicas de Uso:**
- Use eventos de início por mensagem para iniciar processos a partir de sistemas externos
- Certifique-se de que o nome da mensagem seja único em todo o mecanismo de processos
- Você pode passar variáveis ao iniciar um processo por mensagem

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

**Exemplo Prático:**
```xml
<endEvent id="endEvent" name="Processo Concluído" />
```

**Implementação Java:**
```java
EndEvent endEvent = new EndEvent();
endEvent.setId("endEvent");
endEvent.setName("Processo Concluído");
process.addFlowElement(endEvent);
```

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

**Exemplo Prático:**
```xml
<definitions>
  <!-- Definição do erro -->
  <error id="paymentError" errorCode="PAY-001" name="Payment Failed" />
  
  <process id="paymentProcess">
    <!-- Processo principal -->
    <serviceTask id="processPayment" name="Process Payment" activiti:class="org.example.PaymentService" />
    <sequenceFlow id="flow1" sourceRef="processPayment" targetRef="paymentGateway" />
    
    <exclusiveGateway id="paymentGateway" name="Payment Result?" />
    <sequenceFlow id="flow2" sourceRef="paymentGateway" targetRef="paymentSuccess">
      <conditionExpression xsi:type="tFormalExpression">${paymentSuccessful == true}</conditionExpression>
    </sequenceFlow>
    <sequenceFlow id="flow3" sourceRef="paymentGateway" targetRef="paymentFailure">
      <conditionExpression xsi:type="tFormalExpression">${paymentSuccessful == false}</conditionExpression>
    </sequenceFlow>
    
    <endEvent id="paymentSuccess" name="Payment Successful" />
    
    <endEvent id="paymentFailure" name="Payment Failed">
      <errorEventDefinition errorRef="paymentError" />
    </endEvent>
  </process>
  
  <process id="errorHandlingProcess">
    <!-- Processo que captura o erro -->
    <startEvent id="catchError">
      <errorEventDefinition errorRef="paymentError" />
    </startEvent>
    <userTask id="handleError" name="Handle Payment Error" />
    <endEvent id="errorHandled" name="Error Handled" />
    
    <sequenceFlow id="flow4" sourceRef="catchError" targetRef="handleError" />
    <sequenceFlow id="flow5" sourceRef="handleError" targetRef="errorHandled" />
  </process>
</definitions>
```

**Implementação Java:**
```java
// Definir o erro
Error paymentError = new Error();
paymentError.setId("paymentError");
paymentError.setErrorCode("PAY-001");
paymentError.setName("Payment Failed");
bpmnModel.addError(paymentError);

// Criar um evento de fim com erro
EndEvent errorEnd = new EndEvent();
errorEnd.setId("paymentFailure");
errorEnd.setName("Payment Failed");

ErrorEventDefinition errorDefinition = new ErrorEventDefinition();
errorDefinition.setErrorRef("paymentError");
errorEnd.setEventDefinitions(Collections.singletonList(errorDefinition));

process.addFlowElement(errorEnd);
```

**Dicas de Uso:**
- Use códigos de erro significativos para facilitar a identificação do problema
- Documente todos os erros possíveis e seus significados
- Implemente processos de tratamento de erros para lidar com situações excepcionais

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

**Exemplo Prático:**
```xml
<!-- Esperar 3 dias antes de prosseguir -->
<intermediateCatchEvent id="waitThreeDays" name="Esperar 3 dias">
  <timerEventDefinition>
    <timeDuration>P3D</timeDuration>
  </timerEventDefinition>
</intermediateCatchEvent>
```

**Implementação Java:**
```java
// Criar um evento intermediário temporizado
IntermediateCatchEvent timerEvent = new IntermediateCatchEvent();
timerEvent.setId("waitThreeDays");
timerEvent.setName("Esperar 3 dias");

TimerEventDefinition timerDefinition = new TimerEventDefinition();
timerDefinition.setTimeDuration("P3D");
timerEvent.setEventDefinitions(Collections.singletonList(timerDefinition));

process.addFlowElement(timerEvent);
```

**Dicas de Uso:**
- Use variáveis de processo em expressões de timer para torná-los dinâmicos
- Considere o uso de eventos de borda temporizados em vez de eventos intermediários para implementar timeouts
- Lembre-se que os timers são processados pelo job executor, então configure-o adequadamente

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

**Exemplo Prático:**
```xml
<definitions>
  <message id="paymentConfirmation" name="Payment Confirmation" />
  
  <process id="orderProcess">
    <startEvent id="startEvent" />
    <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="sendInvoice" />
    
    <serviceTask id="sendInvoice" name="Send Invoice" activiti:class="org.example.InvoiceService" />
    <sequenceFlow id="flow2" sourceRef="sendInvoice" targetRef="waitForPayment" />
    
    <intermediateCatchEvent id="waitForPayment" name="Wait for Payment">
      <messageEventDefinition messageRef="paymentConfirmation" />
    </intermediateCatchEvent>
    <sequenceFlow id="flow3" sourceRef="waitForPayment" targetRef="shipOrder" />
    
    <serviceTask id="shipOrder" name="Ship Order" activiti:class="org.example.ShippingService" />
    <sequenceFlow id="flow4" sourceRef="shipOrder" targetRef="endEvent" />
    
    <endEvent id="endEvent" />
  </process>
</definitions>
```

**Implementação Java:**
```java
// Definir a mensagem
Message message = new Message();
message.setId("paymentConfirmation");
message.setName("Payment Confirmation");
bpmnModel.addMessage(message);

// Criar um evento intermediário de mensagem
IntermediateCatchEvent messageEvent = new IntermediateCatchEvent();
messageEvent.setId("waitForPayment");
messageEvent.setName("Wait for Payment");

MessageEventDefinition messageDefinition = new MessageEventDefinition();
messageDefinition.setMessageRef("paymentConfirmation");
messageEvent.setEventDefinitions(Collections.singletonList(messageDefinition));

process.addFlowElement(messageEvent);

// Código para sinalizar o evento de mensagem (em outro lugar do aplicativo)
RuntimeService runtimeService = processEngine.getRuntimeService();
Execution execution = runtimeService.createExecutionQuery()
    .processInstanceId(processInstanceId)
    .messageEventSubscriptionName("Payment Confirmation")
    .singleResult();
    
if (execution != null) {
    runtimeService.messageEventReceived("Payment Confirmation", execution.getId());
}
```

**Dicas de Uso:**
- Use eventos de mensagem para sincronizar processos com sistemas externos
- Implemente mecanismos de timeout para evitar que processos fiquem presos indefinidamente
- Considere usar correlação de mensagens para direcionar mensagens para instâncias específicas de processo

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

**Exemplo Prático:**
```xml
<process id="approvalProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="approveTask" />
  
  <userTask id="approveTask" name="Approve Request" activiti:assignee="${manager}" />
  
  <!-- Timer de lembrete (não interrompe a tarefa) -->
  <boundaryEvent id="reminderTimer" attachedToRef="approveTask" cancelActivity="false">
    <timerEventDefinition>
      <timeDuration>P1D</timeDuration>
    </timerEventDefinition>
  </boundaryEvent>
  <sequenceFlow id="flow2" sourceRef="reminderTimer" targetRef="sendReminder" />
  <serviceTask id="sendReminder" name="Send Reminder" activiti:class="org.example.ReminderService" />
  <sequenceFlow id="flow3" sourceRef="sendReminder" targetRef="approveTask" />
  
  <!-- Timer de escalação (interrompe a tarefa) -->
  <boundaryEvent id="escalationTimer" attachedToRef="approveTask" cancelActivity="true">
    <timerEventDefinition>
      <timeDuration>P3D</timeDuration>
    </timerEventDefinition>
  </boundaryEvent>
  <sequenceFlow id="flow4" sourceRef="escalationTimer" targetRef="escalateTask" />
  <userTask id="escalateTask" name="Escalate Request" activiti:assignee="${director}" />
  
  <sequenceFlow id="flow5" sourceRef="approveTask" targetRef="endEvent" />
  <sequenceFlow id="flow6" sourceRef="escalateTask" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de usuário
UserTask approveTask = new UserTask();
approveTask.setId("approveTask");
approveTask.setName("Approve Request");
approveTask.setAssignee("${manager}");
process.addFlowElement(approveTask);

// Criar um evento de borda temporizado (lembrete)
BoundaryEvent reminderTimer = new BoundaryEvent();
reminderTimer.setId("reminderTimer");
reminderTimer.setAttachedToRef(approveTask.getId());
reminderTimer.setCancelActivity(false);

TimerEventDefinition reminderDefinition = new TimerEventDefinition();
reminderDefinition.setTimeDuration("P1D");
reminderTimer.setEventDefinitions(Collections.singletonList(reminderDefinition));

process.addFlowElement(reminderTimer);

// Criar um evento de borda temporizado (escalação)
BoundaryEvent escalationTimer = new BoundaryEvent();
escalationTimer.setId("escalationTimer");
escalationTimer.setAttachedToRef(approveTask.getId());
escalationTimer.setCancelActivity(true);

TimerEventDefinition escalationDefinition = new TimerEventDefinition();
escalationDefinition.setTimeDuration("P3D");
escalationTimer.setEventDefinitions(Collections.singletonList(escalationDefinition));

process.addFlowElement(escalationTimer);
```

**Dicas de Uso:**
- Use `cancelActivity="false"` para eventos de lembrete que não interrompem a tarefa
- Use `cancelActivity="true"` para eventos de escalação ou timeout que devem interromper a tarefa
- Combine eventos de borda com listeners para implementar lógica de negócios complexa

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

**Exemplo Prático:**
```xml
<definitions>
  <error id="serviceError" errorCode="SVC-001" name="Service Error" />
  
  <process id="serviceProcess">
    <startEvent id="startEvent" />
    <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="callService" />
    
    <serviceTask id="callService" name="Call External Service" activiti:class="org.example.ExternalServiceTask" />
    
    <boundaryEvent id="serviceFailed" attachedToRef="callService">
      <errorEventDefinition errorRef="serviceError" />
    </boundaryEvent>
    
    <sequenceFlow id="flow2" sourceRef="callService" targetRef="serviceSuccess" />
    <sequenceFlow id="flow3" sourceRef="serviceFailed" targetRef="handleError" />
    
    <userTask id="handleError" name="Handle Service Error" activiti:candidateGroups="support" />
    <sequenceFlow id="flow4" sourceRef="handleError" targetRef="serviceRecovered" />
    
    <endEvent id="serviceSuccess" name="Service Completed Successfully" />
    <endEvent id="serviceRecovered" name="Service Recovered After Error" />
  </process>
</definitions>
```

**Implementação Java:**
```java
// Definir o erro
Error serviceError = new Error();
serviceError.setId("serviceError");
serviceError.setErrorCode("SVC-001");
serviceError.setName("Service Error");
bpmnModel.addError(serviceError);

// Criar uma tarefa de serviço
ServiceTask serviceTask = new ServiceTask();
serviceTask.setId("callService");
serviceTask.setName("Call External Service");
serviceTask.setImplementation("org.example.ExternalServiceTask");
process.addFlowElement(serviceTask);

// Criar um evento de borda de erro
BoundaryEvent errorEvent = new BoundaryEvent();
errorEvent.setId("serviceFailed");
errorEvent.setAttachedToRef(serviceTask.getId());

ErrorEventDefinition errorDefinition = new ErrorEventDefinition();
errorDefinition.setErrorRef("serviceError");
errorEvent.setEventDefinitions(Collections.singletonList(errorDefinition));

process.addFlowElement(errorEvent);

// Implementação da classe de serviço que pode lançar o erro
public class ExternalServiceTask implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        try {
            // Lógica para chamar o serviço externo
            boolean serviceSuccessful = callExternalService();
            
            if (!serviceSuccessful) {
                throw new BpmnError("SVC-001", "External service call failed");
            }
        } catch (Exception e) {
            throw new BpmnError("SVC-001", "External service call failed: " + e.getMessage());
        }
    }
    
    private boolean callExternalService() {
        // Implementação real da chamada ao serviço
        return false; // Simulando falha
    }
}
```

**Dicas de Uso:**
- Use eventos de borda de erro para capturar e tratar exceções em tarefas de serviço
- Defina códigos de erro específicos para diferentes tipos de falhas
- Implemente tratamento de erros adequado para cada tipo de erro
- Use a classe `BpmnError` para lançar erros de processo a partir de código Java

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

**Exemplo Prático:**
```xml
<process id="leaveRequestProcess">
  <startEvent id="startEvent" activiti:formKey="leaveRequestForm" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="managerApproval" />
  
  <userTask id="managerApproval" name="Manager Approval" activiti:candidateGroups="managers" activiti:formKey="managerApprovalForm">
    <documentation>Please review this leave request</documentation>
    <extensionElements>
      <activiti:formProperty id="approved" name="Approved" type="boolean" required="true" />
      <activiti:formProperty id="approvalComments" name="Comments" type="string" />
      <activiti:taskListener event="complete" class="org.example.ApprovalTaskListener" />
    </extensionElements>
  </userTask>
  
  <sequenceFlow id="flow2" sourceRef="managerApproval" targetRef="approvalGateway" />
  
  <exclusiveGateway id="approvalGateway" name="Approved?" />
  
  <sequenceFlow id="flow3" sourceRef="approvalGateway" targetRef="notifyApproved">
    <conditionExpression xsi:type="tFormalExpression">${approved == true}</conditionExpression>
  </sequenceFlow>
  
  <sequenceFlow id="flow4" sourceRef="approvalGateway" targetRef="notifyRejected">
    <conditionExpression xsi:type="tFormalExpression">${approved == false}</conditionExpression>
  </sequenceFlow>
  
  <serviceTask id="notifyApproved" name="Notify Approval" activiti:class="org.example.NotificationService">
    <extensionElements>
      <activiti:field name="message" stringValue="Your leave request has been approved" />
    </extensionElements>
  </serviceTask>
  
  <serviceTask id="notifyRejected" name="Notify Rejection" activiti:class="org.example.NotificationService">
    <extensionElements>
      <activiti:field name="message" stringValue="Your leave request has been rejected" />
    </extensionElements>
  </serviceTask>
  
  <sequenceFlow id="flow5" sourceRef="notifyApproved" targetRef="endEvent" />
  <sequenceFlow id="flow6" sourceRef="notifyRejected" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de usuário
UserTask userTask = new UserTask();
userTask.setId("managerApproval");
userTask.setName("Manager Approval");
userTask.setDocumentation("Please review this leave request");
userTask.setFormKey("managerApprovalForm");

// Definir candidatos
userTask.setCandidateGroups(Arrays.asList("managers"));

// Adicionar propriedades de formulário
List<FormProperty> formProperties = new ArrayList<>();

FormProperty approvedProperty = new FormProperty();
approvedProperty.setId("approved");
approvedProperty.setName("Approved");
approvedProperty.setType("boolean");
approvedProperty.setRequired(true);
formProperties.add(approvedProperty);

FormProperty commentsProperty = new FormProperty();
commentsProperty.setId("approvalComments");
commentsProperty.setName("Comments");
commentsProperty.setType("string");
formProperties.add(commentsProperty);

userTask.setFormProperties(formProperties);

// Adicionar listener de tarefa
TaskListener taskListener = new TaskListener();
taskListener.setEvent("complete");
taskListener.setImplementation("org.example.ApprovalTaskListener");
taskListener.setImplementationType("class");
userTask.getTaskListeners().add(taskListener);

process.addFlowElement(userTask);

// Implementação do listener de tarefa
public class ApprovalTaskListener implements TaskListener {
    @Override
    public void notify(DelegateTask delegateTask) {
        Boolean approved = (Boolean) delegateTask.getVariable("approved");
        String comments = (String) delegateTask.getVariable("approvalComments");
        
        // Lógica para registrar a decisão de aprovação
        System.out.println("Task " + delegateTask.getName() + " completed with approval: " + approved);
        System.out.println("Comments: " + comments);
        
        // Atualizar variáveis de processo se necessário
        delegateTask.getExecution().setVariable("managerDecision", approved ? "APPROVED" : "REJECTED");
    }
}
```

**Dicas de Uso:**
- Use `candidateGroups` para atribuir tarefas a grupos de usuários em vez de indivíduos específicos
- Implemente listeners de tarefa para executar lógica personalizada quando a tarefa for criada, atribuída ou concluída
- Use formulários dinâmicos com `formProperty` para coletar dados do usuário
- Defina prazos e prioridades para ajudar os usuários a gerenciar suas tarefas
- Considere usar variáveis de processo para atribuição dinâmica de tarefas

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

**Exemplo Prático:**
```xml
<process id="orderProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="processOrder" />
  
  <!-- Implementação com classe Java -->
  <serviceTask id="processOrder" name="Process Order" activiti:class="org.example.OrderProcessingService">
    <extensionElements>
      <activiti:field name="priority" stringValue="high" />
      <activiti:field name="notifyCustomer" expression="${notifyCustomer}" />
    </extensionElements>
  </serviceTask>
  <sequenceFlow id="flow2" sourceRef="processOrder" targetRef="sendEmail" />
  
  <!-- Implementação com expressão -->
  <serviceTask id="sendEmail" name="Send Confirmation Email" activiti:expression="${emailService.sendOrderConfirmation(execution, orderId)}" />
  <sequenceFlow id="flow3" sourceRef="sendEmail" targetRef="logOrder" />
  
  <!-- Implementação com expressão de delegado -->
  <serviceTask id="logOrder" name="Log Order" activiti:delegateExpression="${orderLogger}" />
  <sequenceFlow id="flow4" sourceRef="logOrder" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de serviço com classe Java
ServiceTask processOrderTask = new ServiceTask();
processOrderTask.setId("processOrder");
processOrderTask.setName("Process Order");
processOrderTask.setImplementation("org.example.OrderProcessingService");
processOrderTask.setImplementationType("class");

// Adicionar campos
List<FieldExtension> fields = new ArrayList<>();

FieldExtension priorityField = new FieldExtension();
priorityField.setFieldName("priority");
priorityField.setStringValue("high");
fields.add(priorityField);

FieldExtension notifyField = new FieldExtension();
notifyField.setFieldName("notifyCustomer");
notifyField.setExpression("${notifyCustomer}");
fields.add(notifyField);

processOrderTask.setFieldExtensions(fields);
process.addFlowElement(processOrderTask);

// Criar uma tarefa de serviço com expressão
ServiceTask sendEmailTask = new ServiceTask();
sendEmailTask.setId("sendEmail");
sendEmailTask.setName("Send Confirmation Email");
sendEmailTask.setImplementation("${emailService.sendOrderConfirmation(execution, orderId)}");
sendEmailTask.setImplementationType("expression");
process.addFlowElement(sendEmailTask);

// Criar uma tarefa de serviço com expressão de delegado
ServiceTask logOrderTask = new ServiceTask();
logOrderTask.setId("logOrder");
logOrderTask.setName("Log Order");
logOrderTask.setImplementation("${orderLogger}");
logOrderTask.setImplementationType("delegateExpression");
process.addFlowElement(logOrderTask);

// Implementação da classe de serviço
public class OrderProcessingService implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        // Obter os campos configurados na tarefa
        String priority = (String) execution.getVariable("priority");
        Boolean notifyCustomer = (Boolean) execution.getVariable("notifyCustomer");
        
        // Obter variáveis de processo
        String orderId = (String) execution.getVariable("orderId");
        
        // Lógica de processamento do pedido
        System.out.println("Processing order " + orderId + " with priority " + priority);
        
        // Atualizar variáveis de processo
        execution.setVariable("orderProcessed", true);
        execution.setVariable("processedDate", new Date());
    }
}

// Bean para ser injetado como expressão de delegado
@Component("orderLogger")
public class OrderLogger implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        String orderId = (String) execution.getVariable("orderId");
        System.out.println("Logging order: " + orderId);
        // Lógica para registrar o pedido em um sistema externo
    }
}

// Serviço para ser chamado via expressão
@Component("emailService")
public class EmailService {
    public void sendOrderConfirmation(DelegateExecution execution, String orderId) {
        String customerEmail = (String) execution.getVariable("customerEmail");
        System.out.println("Sending confirmation email for order " + orderId + " to " + customerEmail);
        // Lógica para enviar e-mail
    }
}
```

**Dicas de Uso:**
- Use `activiti:class` para lógica de negócios complexa e reutilizável
- Use `activiti:expression` para operações simples ou chamadas de método
- Use `activiti:delegateExpression` para injetar beans gerenciados pelo Spring
- Implemente tratamento de erros adequado em suas classes de serviço
- Use campos para configurar o comportamento da tarefa de serviço sem alterar o código
- Evite lógica de negócios complexa diretamente no XML BPMN

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

**Exemplo Prático:**
```xml
<process id="calculationProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="calculateDiscount" />
  
  <scriptTask id="calculateDiscount" name="Calculate Discount" scriptFormat="groovy">
    <script>
      // Obter variáveis de entrada
      def price = execution.getVariable("price");
      def quantity = execution.getVariable("quantity");
      def customerType = execution.getVariable("customerType");
      
      // Calcular subtotal
      def subtotal = price * quantity;
      
      // Aplicar desconto com base no tipo de cliente
      def discountRate = 0;
      if (customerType == "PREMIUM") {
        discountRate = 0.15;
      } else if (customerType == "REGULAR") {
        discountRate = 0.05;
      }
      
      def discount = subtotal * discountRate;
      def total = subtotal - discount;
      
      // Armazenar resultados como variáveis de processo
      execution.setVariable("subtotal", subtotal);
      execution.setVariable("discountRate", discountRate);
      execution.setVariable("discount", discount);
      execution.setVariable("total", total);
    </script>
  </scriptTask>
  
  <sequenceFlow id="flow2" sourceRef="calculateDiscount" targetRef="logResults" />
  
  <scriptTask id="logResults" name="Log Results" scriptFormat="javascript">
    <script>
      var subtotal = execution.getVariable("subtotal");
      var discount = execution.getVariable("discount");
      var total = execution.getVariable("total");
      
      print("Calculation results:");
      print("Subtotal: " + subtotal);
      print("Discount: " + discount);
      print("Total: " + total);
    </script>
  </scriptTask>
  
  <sequenceFlow id="flow3" sourceRef="logResults" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de script
ScriptTask calculateTask = new ScriptTask();
calculateTask.setId("calculateDiscount");
calculateTask.setName("Calculate Discount");
calculateTask.setScriptFormat("groovy");
calculateTask.setScript(
    "// Obter variáveis de entrada\n" +
    "def price = execution.getVariable(\"price\");\n" +
    "def quantity = execution.getVariable(\"quantity\");\n" +
    "def customerType = execution.getVariable(\"customerType\");\n" +
    "\n" +
    "// Calcular subtotal\n" +
    "def subtotal = price * quantity;\n" +
    "\n" +
    "// Aplicar desconto com base no tipo de cliente\n" +
    "def discountRate = 0;\n" +
    "if (customerType == \"PREMIUM\") {\n" +
    "  discountRate = 0.15;\n" +
    "} else if (customerType == \"REGULAR\") {\n" +
    "  discountRate = 0.05;\n" +
    "}\n" +
    "\n" +
    "def discount = subtotal * discountRate;\n" +
    "def total = subtotal - discount;\n" +
    "\n" +
    "// Armazenar resultados como variáveis de processo\n" +
    "execution.setVariable(\"subtotal\", subtotal);\n" +
    "execution.setVariable(\"discountRate\", discountRate);\n" +
    "execution.setVariable(\"discount\", discount);\n" +
    "execution.setVariable(\"total\", total);"
);

process.addFlowElement(calculateTask);

// Iniciar o processo com variáveis
Map<String, Object> variables = new HashMap<>();
variables.put("price", 100.0);
variables.put("quantity", 5);
variables.put("customerType", "PREMIUM");

ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("calculationProcess", variables);
```

**Dicas de Uso:**
- Use tarefas de script para lógica simples que não justifica a criação de uma classe Java
- Prefira Groovy para scripts complexos, pois tem melhor integração com Java
- Evite scripts muito longos ou complexos; mova-os para classes Java se crescerem demais
- Documente bem os scripts, especialmente as variáveis de entrada e saída
- Lembre-se que os scripts são executados no contexto do servidor, então tenha cuidado com operações potencialmente perigosas
- Use `activiti:autoStoreVariables="false"` para evitar conflitos de variáveis em scripts complexos

### Tarefas de Recebimento

As tarefas de recebimento aguardam a chegada de uma mensagem externa.

**Representação XML:**
```xml
<receiveTask id="waitForPayment" name="Wait for Payment" />
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa

**Exemplo Prático:**
```xml
<process id="orderProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="createOrder" />
  
  <serviceTask id="createOrder" name="Create Order" activiti:class="org.example.CreateOrderDelegate" />
  <sequenceFlow id="flow2" sourceRef="createOrder" targetRef="waitForPayment" />
  
  <receiveTask id="waitForPayment" name="Wait for Payment" />
  <sequenceFlow id="flow3" sourceRef="waitForPayment" targetRef="shipOrder" />
  
  <serviceTask id="shipOrder" name="Ship Order" activiti:class="org.example.ShipOrderDelegate" />
  <sequenceFlow id="flow4" sourceRef="shipOrder" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de recebimento
ReceiveTask receiveTask = new ReceiveTask();
receiveTask.setId("waitForPayment");
receiveTask.setName("Wait for Payment");
process.addFlowElement(receiveTask);

// Código para sinalizar a tarefa de recebimento (em outro lugar do aplicativo)
RuntimeService runtimeService = processEngine.getRuntimeService();
Execution execution = runtimeService.createExecutionQuery()
    .processInstanceId(processInstanceId)
    .activityId("waitForPayment")
    .singleResult();
    
if (execution != null) {
    // Sinalizar que o pagamento foi recebido
    runtimeService.signal(execution.getId());
}
```

**Dicas de Uso:**
- Use tarefas de recebimento para pontos de espera simples no processo
- Para esperas mais complexas, considere usar eventos intermediários de mensagem
- Implemente mecanismos de timeout para evitar que processos fiquem presos indefinidamente
- Use a API do RuntimeService para sinalizar a conclusão da tarefa de recebimento

### Tarefas Manuais

As tarefas manuais representam trabalho que deve ser realizado sem a assistência do motor de processos.

**Representação XML:**
```xml
<manualTask id="deliverDocuments" name="Deliver Documents" />
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa

**Exemplo Prático:**
```xml
<process id="documentProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="prepareDocuments" />
  
  <userTask id="prepareDocuments" name="Prepare Documents" activiti:assignee="${clerk}" />
  <sequenceFlow id="flow2" sourceRef="prepareDocuments" targetRef="deliverDocuments" />
  
  <manualTask id="deliverDocuments" name="Deliver Documents to Customer">
    <documentation>
      Print all documents and deliver them to the customer's address.
      Make sure to get a signature as proof of delivery.
    </documentation>
  </manualTask>
  <sequenceFlow id="flow3" sourceRef="deliverDocuments" targetRef="confirmDelivery" />
  
  <userTask id="confirmDelivery" name="Confirm Delivery" activiti:assignee="${clerk}" />
  <sequenceFlow id="flow4" sourceRef="confirmDelivery" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa manual
ManualTask manualTask = new ManualTask();
manualTask.setId("deliverDocuments");
manualTask.setName("Deliver Documents to Customer");
manualTask.setDocumentation(
    "Print all documents and deliver them to the customer's address.\n" +
    "Make sure to get a signature as proof of delivery."
);
process.addFlowElement(manualTask);
```

**Dicas de Uso:**
- Use tarefas manuais para documentar atividades que ocorrem fora do sistema
- Forneça instruções detalhadas na documentação da tarefa
- Lembre-se que tarefas manuais são automaticamente completadas pelo motor de processos
- Para rastrear a conclusão real da tarefa, considere usar uma tarefa de usuário em vez de uma tarefa manual

### Tarefas de Envio

As tarefas de envio enviam uma mensagem para um participante externo.

**Representação XML:**
```xml
<sendTask id="sendInvoice" name="Send Invoice" />
```

**Propriedades:**
- `id`: Identificador único da tarefa
- `name`: Nome descritivo da tarefa

**Exemplo Prático:**
```xml
<process id="invoiceProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="generateInvoice" />
  
  <serviceTask id="generateInvoice" name="Generate Invoice" activiti:class="org.example.InvoiceGenerator" />
  <sequenceFlow id="flow2" sourceRef="generateInvoice" targetRef="sendInvoice" />
  
  <sendTask id="sendInvoice" name="Send Invoice to Customer" activiti:type="mail">
    <extensionElements>
      <activiti:field name="to" expression="${customerEmail}" />
      <activiti:field name="subject" stringValue="Your Invoice" />
      <activiti:field name="text" expression="Dear ${customerName},

Please find attached your invoice #${invoiceNumber} for ${invoiceAmount}.

Thank you for your business.

Regards,
Finance Department" />
      <activiti:field name="attachments" expression="${invoicePdf}" />
    </extensionElements>
  </sendTask>
  <sequenceFlow id="flow3" sourceRef="sendInvoice" targetRef="waitForPayment" />
  
  <receiveTask id="waitForPayment" name="Wait for Payment" />
  <sequenceFlow id="flow4" sourceRef="waitForPayment" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de envio
SendTask sendTask = new SendTask();
sendTask.setId("sendInvoice");
sendTask.setName("Send Invoice to Customer");
sendTask.setType("mail");

// Adicionar campos
List<FieldExtension> fields = new ArrayList<>();

FieldExtension toField = new FieldExtension();
toField.setFieldName("to");
toField.setExpression("${customerEmail}");
fields.add(toField);

FieldExtension subjectField = new FieldExtension();
subjectField.setFieldName("subject");
subjectField.setStringValue("Your Invoice");
fields.add(subjectField);

FieldExtension textField = new FieldExtension();
textField.setFieldName("text");
textField.setExpression("Dear ${customerName},\n\n" +
    "Please find attached your invoice #${invoiceNumber} for ${invoiceAmount}.\n\n" +
    "Thank you for your business.\n\n" +
    "Regards,\n" +
    "Finance Department");
fields.add(textField);

FieldExtension attachmentsField = new FieldExtension();
attachmentsField.setFieldName("attachments");
attachmentsField.setExpression("${invoicePdf}");
fields.add(attachmentsField);

sendTask.setFieldExtensions(fields);
process.addFlowElement(sendTask);
```

**Dicas de Uso:**
- Use tarefas de envio para interações com sistemas externos
- O Activiti fornece implementações integradas para envio de e-mail (`activiti:type="mail"`)
- Para outros tipos de mensagens, implemente um handler personalizado
- Use expressões para tornar o conteúdo da mensagem dinâmico
- Considere usar tarefas de serviço para casos mais complexos de envio de mensagens

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

**Exemplo Prático:**
```xml
<process id="loanApplicationProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="collectData" />
  
  <userTask id="collectData" name="Collect Application Data" activiti:assignee="${clerk}" />
  <sequenceFlow id="flow2" sourceRef="collectData" targetRef="evaluateRisk" />
  
  <businessRuleTask id="evaluateRisk" name="Evaluate Risk Level" activiti:ruleVariablesInput="${application}" activiti:resultVariable="riskLevel">
    <extensionElements>
      <activiti:ruleVariablesInput>
        <activiti:ruleVariable name="application" value="${application}" />
      </activiti:ruleVariablesInput>
      <activiti:ruleVariablesOutput>
        <activiti:ruleVariable name="riskLevel" value="riskLevel" />
        <activiti:ruleVariable name="riskScore" value="riskScore" />
      </activiti:ruleVariablesOutput>
    </extensionElements>
  </businessRuleTask>
  <sequenceFlow id="flow3" sourceRef="evaluateRisk" targetRef="decisionGateway" />
  
  <exclusiveGateway id="decisionGateway" name="Risk Level?" />
  
  <sequenceFlow id="flow4" sourceRef="decisionGateway" targetRef="automaticApproval">
    <conditionExpression xsi:type="tFormalExpression">${riskLevel == 'LOW'}</conditionExpression>
  </sequenceFlow>
  
  <sequenceFlow id="flow5" sourceRef="decisionGateway" targetRef="manualReview">
    <conditionExpression xsi:type="tFormalExpression">${riskLevel == 'MEDIUM' || riskLevel == 'HIGH'}</conditionExpression>
  </sequenceFlow>
  
  <serviceTask id="automaticApproval" name="Automatic Approval" activiti:class="org.example.AutomaticApprovalDelegate" />
  <userTask id="manualReview" name="Manual Review" activiti:candidateGroups="risk-analysts" />
  
  <sequenceFlow id="flow6" sourceRef="automaticApproval" targetRef="endEvent" />
  <sequenceFlow id="flow7" sourceRef="manualReview" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de regras de negócio
BusinessRuleTask ruleTask = new BusinessRuleTask();
ruleTask.setId("evaluateRisk");
ruleTask.setName("Evaluate Risk Level");

// Configurar variáveis de entrada
List<RuleVariable> inputVariables = new ArrayList<>();
RuleVariable applicationVariable = new RuleVariable();
applicationVariable.setName("application");
applicationVariable.setValue("${application}");
inputVariables.add(applicationVariable);
ruleTask.setRuleVariablesInput(inputVariables);

// Configurar variáveis de saída
List<RuleVariable> outputVariables = new ArrayList<>();
RuleVariable riskLevelVariable = new RuleVariable();
riskLevelVariable.setName("riskLevel");
riskLevelVariable.setValue("riskLevel");
outputVariables.add(riskLevelVariable);

RuleVariable riskScoreVariable = new RuleVariable();
riskScoreVariable.setName("riskScore");
riskScoreVariable.setValue("riskScore");
outputVariables.add(riskScoreVariable);

ruleTask.setRuleVariablesOutput(outputVariables);
ruleTask.setResultVariable("riskLevel");

process.addFlowElement(ruleTask);

// Implementação de um motor de regras simples
public class RiskEvaluationRuleEngine {
    public Map<String, Object> evaluateRisk(LoanApplication application) {
        Map<String, Object> result = new HashMap<>();
        
        int score = 0;
        
        // Regras para avaliar o risco
        if (application.getCreditScore() > 700) {
            score += 30;
        } else if (application.getCreditScore() > 600) {
            score += 15;
        }
        
        if (application.getIncome() > 5000) {
            score += 20;
        } else if (application.getIncome() > 3000) {
            score += 10;
        }
        
        if (application.getEmploymentYears() > 5) {
            score += 15;
        } else if (application.getEmploymentYears() > 2) {
            score += 5;
        }
        
        // Determinar o nível de risco com base na pontuação
        String riskLevel;
        if (score >= 50) {
            riskLevel = "LOW";
        } else if (score >= 30) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "HIGH";
        }
        
        result.put("riskScore", score);
        result.put("riskLevel", riskLevel);
        
        return result;
    }
}
```

**Dicas de Uso:**
- Use tarefas de regras de negócio para encapsular lógica de decisão complexa
- Integre com motores de regras como Drools para regras mais complexas
- Mantenha as regras de negócio separadas do processo para facilitar a manutenção
- Use variáveis de entrada e saída para passar dados entre o processo e o motor de regras
- Documente bem as regras e seu impacto no fluxo do processo

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

**Exemplo Prático:**
```xml
<process id="loanProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="evaluateLoan" />
  
  <serviceTask id="evaluateLoan" name="Evaluate Loan Application" activiti:class="org.example.LoanEvaluator" />
  <sequenceFlow id="flow2" sourceRef="evaluateLoan" targetRef="decisionGateway" />
  
  <exclusiveGateway id="decisionGateway" name="Loan Decision" default="reviewFlow" />
  
  <sequenceFlow id="approveFlow" sourceRef="decisionGateway" targetRef="approveLoan">
    <conditionExpression xsi:type="tFormalExpression">${creditScore > 700 && income > 50000}</conditionExpression>
  </sequenceFlow>
  
  <sequenceFlow id="rejectFlow" sourceRef="decisionGateway" targetRef="rejectLoan">
    <conditionExpression xsi:type="tFormalExpression">${creditScore < 500 || income < 20000}</conditionExpression>
  </sequenceFlow>
  
  <sequenceFlow id="reviewFlow" sourceRef="decisionGateway" targetRef="reviewLoan" />
  
  <serviceTask id="approveLoan" name="Approve Loan" activiti:class="org.example.LoanApprover" />
  <serviceTask id="rejectLoan" name="Reject Loan" activiti:class="org.example.LoanRejecter" />
  <userTask id="reviewLoan" name="Review Loan Application" activiti:candidateGroups="loan-officers" />
  
  <sequenceFlow id="flow3" sourceRef="approveLoan" targetRef="endEvent" />
  <sequenceFlow id="flow4" sourceRef="rejectLoan" targetRef="endEvent" />
  <sequenceFlow id="flow5" sourceRef="reviewLoan" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar um gateway exclusivo
ExclusiveGateway exclusiveGateway = new ExclusiveGateway();
exclusiveGateway.setId("decisionGateway");
exclusiveGateway.setName("Loan Decision");
exclusiveGateway.setDefault("reviewFlow");
process.addFlowElement(exclusiveGateway);

// Criar fluxos de sequência com condições
SequenceFlow approveFlow = new SequenceFlow();
approveFlow.setId("approveFlow");
approveFlow.setSourceRef("decisionGateway");
approveFlow.setTargetRef("approveLoan");
approveFlow.setConditionExpression("${creditScore > 700 && income > 50000}");
process.addFlowElement(approveFlow);

SequenceFlow rejectFlow = new SequenceFlow();
rejectFlow.setId("rejectFlow");
rejectFlow.setSourceRef("decisionGateway");
rejectFlow.setTargetRef("rejectLoan");
rejectFlow.setConditionExpression("${creditScore < 500 || income < 20000}");
process.addFlowElement(rejectFlow);

SequenceFlow reviewFlow = new SequenceFlow();
reviewFlow.setId("reviewFlow");
reviewFlow.setSourceRef("decisionGateway");
reviewFlow.setTargetRef("reviewLoan");
process.addFlowElement(reviewFlow);
```

**Dicas de Uso:**
- Sempre defina um fluxo padrão (`default`) para evitar que o processo fique preso se nenhuma condição for atendida
- Mantenha as expressões de condição simples e legíveis
- Evite sobreposição de condições que possam causar comportamento imprevisível
- Use variáveis de processo bem definidas em suas condições
- Considere extrair lógica complexa para tarefas de serviço ou script antes do gateway

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

**Exemplo Prático:**
```xml
<process id="orderProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="receiveOrder" />
  
  <serviceTask id="receiveOrder" name="Receive Order" activiti:class="org.example.OrderReceiver" />
  <sequenceFlow id="flow2" sourceRef="receiveOrder" targetRef="forkGateway" />
  
  <!-- Divisão em caminhos paralelos -->
  <parallelGateway id="forkGateway" name="Fork Gateway" />
  
  <sequenceFlow id="flow3" sourceRef="forkGateway" targetRef="processPayment" />
  <sequenceFlow id="flow4" sourceRef="forkGateway" targetRef="prepareShipment" />
  <sequenceFlow id="flow5" sourceRef="forkGateway" targetRef="sendConfirmation" />
  
  <serviceTask id="processPayment" name="Process Payment" activiti:class="org.example.PaymentProcessor" />
  <serviceTask id="prepareShipment" name="Prepare Shipment" activiti:class="org.example.ShipmentPreparer" />
  <serviceTask id="sendConfirmation" name="Send Confirmation" activiti:class="org.example.ConfirmationSender" />
  
  <sequenceFlow id="flow6" sourceRef="processPayment" targetRef="joinGateway" />
  <sequenceFlow id="flow7" sourceRef="prepareShipment" targetRef="joinGateway" />
  <sequenceFlow id="flow8" sourceRef="sendConfirmation" targetRef="joinGateway" />
  
  <!-- Sincronização dos caminhos paralelos -->
  <parallelGateway id="joinGateway" name="Join Gateway" />
  <sequenceFlow id="flow9" sourceRef="joinGateway" targetRef="completeOrder" />
  
  <serviceTask id="completeOrder" name="Complete Order" activiti:class="org.example.OrderCompleter" />
  <sequenceFlow id="flow10" sourceRef="completeOrder" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar um gateway paralelo para divisão (fork)
ParallelGateway forkGateway = new ParallelGateway();
forkGateway.setId("forkGateway");
forkGateway.setName("Fork Gateway");
process.addFlowElement(forkGateway);

// Criar fluxos de sequência a partir do fork
SequenceFlow flow3 = new SequenceFlow();
flow3.setId("flow3");
flow3.setSourceRef("forkGateway");
flow3.setTargetRef("processPayment");
process.addFlowElement(flow3);

SequenceFlow flow4 = new SequenceFlow();
flow4.setId("flow4");
flow4.setSourceRef("forkGateway");
flow4.setTargetRef("prepareShipment");
process.addFlowElement(flow4);

SequenceFlow flow5 = new SequenceFlow();
flow5.setId("flow5");
flow5.setSourceRef("forkGateway");
flow5.setTargetRef("sendConfirmation");
process.addFlowElement(flow5);

// Criar um gateway paralelo para junção (join)
ParallelGateway joinGateway = new ParallelGateway();
joinGateway.setId("joinGateway");
joinGateway.setName("Join Gateway");
process.addFlowElement(joinGateway);

// Criar fluxos de sequência para o join
SequenceFlow flow6 = new SequenceFlow();
flow6.setId("flow6");
flow6.setSourceRef("processPayment");
flow6.setTargetRef("joinGateway");
process.addFlowElement(flow6);

SequenceFlow flow7 = new SequenceFlow();
flow7.setId("flow7");
flow7.setSourceRef("prepareShipment");
flow7.setTargetRef("joinGateway");
process.addFlowElement(flow7);

SequenceFlow flow8 = new SequenceFlow();
flow8.setId("flow8");
flow8.setSourceRef("sendConfirmation");
flow8.setTargetRef("joinGateway");
process.addFlowElement(flow8);
```

**Dicas de Uso:**
- Use gateways paralelos para atividades que podem ser executadas simultaneamente
- Certifique-se de que cada caminho de divisão tenha um caminho correspondente de junção
- Lembre-se que o gateway de junção aguarda todos os caminhos de entrada antes de prosseguir
- Evite condições em fluxos de sequência que saem de um gateway paralelo
- Considere o impacto na performance ao executar muitas atividades em paralelo

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

**Exemplo Prático:**
```xml
<process id="insuranceClaimProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="evaluateClaim" />
  
  <serviceTask id="evaluateClaim" name="Evaluate Insurance Claim" activiti:class="org.example.ClaimEvaluator" />
  <sequenceFlow id="flow2" sourceRef="evaluateClaim" targetRef="claimDecision" />
  
  <inclusiveGateway id="claimDecision" name="Claim Processing" default="defaultFlow" />
  
  <sequenceFlow id="medicalFlow" sourceRef="claimDecision" targetRef="processMedicalClaim">
    <conditionExpression xsi:type="tFormalExpression">${claimType == 'MEDICAL' || claimType == 'COMPREHENSIVE'}</conditionExpression>
  </sequenceFlow>
  
  <sequenceFlow id="propertyFlow" sourceRef="claimDecision" targetRef="processPropertyClaim">
    <conditionExpression xsi:type="tFormalExpression">${claimType == 'PROPERTY' || claimType == 'COMPREHENSIVE'}</conditionExpression>
  </sequenceFlow>
  
  <sequenceFlow id="liabilityFlow" sourceRef="claimDecision" targetRef="processLiabilityClaim">
    <conditionExpression xsi:type="tFormalExpression">${claimType == 'LIABILITY' || claimType == 'COMPREHENSIVE'}</conditionExpression>
  </sequenceFlow>
  
  <sequenceFlow id="defaultFlow" sourceRef="claimDecision" targetRef="reviewClaim" />
  
  <serviceTask id="processMedicalClaim" name="Process Medical Claim" activiti:class="org.example.MedicalClaimProcessor" />
  <serviceTask id="processPropertyClaim" name="Process Property Claim" activiti:class="org.example.PropertyClaimProcessor" />
  <serviceTask id="processLiabilityClaim" name="Process Liability Claim" activiti:class="org.example.LiabilityClaimProcessor" />
  <userTask id="reviewClaim" name="Review Claim" activiti:candidateGroups="claim-adjusters" />
  
  <sequenceFlow id="flow3" sourceRef="processMedicalClaim" targetRef="joinGateway" />
  <sequenceFlow id="flow4" sourceRef="processPropertyClaim" targetRef="joinGateway" />
  <sequenceFlow id="flow5" sourceRef="processLiabilityClaim" targetRef="joinGateway" />
  <sequenceFlow id="flow6" sourceRef="reviewClaim" targetRef="joinGateway" />
  
  <inclusiveGateway id="joinGateway" name="Join Gateway" />
  <sequenceFlow id="flow7" sourceRef="joinGateway" targetRef="finalizeClaim" />
  
  <serviceTask id="finalizeClaim" name="Finalize Claim" activiti:class="org.example.ClaimFinalizer" />
  <sequenceFlow id="flow8" sourceRef="finalizeClaim" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar um gateway inclusivo para divisão
InclusiveGateway inclusiveGateway = new InclusiveGateway();
inclusiveGateway.setId("claimDecision");
inclusiveGateway.setName("Claim Processing");
inclusiveGateway.setDefault("defaultFlow");
process.addFlowElement(inclusiveGateway);

// Criar fluxos de sequência com condições
SequenceFlow medicalFlow = new SequenceFlow();
medicalFlow.setId("medicalFlow");
medicalFlow.setSourceRef("claimDecision");
medicalFlow.setTargetRef("processMedicalClaim");
medicalFlow.setConditionExpression("${claimType == 'MEDICAL' || claimType == 'COMPREHENSIVE'}");
process.addFlowElement(medicalFlow);

SequenceFlow propertyFlow = new SequenceFlow();
propertyFlow.setId("propertyFlow");
propertyFlow.setSourceRef("claimDecision");
propertyFlow.setTargetRef("processPropertyClaim");
propertyFlow.setConditionExpression("${claimType == 'PROPERTY' || claimType == 'COMPREHENSIVE'}");
process.addFlowElement(propertyFlow);

SequenceFlow liabilityFlow = new SequenceFlow();
liabilityFlow.setId("liabilityFlow");
liabilityFlow.setSourceRef("claimDecision");
liabilityFlow.setTargetRef("processLiabilityClaim");
liabilityFlow.setConditionExpression("${claimType == 'LIABILITY' || claimType == 'COMPREHENSIVE'}");
process.addFlowElement(liabilityFlow);

SequenceFlow defaultFlow = new SequenceFlow();
defaultFlow.setId("defaultFlow");
defaultFlow.setSourceRef("claimDecision");
defaultFlow.setTargetRef("reviewClaim");
process.addFlowElement(defaultFlow);

// Criar um gateway inclusivo para junção
InclusiveGateway joinGateway = new InclusiveGateway();
joinGateway.setId("joinGateway");
joinGateway.setName("Join Gateway");
process.addFlowElement(joinGateway);
```

**Dicas de Uso:**
- Use gateways inclusivos quando múltiplos caminhos podem ser seguidos simultaneamente com base em condições
- Sempre defina um fluxo padrão para evitar que o processo fique preso
- Certifique-se de que as condições são mutuamente exclusivas quando apropriado
- O gateway inclusivo de junção aguarda todos os caminhos ativos antes de prosseguir
- Tenha cuidado com a complexidade do fluxo ao usar gateways inclusivos

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

**Exemplo Prático:**
```xml
<process id="orderProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="createOrder" />
  
  <serviceTask id="createOrder" name="Create Order" activiti:class="org.example.OrderCreator" />
  <sequenceFlow id="flow2" sourceRef="createOrder" targetRef="waitForResponse" />
  
  <eventBasedGateway id="waitForResponse" name="Wait for Response" />
  
  <!-- Evento de mensagem: pagamento recebido -->
  <sequenceFlow id="flow3" sourceRef="waitForResponse" targetRef="paymentReceived" />
  <intermediateCatchEvent id="paymentReceived" name="Payment Received">
    <messageEventDefinition messageRef="paymentMessage" />
  </intermediateCatchEvent>
  <sequenceFlow id="flow4" sourceRef="paymentReceived" targetRef="processOrder" />
  
  <!-- Evento de mensagem: pedido cancelado -->
  <sequenceFlow id="flow5" sourceRef="waitForResponse" targetRef="orderCancelled" />
  <intermediateCatchEvent id="orderCancelled" name="Order Cancelled">
    <messageEventDefinition messageRef="cancellationMessage" />
  </intermediateCatchEvent>
  <sequenceFlow id="flow6" sourceRef="orderCancelled" targetRef="handleCancellation" />
  
  <!-- Evento de timer: timeout após 3 dias -->
  <sequenceFlow id="flow7" sourceRef="waitForResponse" targetRef="orderTimeout" />
  <intermediateCatchEvent id="orderTimeout" name="Order Timeout">
    <timerEventDefinition>
      <timeDuration>P3D</timeDuration>
    </timerEventDefinition>
  </intermediateCatchEvent>
  <sequenceFlow id="flow8" sourceRef="orderTimeout" targetRef="sendReminder" />
  
  <serviceTask id="processOrder" name="Process Order" activiti:class="org.example.OrderProcessor" />
  <serviceTask id="handleCancellation" name="Handle Cancellation" activiti:class="org.example.CancellationHandler" />
  <serviceTask id="sendReminder" name="Send Payment Reminder" activiti:class="org.example.ReminderSender" />
  
  <sequenceFlow id="flow9" sourceRef="processOrder" targetRef="endEvent" />
  <sequenceFlow id="flow10" sourceRef="handleCancellation" targetRef="endEvent" />
  <sequenceFlow id="flow11" sourceRef="sendReminder" targetRef="waitForResponse" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Definir mensagens
Message paymentMessage = new Message();
paymentMessage.setId("paymentMessage");
paymentMessage.setName("Payment Message");
bpmnModel.addMessage(paymentMessage);

Message cancellationMessage = new Message();
cancellationMessage.setId("cancellationMessage");
cancellationMessage.setName("Cancellation Message");
bpmnModel.addMessage(cancellationMessage);

// Criar um gateway baseado em eventos
EventGateway eventGateway = new EventGateway();
eventGateway.setId("waitForResponse");
eventGateway.setName("Wait for Response");
process.addFlowElement(eventGateway);

// Criar evento de mensagem para pagamento
IntermediateCatchEvent paymentEvent = new IntermediateCatchEvent();
paymentEvent.setId("paymentReceived");
paymentEvent.setName("Payment Received");
MessageEventDefinition paymentDefinition = new MessageEventDefinition();
paymentDefinition.setMessageRef("paymentMessage");
paymentEvent.setEventDefinitions(Collections.singletonList(paymentDefinition));
process.addFlowElement(paymentEvent);

// Criar evento de mensagem para cancelamento
IntermediateCatchEvent cancellationEvent = new IntermediateCatchEvent();
cancellationEvent.setId("orderCancelled");
cancellationEvent.setName("Order Cancelled");
MessageEventDefinition cancellationDefinition = new MessageEventDefinition();
cancellationDefinition.setMessageRef("cancellationMessage");
cancellationEvent.setEventDefinitions(Collections.singletonList(cancellationDefinition));
process.addFlowElement(cancellationEvent);

// Criar evento de timer para timeout
IntermediateCatchEvent timeoutEvent = new IntermediateCatchEvent();
timeoutEvent.setId("orderTimeout");
timeoutEvent.setName("Order Timeout");
TimerEventDefinition timerDefinition = new TimerEventDefinition();
timerDefinition.setTimeDuration("P3D");
timeoutEvent.setEventDefinitions(Collections.singletonList(timerDefinition));
process.addFlowElement(timeoutEvent);

// Criar fluxos de sequência
SequenceFlow flow3 = new SequenceFlow();
flow3.setId("flow3");
flow3.setSourceRef("waitForResponse");
flow3.setTargetRef("paymentReceived");
process.addFlowElement(flow3);

SequenceFlow flow5 = new SequenceFlow();
flow5.setId("flow5");
flow5.setSourceRef("waitForResponse");
flow5.setTargetRef("orderCancelled");
process.addFlowElement(flow5);

SequenceFlow flow7 = new SequenceFlow();
flow7.setId("flow7");
flow7.setSourceRef("waitForResponse");
flow7.setTargetRef("orderTimeout");
process.addFlowElement(flow7);

// Código para sinalizar eventos de mensagem (em outro lugar do aplicativo)
RuntimeService runtimeService = processEngine.getRuntimeService();

// Sinalizar pagamento recebido
runtimeService.messageEventReceived("Payment Message", executionId);

// Sinalizar cancelamento
runtimeService.messageEventReceived("Cancellation Message", executionId);
```

**Dicas de Uso:**
- Use gateways baseados em eventos para implementar padrões de espera por múltiplos eventos possíveis
- Apenas o primeiro evento que ocorrer será processado; os outros serão cancelados
- Combine com timers para implementar timeouts e lembretes
- Não é possível usar condições nos fluxos de sequência que saem de um gateway baseado em eventos
- Apenas eventos de captura intermediários podem ser usados após um gateway baseado em eventos

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

**Exemplo Prático:**
```xml
<process id="approvalProcess">
  <startEvent id="startEvent" />
  
  <!-- Fluxo simples -->
  <sequenceFlow id="flow1" name="Iniciar Aprovação" sourceRef="startEvent" targetRef="reviewRequest" />
  
  <userTask id="reviewRequest" name="Review Request" />
  
  <!-- Fluxo com condição -->
  <sequenceFlow id="flow2" sourceRef="reviewRequest" targetRef="approvalGateway" />
  
  <exclusiveGateway id="approvalGateway" name="Approval Decision" />
  
  <sequenceFlow id="approveFlow" name="Aprovado" sourceRef="approvalGateway" targetRef="approveRequest">
    <conditionExpression xsi:type="tFormalExpression">${approved == true}</conditionExpression>
  </sequenceFlow>
  
  <sequenceFlow id="rejectFlow" name="Rejeitado" sourceRef="approvalGateway" targetRef="rejectRequest">
    <conditionExpression xsi:type="tFormalExpression">${approved == false}</conditionExpression>
  </sequenceFlow>
  
  <serviceTask id="approveRequest" name="Approve Request" activiti:class="org.example.RequestApprover" />
  <serviceTask id="rejectRequest" name="Reject Request" activiti:class="org.example.RequestRejecter" />
  
  <sequenceFlow id="flow3" sourceRef="approveRequest" targetRef="endEvent" />
  <sequenceFlow id="flow4" sourceRef="rejectRequest" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar fluxo simples
SequenceFlow flow1 = new SequenceFlow();
flow1.setId("flow1");
flow1.setName("Iniciar Aprovação");
flow1.setSourceRef("startEvent");
flow1.setTargetRef("reviewRequest");
process.addFlowElement(flow1);

// Criar fluxo com condição
SequenceFlow approveFlow = new SequenceFlow();
approveFlow.setId("approveFlow");
approveFlow.setName("Aprovado");
approveFlow.setSourceRef("approvalGateway");
approveFlow.setTargetRef("approveRequest");
approveFlow.setConditionExpression("${approved == true}");
process.addFlowElement(approveFlow);

// Adicionar listener de execução a um fluxo
SequenceFlow rejectFlow = new SequenceFlow();
rejectFlow.setId("rejectFlow");
rejectFlow.setName("Rejeitado");
rejectFlow.setSourceRef("approvalGateway");
rejectFlow.setTargetRef("rejectRequest");
rejectFlow.setConditionExpression("${approved == false}");

// Adicionar listener de execução
ExecutionListener executionListener = new ExecutionListener();
executionListener.setEvent("take");
executionListener.setImplementation("org.example.RejectionListener");
executionListener.setImplementationType("class");
rejectFlow.getExecutionListeners().add(executionListener);

process.addFlowElement(rejectFlow);

// Implementação do listener de execução
public class RejectionListener implements ExecutionListener {
    @Override
    public void notify(DelegateExecution execution) {
        // Lógica a ser executada quando o fluxo de rejeição for seguido
        String reason = (String) execution.getVariable("rejectionReason");
        System.out.println("Request rejected with reason: " + reason);
        
        // Registrar a rejeição em um sistema externo
        execution.setVariable("rejectionLogged", true);
        execution.setVariable("rejectionTimestamp", new Date());
    }
}
```

**Dicas de Uso:**
- Use nomes descritivos para fluxos importantes para melhorar a legibilidade do diagrama
- Mantenha as expressões de condição simples e legíveis
- Use listeners de execução em fluxos para executar lógica quando um caminho específico for seguido
- Certifique-se de que todos os elementos do processo estão conectados por fluxos de sequência
- Evite fluxos que criam ciclos infinitos no processo

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

**Exemplo Prático:**
```xml
<process id="documentApprovalProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="prepareDocument" />
  
  <userTask id="prepareDocument" name="Prepare Document" activiti:assignee="${initiator}" />
  <sequenceFlow id="flow2" sourceRef="prepareDocument" targetRef="reviewProcess" />
  
  <!-- Subprocesso embutido -->
  <subProcess id="reviewProcess" name="Document Review Process">
    <startEvent id="reviewStart" />
    <sequenceFlow id="reviewFlow1" sourceRef="reviewStart" targetRef="reviewDocument" />
    
    <userTask id="reviewDocument" name="Review Document" activiti:candidateGroups="reviewers" />
    <sequenceFlow id="reviewFlow2" sourceRef="reviewDocument" targetRef="reviewDecision" />
    
    <exclusiveGateway id="reviewDecision" name="Review Decision" />
    
    <sequenceFlow id="reviewFlow3" sourceRef="reviewDecision" targetRef="documentApproved">
      <conditionExpression xsi:type="tFormalExpression">${approved}</conditionExpression>
    </sequenceFlow>
    
    <sequenceFlow id="reviewFlow4" sourceRef="reviewDecision" targetRef="documentRejected">
      <conditionExpression xsi:type="tFormalExpression">${!approved}</conditionExpression>
    </sequenceFlow>
    
    <endEvent id="documentApproved" name="Document Approved" />
    <endEvent id="documentRejected" name="Document Rejected">
      <errorEventDefinition errorRef="reviewRejectedError" />
    </endEvent>
  </subProcess>
  
  <sequenceFlow id="flow3" sourceRef="reviewProcess" targetRef="finalizeDocument" />
  
  <userTask id="finalizeDocument" name="Finalize Document" activiti:assignee="${initiator}" />
  <sequenceFlow id="flow4" sourceRef="finalizeDocument" targetRef="endEvent" />
  
  <!-- Tratamento de erro do subprocesso -->
  <boundaryEvent id="reviewError" attachedToRef="reviewProcess">
    <errorEventDefinition errorRef="reviewRejectedError" />
  </boundaryEvent>
  <sequenceFlow id="flow5" sourceRef="reviewError" targetRef="reviseDocument" />
  
  <userTask id="reviseDocument" name="Revise Document" activiti:assignee="${initiator}" />
  <sequenceFlow id="flow6" sourceRef="reviseDocument" targetRef="reviewProcess" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Definir o erro
Error reviewRejectedError = new Error();
reviewRejectedError.setId("reviewRejectedError");
reviewRejectedError.setErrorCode("REVIEW-REJECTED");
bpmnModel.addError(reviewRejectedError);

// Criar um subprocesso
SubProcess subProcess = new SubProcess();
subProcess.setId("reviewProcess");
subProcess.setName("Document Review Process");

// Adicionar elementos ao subprocesso
StartEvent reviewStart = new StartEvent();
reviewStart.setId("reviewStart");
subProcess.addFlowElement(reviewStart);

UserTask reviewTask = new UserTask();
reviewTask.setId("reviewDocument");
reviewTask.setName("Review Document");
reviewTask.setCandidateGroups(Collections.singletonList("reviewers"));
subProcess.addFlowElement(reviewTask);

ExclusiveGateway reviewDecision = new ExclusiveGateway();
reviewDecision.setId("reviewDecision");
reviewDecision.setName("Review Decision");
subProcess.addFlowElement(reviewDecision);

EndEvent documentApproved = new EndEvent();
documentApproved.setId("documentApproved");
documentApproved.setName("Document Approved");
subProcess.addFlowElement(documentApproved);

EndEvent documentRejected = new EndEvent();
documentRejected.setId("documentRejected");
documentRejected.setName("Document Rejected");
ErrorEventDefinition errorDefinition = new ErrorEventDefinition();
errorDefinition.setErrorRef("reviewRejectedError");
documentRejected.setEventDefinitions(Collections.singletonList(errorDefinition));
subProcess.addFlowElement(documentRejected);

// Adicionar fluxos ao subprocesso
SequenceFlow reviewFlow1 = new SequenceFlow();
reviewFlow1.setId("reviewFlow1");
reviewFlow1.setSourceRef("reviewStart");
reviewFlow1.setTargetRef("reviewDocument");
subProcess.addFlowElement(reviewFlow1);

SequenceFlow reviewFlow2 = new SequenceFlow();
reviewFlow2.setId("reviewFlow2");
reviewFlow2.setSourceRef("reviewDocument");
reviewFlow2.setTargetRef("reviewDecision");
subProcess.addFlowElement(reviewFlow2);

SequenceFlow reviewFlow3 = new SequenceFlow();
reviewFlow3.setId("reviewFlow3");
reviewFlow3.setSourceRef("reviewDecision");
reviewFlow3.setTargetRef("documentApproved");
reviewFlow3.setConditionExpression("${approved}");
subProcess.addFlowElement(reviewFlow3);

SequenceFlow reviewFlow4 = new SequenceFlow();
reviewFlow4.setId("reviewFlow4");
reviewFlow4.setSourceRef("reviewDecision");
reviewFlow4.setTargetRef("documentRejected");
reviewFlow4.setConditionExpression("${!approved}");
subProcess.addFlowElement(reviewFlow4);

// Adicionar o subprocesso ao processo principal
process.addFlowElement(subProcess);

// Adicionar evento de borda para capturar o erro
BoundaryEvent boundaryEvent = new BoundaryEvent();
boundaryEvent.setId("reviewError");
boundaryEvent.setAttachedToRef("reviewProcess");
ErrorEventDefinition boundaryErrorDefinition = new ErrorEventDefinition();
boundaryErrorDefinition.setErrorRef("reviewRejectedError");
boundaryEvent.setEventDefinitions(Collections.singletonList(boundaryErrorDefinition));
process.addFlowElement(boundaryEvent);
```

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

**Exemplo Prático:**
```xml
<process id="documentReviewProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="prepareDocuments" />
  
  <serviceTask id="prepareDocuments" name="Prepare Documents" activiti:class="org.example.DocumentPreparer" />
  <sequenceFlow id="flow2" sourceRef="prepareDocuments" targetRef="reviewDocuments" />
  
  <!-- Subprocesso multi-instância paralelo -->
  <subProcess id="reviewDocuments" name="Review Documents">
    <multiInstanceLoopCharacteristics isSequential="false" 
                                     activiti:collection="${documents}" 
                                     activiti:elementVariable="document"
                                     completionCondition="${nrOfCompletedInstances/nrOfInstances >= 0.6}">
    </multiInstanceLoopCharacteristics>
    
    <startEvent id="subStart" />
    <sequenceFlow id="subFlow1" sourceRef="subStart" targetRef="reviewDocument" />
    
    <userTask id="reviewDocument" name="Review ${document.name}" activiti:assignee="${document.reviewer}">
      <documentation>Please review the document: ${document.name}</documentation>
    </userTask>
    <sequenceFlow id="subFlow2" sourceRef="reviewDocument" targetRef="documentDecision" />
    
    <exclusiveGateway id="documentDecision" name="Document Decision" />
    
    <sequenceFlow id="subFlow3" sourceRef="documentDecision" targetRef="documentApproved">
      <conditionExpression xsi:type="tFormalExpression">${approved}</conditionExpression>
    </sequenceFlow>
    
    <sequenceFlow id="subFlow4" sourceRef="documentDecision" targetRef="documentRejected">
      <conditionExpression xsi:type="tFormalExpression">${!approved}</conditionExpression>
    </sequenceFlow>
    
    <endEvent id="documentApproved" name="Document Approved" />
    <endEvent id="documentRejected" name="Document Rejected" />
  </subProcess>
  
  <sequenceFlow id="flow3" sourceRef="reviewDocuments" targetRef="processResults" />
  
  <serviceTask id="processResults" name="Process Review Results" activiti:class="org.example.ResultProcessor" />
  <sequenceFlow id="flow4" sourceRef="processResults" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar um subprocesso multi-instância
SubProcess subProcess = new SubProcess();
subProcess.setId("reviewDocuments");
subProcess.setName("Review Documents");

// Configurar características de multi-instância
MultiInstanceLoopCharacteristics multiInstance = new MultiInstanceLoopCharacteristics();
multiInstance.setSequential(false);
multiInstance.setInputDataItem("${documents}");
multiInstance.setElementVariable("document");
multiInstance.setCompletionCondition("${nrOfCompletedInstances/nrOfInstances >= 0.6}");
subProcess.setLoopCharacteristics(multiInstance);

// Adicionar elementos ao subprocesso
StartEvent subStart = new StartEvent();
subStart.setId("subStart");
subProcess.addFlowElement(subStart);

UserTask reviewTask = new UserTask();
reviewTask.setId("reviewDocument");
reviewTask.setName("Review ${document.name}");
reviewTask.setAssignee("${document.reviewer}");
reviewTask.setDocumentation("Please review the document: ${document.name}");
subProcess.addFlowElement(reviewTask);

// Adicionar o subprocesso ao processo principal
process.addFlowElement(subProcess);

// Iniciar o processo com uma coleção de documentos
List<Document> documents = new ArrayList<>();
documents.add(new Document("Contract", "john"));
documents.add(new Document("Agreement", "mary"));
documents.add(new Document("Terms", "peter"));

Map<String, Object> variables = new HashMap<>();
variables.put("documents", documents);

ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("documentReviewProcess", variables);
```

**Dicas de Uso:**
- Use subprocessos para agrupar atividades relacionadas e melhorar a organização do processo
- Use subprocessos multi-instância para processar coleções de itens
- Defina condições de conclusão para otimizar o processamento de multi-instâncias
- Combine subprocessos com eventos de borda para implementar tratamento de erros
- Use variáveis de processo para passar dados entre o processo principal e os subprocessos
- Considere o uso de subprocessos reutilizáveis para lógica comum entre diferentes processos

## Anotações de Texto (Text Annotations)

As anotações de texto são usadas para adicionar informações descritivas aos diagramas de processo. Elas são representadas como retângulos abertos com texto e são conectadas a elementos do processo por meio de associações.

**Propriedades Específicas das Anotações de Texto:**

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único da anotação no modelo de processo | Geral |
| **name** | String | Nome descritivo da anotação (opcional) | Geral |
| **documentation** | String | Texto explicativo sobre o propósito da anotação (opcional) | Geral |
| **text** | String | O conteúdo textual exibido na anotação | Geral |
| **textFormat** | String | Formato MIME do texto (ex: "text/plain", "text/html") | Geral |
| **includeInHistory** | Boolean | Determina se a anotação deve ser incluída nos dados históricos do processo | Avançado |

**Representação XML:**
```xml
<textAnnotation id="textAnnotation_1">
  <text>Esta é uma anotação explicativa sobre o processo</text>
</textAnnotation>
```

**Exemplo Prático:**
```xml
<process id="myProcess" name="My Process">
  <startEvent id="startEvent" name="Start" />
  <userTask id="approveTask" name="Approve Request" />
  
  <textAnnotation id="annotation_1">
    <text>Esta tarefa requer aprovação do gerente</text>
  </textAnnotation>
  <association id="association_1" sourceRef="approveTask" targetRef="annotation_1" />
  
  <sequenceFlow id="flow_1" sourceRef="startEvent" targetRef="approveTask" />
</process>
```

**Implementação Java:**
```java
// Criar um modelo BPMN
BpmnModel bpmnModel = new BpmnModel();
Process process = new Process();
bpmnModel.addProcess(process);

// Criar uma tarefa
UserTask userTask = new UserTask();
userTask.setId("approveTask");
userTask.setName("Approve Request");
process.addFlowElement(userTask);

// Criar uma anotação de texto
TextAnnotation textAnnotation = new TextAnnotation();
textAnnotation.setId("annotation_1");
textAnnotation.setText("Esta tarefa requer aprovação do gerente");
process.addArtifact(textAnnotation);

// Criar uma associação entre a tarefa e a anotação
Association association = new Association();
association.setId("association_1");
association.setSourceRef(userTask.getId());
association.setTargetRef(textAnnotation.getId());
process.addArtifact(association);
```

**Dicas de Uso:**
- Use anotações de texto para adicionar informações contextuais que não cabem no nome ou documentação dos elementos
- Mantenha as anotações concisas e focadas
- Use anotações para documentar regras de negócio, requisitos ou explicações sobre o processo
- Posicione as anotações próximas aos elementos relacionados para melhorar a legibilidade
- Considere usar HTML formatado para anotações mais complexas quando necessário

## Grupos (Groups)

Os grupos são artefatos que permitem organizar visualmente elementos relacionados em um diagrama BPMN, sem afetar o fluxo de execução do processo. Eles são representados como retângulos arredondados com bordas tracejadas.

**Propriedades Específicas dos Grupos:**

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único do grupo no modelo de processo | Geral |
| **name** | String | Nome descritivo do grupo (opcional) | Geral |
| **documentation** | String | Texto explicativo sobre o propósito do grupo (opcional) | Geral |
| **categoryValueRef** | String | Referência a um valor de categoria que classifica o grupo | Geral |

**Representação XML:**
```xml
<group id="group_1" name="Tarefas de Pagamento" categoryValueRef="category_1" />
```

**Exemplo Prático:**
```xml
<process id="myProcess" name="My Process">
  <startEvent id="startEvent" name="Start" />
  <userTask id="processPayment" name="Process Payment" />
  <userTask id="sendInvoice" name="Send Invoice" />
  <endEvent id="endEvent" name="End" />
  
  <group id="paymentGroup" name="Payment Tasks" categoryValueRef="paymentCategory" />
  
  <sequenceFlow id="flow_1" sourceRef="startEvent" targetRef="processPayment" />
  <sequenceFlow id="flow_2" sourceRef="processPayment" targetRef="sendInvoice" />
  <sequenceFlow id="flow_3" sourceRef="sendInvoice" targetRef="endEvent" />
</process>

<category id="paymentCategory">
  <categoryValue id="paymentValue" value="Payment" />
</category>
```

**Implementação Java:**
```java
// Criar um modelo BPMN
BpmnModel bpmnModel = new BpmnModel();
Process process = new Process();
bpmnModel.addProcess(process);

// Criar tarefas
UserTask processPayment = new UserTask();
processPayment.setId("processPayment");
processPayment.setName("Process Payment");
process.addFlowElement(processPayment);

UserTask sendInvoice = new UserTask();
sendInvoice.setId("sendInvoice");
sendInvoice.setName("Send Invoice");
process.addFlowElement(sendInvoice);

// Criar um grupo
Group paymentGroup = new Group();
paymentGroup.setId("paymentGroup");
paymentGroup.setName("Payment Tasks");
paymentGroup.setCategoryValueRef("paymentCategory");
process.addArtifact(paymentGroup);

// Definir a categoria
Category category = new Category();
category.setId("paymentCategory");
category.setName("Payment");
CategoryValue categoryValue = new CategoryValue();
categoryValue.setId("paymentValue");
categoryValue.setValue("Payment");
category.getCategoryValues().add(categoryValue);
bpmnModel.addCategory(category);
```

**Dicas de Uso:**
- Use grupos para organizar visualmente elementos relacionados no diagrama
- Agrupe elementos por função, departamento, fase do processo ou qualquer outra classificação lógica
- Lembre-se que grupos são puramente visuais e não afetam a execução do processo
- Use categorias consistentes em todos os seus processos para facilitar a navegação e compreensão
- Combine grupos com anotações de texto para fornecer informações adicionais sobre o grupo

## Associações (Associations)

As associações são artefatos que conectam elementos de informação (como anotações de texto) a elementos de fluxo (como tarefas ou eventos). Elas são representadas como linhas pontilhadas.

**Propriedades Específicas das Associações:**

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único da associação no modelo de processo | Geral |
| **name** | String | Nome descritivo da associação (opcional) | Geral |
| **documentation** | String | Texto explicativo sobre o propósito da associação (opcional) | Geral |
| **sourceRef** | String | Referência ao elemento de origem da associação | Geral |
| **targetRef** | String | Referência ao elemento de destino da associação | Geral |
| **associationDirection** | String | Direção da associação: "None", "One", "Both" | Geral |

**Representação XML:**
```xml
<association id="association_1" sourceRef="task_1" targetRef="textAnnotation_1" associationDirection="None" />
```

**Exemplo Prático:**
```xml
<process id="myProcess" name="My Process">
  <startEvent id="startEvent" name="Start" />
  <userTask id="reviewTask" name="Review Documents" />
  
  <textAnnotation id="annotation_1">
    <text>Verificar todos os documentos antes de aprovar</text>
  </textAnnotation>
  <association id="association_1" sourceRef="reviewTask" targetRef="annotation_1" associationDirection="None" />
  
  <sequenceFlow id="flow_1" sourceRef="startEvent" targetRef="reviewTask" />
</process>
```

**Implementação Java:**
```java
// Criar um modelo BPMN
BpmnModel bpmnModel = new BpmnModel();
Process process = new Process();
bpmnModel.addProcess(process);

// Criar uma tarefa
UserTask reviewTask = new UserTask();
reviewTask.setId("reviewTask");
reviewTask.setName("Review Documents");
process.addFlowElement(reviewTask);

// Criar uma anotação de texto
TextAnnotation textAnnotation = new TextAnnotation();
textAnnotation.setId("annotation_1");
textAnnotation.setText("Verificar todos os documentos antes de aprovar");
process.addArtifact(textAnnotation);

// Criar uma associação entre a tarefa e a anotação
Association association = new Association();
association.setId("association_1");
association.setSourceRef(reviewTask.getId());
association.setTargetRef(textAnnotation.getId());
association.setAssociationDirection(AssociationDirection.NONE);
process.addArtifact(association);
```

**Dicas de Uso:**
- Use associações para conectar anotações de texto a elementos do processo
- Use a direção da associação para indicar o fluxo de informação:
  - `None`: Sem direção específica
  - `One`: Da origem para o destino
  - `Both`: Bidirecional
- Mantenha as associações simples e diretas para evitar confusão no diagrama
- Use associações para conectar data objects a tarefas quando necessário

## Data Objects e Data Stores

Data Objects e Data Stores são artefatos que representam dados no processo. Data Objects representam informações que fluem através do processo, enquanto Data Stores representam repositórios de dados persistentes.

### Data Objects

**Propriedades Específicas dos Data Objects:**

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único do Data Object no modelo de processo | Geral |
| **name** | String | Nome descritivo do Data Object | Geral |
| **documentation** | String | Texto explicativo sobre o propósito do Data Object (opcional) | Geral |
| **itemSubjectRef** | String | Referência ao tipo de dados do Data Object | Geral |
| **dataState** | String | Estado atual do Data Object (ex: "for analysis", "analyzed") | Geral |
| **isCollection** | Boolean | Indica se o Data Object representa uma coleção de itens | Geral |

**Representação XML:**
```xml
<dataObject id="dataObject_1" name="Customer Request" itemSubjectRef="xsd:string">
  <dataState>for analysis</dataState>
</dataObject>

<dataObjectReference id="dataObjectRef_1" name="Customer Request [for analysis]" dataObjectRef="dataObject_1" />
```

### Data Stores

**Propriedades Específicas dos Data Stores:**

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único do Data Store no modelo de processo | Geral |
| **name** | String | Nome descritivo do Data Store | Geral |
| **documentation** | String | Texto explicativo sobre o propósito do Data Store (opcional) | Geral |
| **itemSubjectRef** | String | Referência ao tipo de dados do Data Store | Geral |
| **capacity** | Integer | Capacidade do Data Store (opcional) | Geral |
| **isUnlimited** | Boolean | Indica se o Data Store tem capacidade ilimitada | Geral |
| **includeInHistory** | Boolean | Determina se o Data Store deve ser incluído nos dados históricos do processo | Avançado |

**Representação XML:**
```xml
<dataStore id="dataStore_1" name="Customer Database" capacity="1000" isUnlimited="false" />
<dataStoreReference id="dataStoreRef_1" name="Customer Database" dataStoreRef="dataStore_1" />
```

**Exemplo Prático:**
```xml
<process id="customerOnboarding" name="Customer Onboarding">
  <startEvent id="startEvent" name="Start" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="collectData" />
  
  <userTask id="collectData" name="Collect Customer Data" activiti:assignee="${clerk}" />
  <sequenceFlow id="flow2" sourceRef="collectData" targetRef="verifyData" />
  
  <dataObject id="customerData" name="Customer Data" />
  <dataObjectReference id="customerDataRef1" name="Customer Data [collected]" dataObjectRef="customerData" />
  <dataObjectReference id="customerDataRef2" name="Customer Data [verified]" dataObjectRef="customerData" />
  
  <dataOutputAssociation id="dataOutput1">
    <sourceRef>collectData</sourceRef>
    <targetRef>customerDataRef1</targetRef>
  </dataOutputAssociation>
  
  <userTask id="verifyData" name="Verify Customer Data" activiti:candidateGroups="verifiers" />
  <sequenceFlow id="flow3" sourceRef="verifyData" targetRef="storeData" />
  
  <dataInputAssociation id="dataInput1">
    <sourceRef>customerDataRef1</sourceRef>
    <targetRef>verifyData</targetRef>
  </dataInputAssociation>
  
  <dataOutputAssociation id="dataOutput2">
    <sourceRef>verifyData</sourceRef>
    <targetRef>customerDataRef2</targetRef>
  </dataOutputAssociation>
  
  <serviceTask id="storeData" name="Store Customer Data" activiti:class="org.example.CustomerDataStorage" />
  <sequenceFlow id="flow4" sourceRef="storeData" targetRef="endEvent" />
  
  <dataStore id="customerDB" name="Customer Database" />
  <dataStoreReference id="customerDBRef" name="Customer Database" dataStoreRef="customerDB" />
  
  <dataOutputAssociation id="dataOutput3">
    <sourceRef>storeData</sourceRef>
    <targetRef>customerDBRef</targetRef>
  </dataOutputAssociation>
  
  <endEvent id="endEvent" name="End" />
</process>
```

**Implementação Java:**
```java
// Criar um modelo BPMN
BpmnModel bpmnModel = new BpmnModel();
Process process = new Process();
process.setId("customerProcess");
process.setName("Customer Process");
bpmnModel.addProcess(process);

// Criar um Data Object
DataObject customerData = new DataObject();
customerData.setId("customerData");
customerData.setName("Customer Data");
process.addFlowElement(customerData);

// Criar uma referência ao Data Object
DataObjectReference customerDataRef = new DataObjectReference();
customerDataRef.setId("customerDataRef");
customerDataRef.setName("Customer Data [collected]");
customerDataRef.setDataObjectRef(customerData.getId());
process.addFlowElement(customerDataRef);

// Criar uma tarefa
UserTask collectDataTask = new UserTask();
collectDataTask.setId("collectData");
collectDataTask.setName("Collect Customer Data");
collectDataTask.setAssignee("${clerk}");
process.addFlowElement(collectDataTask);

// Criar uma associação de saída de dados
DataOutputAssociation dataOutputAssociation = new DataOutputAssociation();
dataOutputAssociation.setId("dataOutput1");
dataOutputAssociation.setSourceRef(collectDataTask.getId());
dataOutputAssociation.setTargetRef(customerDataRef.getId());
collectDataTask.getDataOutputAssociations().add(dataOutputAssociation);

// Criar um Data Store
DataStore customerDB = new DataStore();
customerDB.setId("customerDB");
customerDB.setName("Customer Database");
bpmnModel.addDataStore(customerDB);

// Criar uma referência ao Data Store
DataStoreReference customerDBRef = new DataStoreReference();
customerDBRef.setId("customerDBRef");
customerDBRef.setName("Customer Database");
customerDBRef.setDataStoreRef(customerDB.getId());
process.addFlowElement(customerDBRef);

// Implementação da classe de serviço para armazenamento de dados
public class CustomerDataStorage implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        // Obter os dados do cliente
        Map<String, Object> customerData = (Map<String, Object>) execution.getVariable("customerData");
        
        // Lógica para armazenar os dados no banco de dados
        System.out.println("Storing customer data: " + customerData);
        
        // Simular conexão com banco de dados
        // customerRepository.save(customerData);
        
        execution.setVariable("dataStored", true);
    }
}
```

**Dicas de Uso:**
- Use Data Objects para representar informações que fluem através do processo
- Use Data Stores para representar repositórios persistentes de dados
- Use referências de Data Object para representar diferentes estados dos mesmos dados
- Use associações de entrada e saída de dados para mostrar como os dados são usados pelas atividades
- Documente claramente o propósito e a estrutura dos dados
- Lembre-se que Data Objects são temporários e existem apenas durante a execução do processo
- Data Stores podem ser acessados por múltiplos processos e persistem além da vida útil de uma instância de processo

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

**Exemplo Prático:**
```xml
<process id="orderProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="processOrder" />
  
  <serviceTask id="processOrder" name="Process Order" activiti:class="org.example.OrderProcessor">
    <extensionElements>
      <activiti:executionListener event="start" class="org.example.OrderStartListener" />
      <activiti:executionListener event="end" expression="${orderService.logCompletion(execution)}" />
    </extensionElements>
  </serviceTask>
  
  <sequenceFlow id="flow2" sourceRef="processOrder" targetRef="endEvent">
    <extensionElements>
      <activiti:executionListener event="take" class="org.example.FlowTakenListener" />
    </extensionElements>
  </sequenceFlow>
  
  <endEvent id="endEvent" />


</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de serviço
ServiceTask serviceTask = new ServiceTask();
serviceTask.setId("processOrder");
serviceTask.setName("Process Order");
serviceTask.setImplementation("org.example.OrderProcessor");
serviceTask.setImplementationType("class");

// Adicionar listeners de execução
ExecutionListener startListener = new ExecutionListener();
startListener.setEvent("start");
startListener.setImplementation("org.example.OrderStartListener");
startListener.setImplementationType("class");
serviceTask.getExecutionListeners().add(startListener);

ExecutionListener endListener = new ExecutionListener();
endListener.setEvent("end");
endListener.setImplementation("${orderService.logCompletion(execution)}");
endListener.setImplementationType("expression");
serviceTask.getExecutionListeners().add(endListener);

process.addFlowElement(serviceTask);

// Implementação de um listener de execução
public class OrderStartListener implements ExecutionListener {
    @Override
    public void notify(DelegateExecution execution) {
        String orderId = (String) execution.getVariable("orderId");
        System.out.println("Starting to process order: " + orderId);
        
        // Registrar o início do processamento
        execution.setVariable("processingStartTime", new Date());
    }
}
```

**Dicas de Uso:**
- Use listeners de execução para executar lógica no início ou no fim de uma atividade
- Use listeners para registrar eventos, atualizar variáveis ou interagir com sistemas externos
- Combine listeners com expressões para lógica simples ou com classes Java para lógica complexa
- Considere o impacto na performance ao adicionar muitos listeners

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

**Exemplo Prático:**
```xml
<process id="approvalProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="approveRequest" />
  
  <userTask id="approveRequest" name="Approve Request" activiti:candidateGroups="managers">
    <extensionElements>
      <activiti:taskListener event="create" class="org.example.TaskAssignmentListener" />
      <activiti:taskListener event="assignment" class="org.example.TaskNotificationListener" />
      <activiti:taskListener event="complete" expression="${approvalService.recordDecision(task)}" />
      <activiti:taskListener event="delete" class="org.example.TaskCleanupListener" />
    </extensionElements>
  </userTask>
  
  <sequenceFlow id="flow2" sourceRef="approveRequest" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de usuário com listeners
UserTask userTask = new UserTask();
userTask.setId("approveRequest");
userTask.setName("Approve Request");
userTask.setCandidateGroups(Collections.singletonList("managers"));

// Adicionar listeners de tarefa
List<TaskListener> taskListeners = new ArrayList<>();

TaskListener createListener = new TaskListener();
createListener.setEvent("create");
createListener.setImplementation("org.example.TaskAssignmentListener");
createListener.setImplementationType("class");
taskListeners.add(createListener);

TaskListener assignmentListener = new TaskListener();
assignmentListener.setEvent("assignment");
assignmentListener.setImplementation("org.example.TaskNotificationListener");
assignmentListener.setImplementationType("class");
taskListeners.add(assignmentListener);

TaskListener completeListener = new TaskListener();
completeListener.setEvent("complete");
completeListener.setImplementation("${approvalService.recordDecision(task)}");
completeListener.setImplementationType("expression");
taskListeners.add(completeListener);

userTask.setTaskListeners(taskListeners);
process.addFlowElement(userTask);

// Implementação de um listener de tarefa
public class TaskAssignmentListener implements TaskListener {
    @Override
    public void notify(DelegateTask task) {
        // Lógica para atribuir a tarefa a um usuário específico
        String requestType = (String) task.getExecution().getVariable("requestType");
        
        if ("urgent".equals(requestType)) {
            // Atribuir a tarefa ao gerente sênior
            task.setAssignee("seniorManager");
            task.setPriority(100);
        } else {
            // Deixar a tarefa no grupo de candidatos
            task.setPriority(50);
        }
    }
}
```

**Dicas de Uso:**
- Use listeners de tarefa para personalizar o comportamento das tarefas de usuário
- Os eventos disponíveis são:
  - `create`: Quando a tarefa é criada
  - `assignment`: Quando a tarefa é atribuída a um usuário
  - `complete`: Quando a tarefa é concluída
  - `delete`: Quando a tarefa é excluída
- Use listeners para implementar lógica de atribuição dinâmica de tarefas
- Use listeners para enviar notificações quando tarefas são criadas ou atribuídas
- Use listeners para validar dados de formulário quando tarefas são concluídas

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

**Exemplo Prático:**
```xml
<process id="orderProcess">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="processPayment" />
  
  <serviceTask id="processPayment" name="Process Payment" activiti:class="org.example.PaymentProcessor">
    <extensionElements>
      <activiti:field name="paymentGateway" stringValue="stripe" />
      <activiti:field name="amount" expression="${order.totalAmount}" />
      <activiti:field name="currency" stringValue="USD" />
      <activiti:field name="customerId" expression="${customer.id}" />
    </extensionElements>
  </serviceTask>
  
  <sequenceFlow id="flow2" sourceRef="processPayment" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar uma tarefa de serviço com campos
ServiceTask serviceTask = new ServiceTask();
serviceTask.setId("processPayment");
serviceTask.setName("Process Payment");
serviceTask.setImplementation("org.example.PaymentProcessor");
serviceTask.setImplementationType("class");

// Adicionar campos
List<FieldExtension> fields = new ArrayList<>();

FieldExtension gatewayField = new FieldExtension();
gatewayField.setFieldName("paymentGateway");
gatewayField.setStringValue("stripe");
fields.add(gatewayField);

FieldExtension amountField = new FieldExtension();
amountField.setFieldName("amount");
amountField.setExpression("${order.totalAmount}");
fields.add(amountField);

FieldExtension currencyField = new FieldExtension();
currencyField.setFieldName("currency");
currencyField.setStringValue("USD");
fields.add(currencyField);

FieldExtension customerField = new FieldExtension();
customerField.setFieldName("customerId");
customerField.setExpression("${customer.id}");
fields.add(customerField);

serviceTask.setFieldExtensions(fields);
process.addFlowElement(serviceTask);

// Implementação da classe de serviço
public class PaymentProcessor implements JavaDelegate {
    private String paymentGateway;
    private Expression amount;
    private String currency;
    private Expression customerId;
    
    @Override
    public void execute(DelegateExecution execution) {
        // Obter valores dos campos
        String gateway = paymentGateway;
        Double paymentAmount = (Double) amount.getValue(execution);
        String paymentCurrency = currency;
        String customer = (String) customerId.getValue(execution);
        
        System.out.println("Processing payment of " + paymentAmount + " " + paymentCurrency + 
                          " for customer " + customer + " using " + gateway);
        
        // Lógica para processar o pagamento
        boolean paymentSuccessful = processPayment(gateway, customer, paymentAmount, paymentCurrency);
        
        // Atualizar variáveis de processo
        execution.setVariable("paymentSuccessful", paymentSuccessful);
        execution.setVariable("paymentTimestamp", new Date());
    }
    
    private boolean processPayment(String gateway, String customerId, Double amount, String currency) {
        // Implementação real da lógica de pagamento
        return true;
    }
}
```

**Dicas de Uso:**
- Use campos para configurar tarefas de serviço sem alterar o código Java
- Use `stringValue` para valores literais e `expression` para valores dinâmicos
- Injete campos em classes de serviço usando nomes de variáveis correspondentes
- Documente claramente os campos esperados por cada classe de serviço
- Use campos para tornar suas classes de serviço mais reutilizáveis

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

**Exemplo Prático:**
```xml
<process id="leaveRequestProcess">
  <startEvent id="startEvent" activiti:formKey="leaveRequestForm">
    <extensionElements>
      <activiti:formProperty id="employeeName" name="Employee Name" type="string" required="true" />
      <activiti:formProperty id="startDate" name="Start Date" type="date" required="true" />
      <activiti:formProperty id="endDate" name="End Date" type="date" required="true" />
      <activiti:formProperty id="leaveType" name="Leave Type" type="enum" required="true">
        <activiti:value id="vacation" name="Vacation" />
        <activiti:value id="sick" name="Sick Leave" />
        <activiti:value id="personal" name="Personal Leave" />
      </activiti:formProperty>
      <activiti:formProperty id="reason" name="Reason" type="string" />
    </extensionElements>
  </startEvent>
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="approveLeave" />
  
  <userTask id="approveLeave" name="Approve Leave Request" activiti:candidateGroups="managers" activiti:formKey="leaveApprovalForm">
    <extensionElements>
      <activiti:formProperty id="approved" name="Approved" type="boolean" required="true" />
      <activiti:formProperty id="approvalComments" name="Comments" type="string" />
    </extensionElements>
  </userTask>
  <sequenceFlow id="flow2" sourceRef="approveLeave" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

**Implementação Java:**
```java
// Criar um evento de início com propriedades de formulário
StartEvent startEvent = new StartEvent();
startEvent.setId("startEvent");
startEvent.setFormKey("leaveRequestForm");

// Adicionar propriedades de formulário
List<FormProperty> formProperties = new ArrayList<>();

FormProperty nameProperty = new FormProperty();
nameProperty.setId("employeeName");
nameProperty.setName("Employee Name");
nameProperty.setType("string");
nameProperty.setRequired(true);
formProperties.add(nameProperty);

FormProperty startDateProperty = new FormProperty();
startDateProperty.setId("startDate");
startDateProperty.setName("Start Date");
startDateProperty.setType("date");
startDateProperty.setRequired(true);
formProperties.add(startDateProperty);

FormProperty leaveTypeProperty = new FormProperty();
leaveTypeProperty.setId("leaveType");
leaveTypeProperty.setName("Leave Type");
leaveTypeProperty.setType("enum");
leaveTypeProperty.setRequired(true);

// Adicionar valores para o enum
List<FormValue> leaveTypeValues = new ArrayList<>();
FormValue vacationValue = new FormValue();
vacationValue.setId("vacation");
vacationValue.setName("Vacation");
leaveTypeValues.add(vacationValue);

FormValue sickValue = new FormValue();
sickValue.setId("sick");
sickValue.setName("Sick Leave");
leaveTypeValues.add(sickValue);

leaveTypeProperty.setFormValues(leaveTypeValues);
formProperties.add(leaveTypeProperty);

startEvent.setFormProperties(formProperties);
process.addFlowElement(startEvent);

// Obter valores de formulário em um listener de tarefa
public class LeaveApprovalListener implements TaskListener {
    @Override
    public void notify(DelegateTask task) {
        // Obter valores do formulário
        Boolean approved = (Boolean) task.getVariable("approved");
        String comments = (String) task.getVariable("approvalComments");
        
        // Obter valores do formulário de início
        String employeeName = (String) task.getExecution().getVariable("employeeName");
        Date startDate = (Date) task.getExecution().getVariable("startDate");
        String leaveType = (String) task.getExecution().getVariable("leaveType");
        
        // Lógica para processar a aprovação
        System.out.println("Leave request for " + employeeName + " was " + 
                          (approved ? "approved" : "rejected"));
    }
}
```

**Dicas de Uso:**
- Use propriedades de formulário para definir a estrutura dos formulários de processo
- Defina tipos de dados apropriados para cada campo (string, boolean, date, enum, etc.)
- Use campos obrigatórios para garantir que dados essenciais sejam fornecidos
- Use enums para campos com valores predefinidos
- Combine propriedades de formulário com `formKey` para integração com sistemas de formulários externos
- Acesse os valores dos formulários como variáveis de processo

## Comparação entre BPMN 2.0 e Implementação do Activiti

A tabela a seguir apresenta uma comparação entre a especificação BPMN 2.0 padrão e a implementação específica do Activiti:

| Elemento BPMN 2.0 | Especificação Padrão | Implementação do Activiti | Diferenças Principais |
|-------------------|----------------------|---------------------------|------------------------|
| **Eventos** | Define eventos de início, fim, intermediários e de borda com vários tipos de gatilhos | Implementa a maioria dos tipos de eventos, com algumas limitações | Não implementa completamente eventos de compensação e eventos de link |
| **Tarefas** | Define vários tipos de tarefas (usuário, serviço, script, etc.) | Implementa todos os tipos de tarefas com extensões específicas | Adiciona propriedades como `activiti:assignee`, `activiti:class`, `activiti:expression` |
| **Gateways** | Define gateways exclusivo, paralelo, inclusivo, complexo e baseado em eventos | Implementa a maioria dos gateways | Não implementa completamente o gateway complexo |
| **Subprocessos** | Define subprocessos embutidos, de evento, de transação e chamados | Implementa subprocessos embutidos e chamados | Suporte limitado para subprocessos de transação |
| **Data Objects** | Define objetos de dados e associações de dados | Implementa objetos de dados com algumas limitações | Suporte limitado para associações de dados complexas |
| **Pools e Lanes** | Define pools para representar participantes e lanes para papéis | Implementa pools e lanes principalmente para visualização | Limitações na execução de processos com múltiplos pools |
| **Mensagens** | Define mensagens e fluxos de mensagem entre participantes | Implementa mensagens para eventos, mas com limitações | Suporte limitado para fluxos de mensagem entre pools |
| **Sinais** | Define sinais para comunicação broadcast | Implementa eventos de sinal | Sem diferenças significativas |
| **Erros** | Define erros e eventos de erro | Implementa erros e eventos de erro | Adiciona a classe `BpmnError` para lançar erros de processo |
| **Timers** | Define eventos temporizados | Implementa eventos temporizados | Adiciona suporte para expressões cron |
| **Compensação** | Define mecanismos de compensação | Implementa compensação com limitações | Suporte limitado para compensação complexa |
| **Extensões** | Permite extensões específicas de implementação | Adiciona várias extensões específicas | Adiciona listeners, campos, propriedades de formulário, etc. |

### Elementos Específicos do Activiti

O Activiti estende a especificação BPMN 2.0 com vários elementos e atributos específicos:

1. **Listeners de Execução e Tarefa**: Permitem executar código personalizado em resposta a eventos de processo.
2. **Campos de Tarefa de Serviço**: Permitem configurar tarefas de serviço sem alterar o código Java.
3. **Propriedades de Formulário**: Definem a estrutura dos formulários associados a eventos de início e tarefas de usuário.
4. **Expressões**: Suporte avançado para expressões usando a linguagem de expressão unificada (EL).
5. **Atribuição de Tarefas**: Mecanismos avançados para atribuir tarefas a usuários e grupos.
6. **Integração com Spring**: Suporte nativo para integração com o framework Spring.
7. **API REST**: API REST abrangente para interagir com o motor de processos.
8. **Suporte a Múltiplos Bancos de Dados**: Compatibilidade com vários sistemas de gerenciamento de banco de dados.

### Limitações da Implementação do Activiti

Algumas limitações da implementação do Activiti em relação à especificação BPMN 2.0 completa:

1. **Gateway Complexo**: Suporte limitado para o gateway complexo.
2. **Subprocessos de Transação**: Suporte limitado para subprocessos de transação.
3. **Coreografia**: Não implementa diagramas de coreografia BPMN.
4. **Conversação**: Não implementa diagramas de conversação BPMN.
5. **Eventos de Compensação Complexos**: Suporte limitado para cenários complexos de compensação.
6. **Eventos de Link**: Suporte limitado para eventos de link.
7. **Fluxos de Mensagem entre Pools**: Limitações na execução de fluxos de mensagem entre pools.

## Dicas e Melhores Práticas

### Modelagem de Processos

1. **Mantenha os Processos Simples**: Divida processos complexos em subprocessos menores e mais gerenciáveis.
2. **Use Nomes Descritivos**: Dê nomes claros e descritivos a todos os elementos do processo.
3. **Documente o Processo**: Use anotações de texto e documentação para explicar o propósito e o comportamento dos elementos.
4. **Padronize a Nomenclatura**: Adote convenções de nomenclatura consistentes para todos os elementos do processo.
5. **Evite Loops Infinitos**: Certifique-se de que todos os loops têm condições de saída claras.
6. **Planeje o Tratamento de Erros**: Inclua eventos de erro e caminhos de exceção para lidar com falhas.
7. **Considere a Performance**: Evite processos muito complexos ou com muitas atividades paralelas.

### Implementação Técnica

1. **Separe a Lógica de Negócios**: Mantenha a lógica de negócios complexa em classes Java em vez de expressões no BPMN.
2. **Use Variáveis de Processo Adequadamente**: Defina claramente o escopo e o propósito das variáveis de processo.
3. **Gerencie Transações**: Entenda como o Activiti gerencia transações e planeje adequadamente.
4. **Teste Exaustivamente**: Teste todos os caminhos possíveis do processo, incluindo cenários de erro.
5. **Monitore o Desempenho**: Implemente métricas para monitorar o desempenho dos processos em produção.
6. **Versione seus Processos**: Use versionamento adequado para gerenciar mudanças nos processos ao longo do tempo.
7. **Considere a Segurança**: Implemente controles de acesso adequados para tarefas e dados sensíveis.

### Uso de Artefatos BPMN

1. **Use Anotações de Texto para Documentação**: Adicione anotações para explicar elementos complexos ou regras de negócio.
2. **Agrupe Elementos Relacionados**: Use grupos para organizar visualmente elementos relacionados.
3. **Documente o Fluxo de Dados**: Use data objects e associações para mostrar como os dados fluem pelo processo.
4. **Mantenha a Consistência Visual**: Use cores e estilos consistentes para melhorar a legibilidade.
5. **Evite Excesso de Artefatos**: Use artefatos com moderação para evitar diagramas sobrecarregados.

### Integração com Sistemas Externos

1. **Use Tarefas de Serviço para Integração**: Implemente tarefas de serviço para interagir com sistemas externos.
2. **Gerencie Timeouts**: Implemente timeouts para evitar que processos fiquem presos aguardando sistemas externos.
3. **Implemente Tratamento de Erros**: Use eventos de erro para lidar com falhas em integrações.
4. **Considere Transações Distribuídas**: Planeje como lidar com transações que envolvem múltiplos sistemas.
5. **Registre Interações**: Mantenha registros detalhados das interações com sistemas externos para depuração.

### Gerenciamento de Usuários e Tarefas

1. **Defina Claramente Papéis e Responsabilidades**: Use candidateUsers e candidateGroups de forma consistente.
2. **Implemente Escalação**: Use eventos de borda temporizados para escalar tarefas não concluídas.
3. **Forneça Informações Contextuais**: Inclua dados relevantes nas tarefas para ajudar os usuários a tomar decisões.
4. **Considere a Experiência do Usuário**: Projete formulários e interfaces de usuário intuitivos.
5. **Implemente Notificações**: Use listeners para enviar notificações sobre tarefas novas ou atrasadas.

## Limitações Conhecidas e Soluções Alternativas

### Limitação 1: Suporte Limitado para Gateway Complexo

**Problema**: O Activiti não implementa completamente o gateway complexo da especificação BPMN 2.0.

**Solução Alternativa**: Use combinações de gateways exclusivos e inclusivos para implementar a mesma lógica. Em casos complexos, considere mover a lógica de decisão para uma tarefa de script ou serviço antes do gateway.

**Exemplo**:
```xml
<!-- Em vez de um gateway complexo -->
<scriptTask id="evaluateConditions" name="Evaluate Conditions" scriptFormat="groovy">
  <script>
    // Avaliar condições complexas e definir variáveis de decisão
    execution.setVariable("condition1Met", price > 1000 && customerType == "PREMIUM");
    execution.setVariable("condition2Met", quantity > 10 || urgentDelivery == true);
    execution.setVariable("condition3Met", stockLevel < 5 && !alternativeAvailable);
  </script>
</scriptTask>

<exclusiveGateway id="decisionGateway" name="Decision Gateway" />

<sequenceFlow id="flow1" sourceRef="decisionGateway" targetRef="path1">
  <conditionExpression xsi:type="tFormalExpression">${condition1Met}</conditionExpression>
</sequenceFlow>

<sequenceFlow id="flow2" sourceRef="decisionGateway" targetRef="path2">
  <conditionExpression xsi:type="tFormalExpression">${condition2Met}</conditionExpression>
</sequenceFlow>

<sequenceFlow id="flow3" sourceRef="decisionGateway" targetRef="path3">
  <conditionExpression xsi:type="tFormalExpression">${condition3Met}</conditionExpression>
</sequenceFlow>
```

### Limitação 2: Subprocessos de Transação

**Problema**: O Activiti tem suporte limitado para subprocessos de transação, especialmente para compensação complexa.

**Solução Alternativa**: Implemente sua própria lógica de transação usando subprocessos regulares e eventos de erro. Use variáveis de processo para rastrear o estado da transação e implementar compensação manualmente.

**Exemplo**:
```xml
<subProcess id="transactionProcess" name="Transaction Process">
  <startEvent id="transactionStart" />
  
  <sequenceFlow id="flow1" sourceRef="transactionStart" targetRef="step1" />
  <serviceTask id="step1" name="Step 1" activiti:class="org.example.Step1Executor" />
  
  <sequenceFlow id="flow2" sourceRef="step1" targetRef="step2" />
  <serviceTask id="step2" name="Step 2" activiti:class="org.example.Step2Executor" />
  
  <sequenceFlow id="flow3" sourceRef="step2" targetRef="step3" />
  <serviceTask id="step3" name="Step 3" activiti:class="org.example.Step3Executor" />
  
  <sequenceFlow id="flow4" sourceRef="step3" targetRef="transactionEnd" />
  <endEvent id="transactionEnd" />
</subProcess>

<boundaryEvent id="transactionError" attachedToRef="transactionProcess">
  <errorEventDefinition errorRef="transactionError" />
</boundaryEvent>

<sequenceFlow id="flow5" sourceRef="transactionError" targetRef="compensationHandler" />
<serviceTask id="compensationHandler" name="Handle Compensation" activiti:class="org.example.CompensationHandler" />
```

### Limitação 3: Eventos de Compensação Complexos

**Problema**: O Activiti tem suporte limitado para cenários complexos de compensação.

**Solução Alternativa**: Implemente sua própria lógica de compensação usando tarefas de serviço e variáveis de processo para rastrear o que precisa ser compensado.

**Exemplo**:
```java
public class CompensationHandler implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        // Obter o ponto de falha
        String failedStep = (String) execution.getVariable("failedStep");
        
        // Compensar as etapas concluídas na ordem inversa
        if ("step3".equals(failedStep)) {
            compensateStep3(execution);
        }
        
        if ("step3".equals(failedStep) || "step2".equals(failedStep)) {
            compensateStep2(execution);
        }
        
        if ("step3".equals(failedStep) || "step2".equals(failedStep) || "step1".equals(failedStep)) {
            compensateStep1(execution);
        }
    }
    
    private void compensateStep3(DelegateExecution execution) {
        // Lógica para desfazer step3
    }
    
    private void compensateStep2(DelegateExecution execution) {
        // Lógica para desfazer step2
    }
    
    private void compensateStep1(DelegateExecution execution) {
        // Lógica para desfazer step1
    }
}
```

### Limitação 4: Fluxos de Mensagem entre Pools

**Problema**: O Activiti tem limitações na execução de fluxos de mensagem entre pools.

**Solução Alternativa**: Use a API do Activiti para implementar a comunicação entre processos. Você pode usar o serviço de runtime para enviar mensagens entre instâncias de processo.

**Exemplo**:
```java
// No processo remetente
public class SendMessageDelegate implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        String targetProcessInstanceId = (String) execution.getVariable("targetProcessInstanceId");
        String messageName = "PaymentReceivedMessage";
        
        // Preparar dados da mensagem
        Map<String, Object> messageVariables = new HashMap<>();
        messageVariables.put("amount", execution.getVariable("paymentAmount"));
        messageVariables.put("timestamp", new Date());
        
        // Enviar a mensagem para o processo alvo
        RuntimeService runtimeService = execution.getEngineServices().getRuntimeService();
        runtimeService.messageEventReceived(messageName, targetProcessInstanceId, messageVariables);
    }
}

// No processo destinatário, configure um evento de captura de mensagem
<intermediateCatchEvent id="receivePayment">
  <messageEventDefinition messageRef="PaymentReceivedMessage" />
</intermediateCatchEvent>
```

### Limitação 5: Eventos de Link

**Problema**: O Activiti tem suporte limitado para eventos de link.

**Solução Alternativa**: Use variáveis de processo e gateways exclusivos para implementar a mesma funcionalidade.

**Exemplo**:
```xml
<!-- Em vez de eventos de link -->
<exclusiveGateway id="gateway1" name="Link Source" />
<sequenceFlow id="flow1" sourceRef="gateway1" targetRef="targetTask">
  <conditionExpression xsi:type="tFormalExpression">${linkTarget == 'targetTask'}</conditionExpression>
</sequenceFlow>
<sequenceFlow id="flow2" sourceRef="gateway1" targetRef="anotherTask">
  <conditionExpression xsi:type="tFormalExpression">${linkTarget == 'anotherTask'}</conditionExpression>
</sequenceFlow>

<!-- Definir o alvo do link -->
<serviceTask id="setLinkTarget" name="Set Link Target" activiti:expression="${execution.setVariable('linkTarget', 'targetTask')}" />
<sequenceFlow id="flow3" sourceRef="setLinkTarget" targetRef="gateway1" />
```

## Referências

1. [Activiti User Guide](https://www.activiti.org/userguide/)
2. [Activiti in Action (Manning Publications)](https://livebook.manning.com/book/activiti-in-action/appendix-b)
3. [Activiti BPMN Extensions XSD](https://github.com/AlfrescoArchive/Activiti-Designer/blob/master/org.activiti.designer.eclipse/xsd/activiti-bpmn-extensions-5.4.xsd)
4. [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
5. [Activiti GitHub Repository](https://github.com/Activiti/Activiti)
6. [Flowable Documentation on Text Annotations](https://documentation.flowable.com/latest/reactmodel/bpmn/reference/text-annotation)
7. [Visual Paradigm BPMN Artifact Types](https://www.visual-paradigm.com/guide/bpmn/bpmn-artifact-types-explained/)
8. [BPMN Data Objects and Data Stores - BPM Tips](https://bpmtips.com/bpmn-miwg-demonstration-2018-nearly-everything-you-always-wanted-to-know-about-data-objects-but-were-afraid-to-ask/)
9. [Activiti BPMN Model Maven Repository](https://mvnrepository.com/artifact/org.activiti/activiti-bpmn-model)
10. [Appendix B. BPMN 2.0 supported elements in Activiti](https://livebook.manning.com/book/activiti-in-action/appendix-b)
11. [BPMN.io Forum on Data Stores](https://forum.bpmn.io/t/data-stores-to-share-data-in-between-processes-pools/469)
12. [Camunda BPMN Implementation Reference](https://docs.camunda.org/manual/7.15/reference/bpmn20/)
13. [Activiti API Documentation](https://www.activiti.org/javadocs/)
14. [Activiti Forum](https://community.alfresco.com/community/bpm/content)
15. [BPMN 2.0 by Example](https://www.omg.org/spec/BPMN/2.0/examples/PDF)
