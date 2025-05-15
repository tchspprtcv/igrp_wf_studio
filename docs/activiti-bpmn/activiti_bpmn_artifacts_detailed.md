# Propriedades Detalhadas dos Artefatos BPMN 2.0 no Activiti

Este documento apresenta uma análise detalhada das propriedades específicas dos artefatos BPMN 2.0 implementados pelo Activiti, com foco em anotações de texto, grupos, associações, data objects e data stores.

## Sumário

1. [Introdução](#introdução)
2. [Anotações de Texto (Text Annotations)](#anotações-de-texto-text-annotations)
   - [Propriedades Específicas](#propriedades-específicas-das-anotações-de-texto)
   - [Implementação XML](#implementação-xml-das-anotações-de-texto)
   - [Exemplos Práticos](#exemplos-práticos-de-anotações-de-texto)
3. [Grupos (Groups)](#grupos-groups)
   - [Propriedades Específicas](#propriedades-específicas-dos-grupos)
   - [Implementação XML](#implementação-xml-dos-grupos)
   - [Exemplos Práticos](#exemplos-práticos-de-grupos)
4. [Associações (Associations)](#associações-associations)
   - [Propriedades Específicas](#propriedades-específicas-das-associações)
   - [Implementação XML](#implementação-xml-das-associações)
   - [Exemplos Práticos](#exemplos-práticos-de-associações)
5. [Data Objects e Data Stores](#data-objects-e-data-stores)
   - [Propriedades Específicas dos Data Objects](#propriedades-específicas-dos-data-objects)
   - [Propriedades Específicas dos Data Stores](#propriedades-específicas-dos-data-stores)
   - [Implementação XML](#implementação-xml-de-data-objects-e-data-stores)
   - [Exemplos Práticos](#exemplos-práticos-de-data-objects-e-data-stores)
6. [Considerações para Desenvolvimento](#considerações-para-desenvolvimento)
7. [Referências](#referências)

## Introdução

Os artefatos BPMN 2.0 são elementos que fornecem informações adicionais sobre o processo sem afetar diretamente o fluxo de execução. No Activiti, esses artefatos são implementados seguindo a especificação BPMN 2.0, com algumas extensões específicas para melhorar a funcionalidade e a integração com o motor de workflow.

Este documento detalha as propriedades específicas de cada tipo de artefato, sua implementação no XML e exemplos práticos de uso no desenvolvimento com Activiti.

## Anotações de Texto (Text Annotations)

As anotações de texto são usadas para adicionar informações descritivas aos diagramas de processo. Elas são representadas como retângulos abertos com texto e são conectadas a elementos do processo por meio de associações.

### Propriedades Específicas das Anotações de Texto

As anotações de texto no Activiti possuem as seguintes propriedades específicas:

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único da anotação no modelo de processo | Geral |
| **name** | String | Nome descritivo da anotação (opcional) | Geral |
| **documentation** | String | Texto explicativo sobre o propósito da anotação (opcional) | Geral |
| **text** | String | O conteúdo textual exibido na anotação | Geral |
| **textFormat** | String | Formato MIME do texto (ex: "text/plain", "text/html") | Geral |
| **includeInHistory** | Boolean | Determina se a anotação deve ser incluída nos dados históricos do processo | Avançado |

Além dessas propriedades funcionais, o Activiti também suporta propriedades visuais que afetam apenas a aparência do diagrama:

| Propriedade Visual | Tipo | Descrição |
|--------------------|------|-----------|
| **fontSize** | Integer | Tamanho da fonte usada na anotação |
| **fontWeight** | String | Peso da fonte (Normal, Bold) |
| **fontStyle** | String | Estilo da fonte (Normal, Italic) |
| **fontColor** | String | Cor da fonte |
| **backgroundColor** | String | Cor de fundo da anotação |
| **borderColor** | String | Cor da borda da anotação |

### Implementação XML das Anotações de Texto

No XML BPMN 2.0, as anotações de texto são representadas pelo elemento `<textAnnotation>`, que pode conter um elemento filho `<text>` para o conteúdo da anotação:

```xml
<textAnnotation id="textAnnotation_1">
  <text>Esta é uma anotação explicativa sobre o processo</text>
</textAnnotation>
```

Para conectar a anotação a um elemento do processo, é necessário usar uma associação:

```xml
<association id="association_1" sourceRef="task_1" targetRef="textAnnotation_1" />
```

### Exemplos Práticos de Anotações de Texto

#### Exemplo 1: Anotação Simples

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

#### Exemplo 2: Anotação com Formato HTML

```xml
<textAnnotation id="annotation_2" textFormat="text/html">
  <text><![CDATA[<b>Importante:</b> Verificar todos os <i>documentos</i> antes de prosseguir]]></text>
</textAnnotation>
```

#### Exemplo 3: Uso Programático com a API Java do Activiti

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

## Grupos (Groups)

Os grupos são artefatos que permitem organizar visualmente elementos relacionados em um diagrama BPMN, sem afetar o fluxo de execução do processo. Eles são representados como retângulos arredondados com bordas tracejadas.

### Propriedades Específicas dos Grupos

Os grupos no Activiti possuem as seguintes propriedades específicas:

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único do grupo no modelo de processo | Geral |
| **name** | String | Nome descritivo do grupo (opcional) | Geral |
| **documentation** | String | Texto explicativo sobre o propósito do grupo (opcional) | Geral |
| **categoryValueRef** | String | Referência a um valor de categoria que classifica o grupo | Geral |

Propriedades visuais dos grupos:

| Propriedade Visual | Tipo | Descrição |
|--------------------|------|-----------|
| **borderColor** | String | Cor da borda do grupo |
| **backgroundColor** | String | Cor de fundo do grupo |
| **fontColor** | String | Cor da fonte usada no nome do grupo |
| **fontSize** | Integer | Tamanho da fonte do nome do grupo |

### Implementação XML dos Grupos

No XML BPMN 2.0, os grupos são representados pelo elemento `<group>`:

```xml
<group id="group_1" name="Tarefas de Pagamento" categoryValueRef="category_1" />
```

A propriedade `categoryValueRef` faz referência a uma categoria definida no modelo:

```xml
<category id="category_1">
  <categoryValue id="value_1" value="Pagamento" />
</category>
```

### Exemplos Práticos de Grupos

#### Exemplo 1: Grupo Simples

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

#### Exemplo 2: Uso Programático com a API Java do Activiti

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

## Associações (Associations)

As associações são artefatos que conectam elementos de informação (como anotações de texto) a elementos de fluxo (como tarefas ou eventos). Elas são representadas como linhas pontilhadas.

### Propriedades Específicas das Associações

As associações no Activiti possuem as seguintes propriedades específicas:

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único da associação no modelo de processo | Geral |
| **name** | String | Nome descritivo da associação (opcional) | Geral |
| **documentation** | String | Texto explicativo sobre o propósito da associação (opcional) | Geral |
| **sourceRef** | String | Referência ao elemento de origem da associação | Geral |
| **targetRef** | String | Referência ao elemento de destino da associação | Geral |
| **associationDirection** | String | Direção da associação: "None", "One", "Both" | Geral |

Propriedades visuais das associações:

| Propriedade Visual | Tipo | Descrição |
|--------------------|------|-----------|
| **lineColor** | String | Cor da linha da associação |
| **lineWidth** | Integer | Espessura da linha da associação |
| **lineStyle** | String | Estilo da linha (Solid, Dotted, Dashed) |

### Implementação XML das Associações

No XML BPMN 2.0, as associações são representadas pelo elemento `<association>`:

```xml
<association id="association_1" sourceRef="task_1" targetRef="textAnnotation_1" associationDirection="None" />
```

Os valores possíveis para `associationDirection` são:
- **None**: Sem direção específica (padrão)
- **One**: Direção única, da origem para o destino
- **Both**: Direção bidirecional

### Exemplos Práticos de Associações

#### Exemplo 1: Associação Simples

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

#### Exemplo 2: Associação com Direção

```xml
<dataObject id="dataObject_1" name="Customer Data" />
<userTask id="processTask" name="Process Customer Data" />
<association id="association_2" sourceRef="dataObject_1" targetRef="processTask" associationDirection="One" />
```

#### Exemplo 3: Uso Programático com a API Java do Activiti

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

## Data Objects e Data Stores

Data Objects e Data Stores são artefatos que representam dados no processo. Data Objects representam informações que fluem através do processo, enquanto Data Stores representam repositórios de dados persistentes.

### Propriedades Específicas dos Data Objects

Os Data Objects no Activiti possuem as seguintes propriedades específicas:

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único do Data Object no modelo de processo | Geral |
| **name** | String | Nome descritivo do Data Object | Geral |
| **documentation** | String | Texto explicativo sobre o propósito do Data Object (opcional) | Geral |
| **itemSubjectRef** | String | Referência ao tipo de dados do Data Object | Geral |
| **dataState** | String | Estado atual do Data Object (ex: "for analysis", "analyzed") | Geral |
| **isCollection** | Boolean | Indica se o Data Object representa uma coleção de itens | Geral |

### Propriedades Específicas dos Data Stores

Os Data Stores no Activiti possuem as seguintes propriedades específicas:

| Propriedade | Tipo | Descrição | Categoria |
|-------------|------|-----------|-----------|
| **id** | String | Identificador único do Data Store no modelo de processo | Geral |
| **name** | String | Nome descritivo do Data Store | Geral |
| **documentation** | String | Texto explicativo sobre o propósito do Data Store (opcional) | Geral |
| **itemSubjectRef** | String | Referência ao tipo de dados do Data Store | Geral |
| **capacity** | Integer | Capacidade do Data Store (opcional) | Geral |
| **isUnlimited** | Boolean | Indica se o Data Store tem capacidade ilimitada | Geral |
| **includeInHistory** | Boolean | Determina se o Data Store deve ser incluído nos dados históricos do processo | Avançado |

### Implementação XML de Data Objects e Data Stores

#### Data Object no XML BPMN 2.0

```xml
<dataObject id="dataObject_1" name="Customer Request" itemSubjectRef="xsd:string">
  <dataState>for analysis</dataState>
</dataObject>

<dataObjectReference id="dataObjectRef_1" name="Customer Request [for analysis]" dataObjectRef="dataObject_1" />
```

#### Data Store no XML BPMN 2.0

```xml
<dataStore id="dataStore_1" name="Customer Database" capacity="1000" isUnlimited="false" />
<dataStoreReference id="dataStoreRef_1" name="Customer Database" dataStoreRef="dataStore_1" />
```

#### Data Associations no XML BPMN 2.0

```xml
<dataInputAssociation id="dataInput_1">
  <sourceRef>dataObjectRef_1</sourceRef>
  <targetRef>task_1</targetRef>
</dataInputAssociation>

<dataOutputAssociation id="dataOutput_1">
  <sourceRef>task_1</sourceRef>
  <targetRef>dataStoreRef_1</targetRef>
</dataOutputAssociation>
```

### Exemplos Práticos de Data Objects e Data Stores

#### Exemplo 1: Processo com Data Object

```xml
<process id="customerOnboarding" name="Customer Onboarding">
  <startEvent id="startEvent" name="Start" />
  <userTask id="collectData" name="Collect Customer Data" />
  <userTask id="verifyData" name="Verify Customer Data" />
  <endEvent id="endEvent" name="End" />
  
  <dataObject id="customerData" name="Customer Data" />
  <dataObjectReference id="customerDataRef1" name="Customer Data [collected]" dataObjectRef="customerData" />
  <dataObjectReference id="customerDataRef2" name="Customer Data [verified]" dataObjectRef="customerData" />
  
  <sequenceFlow id="flow_1" sourceRef="startEvent" targetRef="collectData" />
  <sequenceFlow id="flow_2" sourceRef="collectData" targetRef="verifyData" />
  <sequenceFlow id="flow_3" sourceRef="verifyData" targetRef="endEvent" />
  
  <dataOutputAssociation id="dataOutput_1">
    <sourceRef>collectData</sourceRef>
    <targetRef>customerDataRef1</targetRef>
  </dataOutputAssociation>
  
  <dataInputAssociation id="dataInput_1">
    <sourceRef>customerDataRef1</sourceRef>
    <targetRef>verifyData</targetRef>
  </dataInputAssociation>
  
  <dataOutputAssociation id="dataOutput_2">
    <sourceRef>verifyData</sourceRef>
    <targetRef>customerDataRef2</targetRef>
  </dataOutputAssociation>
</process>
```

#### Exemplo 2: Processo com Data Store

```xml
<process id="customerManagement" name="Customer Management">
  <startEvent id="startEvent" name="Start" />
  <userTask id="updateCustomer" name="Update Customer Information" />
  <endEvent id="endEvent" name="End" />
  
  <dataStore id="customerDB" name="Customer Database" />
  <dataStoreReference id="customerDBRef" name="Customer Database" dataStoreRef="customerDB" />
  
  <sequenceFlow id="flow_1" sourceRef="startEvent" targetRef="updateCustomer" />
  <sequenceFlow id="flow_2" sourceRef="updateCustomer" targetRef="endEvent" />
  
  <dataInputAssociation id="dataInput_1">
    <sourceRef>customerDBRef</sourceRef>
    <targetRef>updateCustomer</targetRef>
  </dataInputAssociation>
  
  <dataOutputAssociation id="dataOutput_1">
    <sourceRef>updateCustomer</sourceRef>
    <targetRef>customerDBRef</targetRef>
  </dataOutputAssociation>
</process>
```

#### Exemplo 3: Uso Programático com a API Java do Activiti

```java
// Criar um modelo BPMN
BpmnModel bpmnModel = new BpmnModel();
Process process = new Process();
process.setId("customerProcess");
process.setName("Customer Process");
bpmnModel.addProcess(process);

// Criar uma tarefa
UserTask collectDataTask = new UserTask();
collectDataTask.setId("collectData");
collectDataTask.setName("Collect Customer Data");
process.addFlowElement(collectDataTask);

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

// Criar uma associação de saída de dados
DataOutputAssociation dataOutputAssociation = new DataOutputAssociation();
dataOutputAssociation.setId("dataOutput_1");
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
```

## Considerações para Desenvolvimento

Ao trabalhar com artefatos BPMN 2.0 no Activiti, é importante considerar os seguintes pontos:

1. **Propósito Documental**: Os artefatos são principalmente elementos de documentação e não afetam diretamente o fluxo de execução do processo. Eles são úteis para melhorar a compreensão do processo por parte dos stakeholders.

2. **Persistência de Dados**: Data Objects são temporários e existem apenas durante a execução do processo, enquanto Data Stores representam repositórios persistentes que podem ser acessados por múltiplos processos.

3. **Estados dos Data Objects**: Os estados dos Data Objects são geralmente representados como anotações no nome (ex: "Customer Data [verified]") e não como propriedades específicas no XML.

4. **Associações**: As associações são usadas para conectar artefatos a elementos de fluxo, mas não definem o fluxo de execução do processo. Elas são representadas como linhas pontilhadas nos diagramas.

5. **Grupos**: Os grupos são puramente visuais e não têm impacto na execução do processo. Eles são úteis para organizar elementos relacionados em categorias lógicas.

6. **Extensões do Activiti**: O Activiti estende a especificação BPMN 2.0 com propriedades adicionais, como `includeInHistory` para Data Stores, que permitem controlar aspectos específicos do comportamento do motor de workflow.

7. **API Java**: O Activiti fornece uma API Java completa para criar e manipular artefatos BPMN 2.0 programaticamente, o que é útil para geração dinâmica de processos ou para integração com outras ferramentas.

## Referências

1. [Activiti User Guide](https://www.activiti.org/userguide/)
2. [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
3. [Flowable Documentation on Text Annotations](https://documentation.flowable.com/latest/reactmodel/bpmn/reference/text-annotation)
4. [Visual Paradigm BPMN Artifact Types](https://www.visual-paradigm.com/guide/bpmn/bpmn-artifact-types-explained/)
5. [BPMN Data Objects and Data Stores - BPM Tips](https://bpmtips.com/bpmn-miwg-demonstration-2018-nearly-everything-you-always-wanted-to-know-about-data-objects-but-were-afraid-to-ask/)
6. [Activiti BPMN Model Maven Repository](https://mvnrepository.com/artifact/org.activiti/activiti-bpmn-model)
7. [Activiti GitHub Repository](https://github.com/Activiti/Activiti)
8. [Appendix B. BPMN 2.0 supported elements in Activiti](https://livebook.manning.com/book/activiti-in-action/appendix-b)
9. [BPMN.io Forum on Data Stores](https://forum.bpmn.io/t/data-stores-to-share-data-in-between-processes-pools/469)
