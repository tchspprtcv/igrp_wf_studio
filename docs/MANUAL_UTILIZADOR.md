# Manual do Utilizador - IGRP Workflow Studio

Bem-vindo ao IGRP Workflow Studio! Este manual destina-se a ajudar os utilizadores a compreender e utilizar as funcionalidades da aplicação.

## 1. O que é o IGRP Workflow Studio?

O IGRP Workflow Studio é uma ferramenta moderna que permite desenhar, gerir e acompanhar processos de trabalho (workflows) de forma visual e intuitiva.

### 1.1. Principais Vantagens:

-   **Design Visual:** Crie e modifique os seus processos de trabalho facilmente usando um editor gráfico.
-   **Organização Clara:** Organize os seus processos em Aplicações, Áreas e SubÁreas para uma melhor gestão.
-   **Interface Moderna:** Desfrute de uma interface de utilizador amigável e responsiva.
-   **Formulários Integrados:** Crie formulários diretamente no editor para tarefas de utilizador.
-   **Tabelas de Decisão:** Defina regras de negócio usando tabelas de decisão visuais.

## 2. Como Começar

Para aceder ao IGRP Workflow Studio, o seu administrador de sistema deverá fornecer-lhe o endereço web (URL). Normalmente, basta abrir esse endereço no seu navegador de internet preferido.

Se estiver a aceder a uma versão de desenvolvimento local (por exemplo, fornecida por um técnico), poderá ser algo como `http://localhost:5173`.

## 3. Funcionalidades Principais

O IGRP Workflow Studio organiza o seu trabalho em diferentes níveis:

### 3.1. Aplicações

Uma "Aplicação" no IGRP Workflow Studio representa um conjunto maior de processos de trabalho relacionados a um objetivo ou departamento específico.

-   **Criar e Gerir Aplicações:** Pode criar novas aplicações para os seus projetos de workflow.
-   **Organização:** As aplicações ajudam a manter os seus processos organizados.
-   **Acompanhamento:** Pode ver o estado e outras informações importantes sobre cada aplicação.

### 3.2. Áreas e SubÁreas

Dentro de cada Aplicação, pode criar "Áreas" e "SubÁreas" para uma organização ainda mais detalhada.

-   **Agrupamento:** Utilize Áreas para agrupar processos que partilham um tema ou função comum.
-   **Estrutura Aninhada:** Crie SubÁreas dentro de Áreas para refinar ainda mais a organização, se necessário.
-   **Configurações Específicas:** É possível que certas configurações ou permissões sejam definidas ao nível da Área.

### 3.3. Designer de Processos

Esta é a ferramenta central onde irá desenhar e modificar os seus processos de trabalho.

-   **Desenho Visual (BPMN 2.0):** Utilize um editor gráfico para arrastar e largar elementos que representam passos, decisões, eventos, etc., no seu processo.
-   **Validação:** A ferramenta pode ajudar a verificar se o seu processo está desenhado corretamente.
-   **Configuração de Elementos:** Clique em cada elemento do seu processo (tarefas, gateways, etc.) para configurar as suas propriedades específicas num painel lateral.
-   **Importar/Exportar:** Pode ser possível importar diagramas de processos existentes ou exportar os que criou.
-   **Zoom do Canvas:** Utilize os controlos de zoom no canto inferior direito ou os atalhos de teclado (Ctrl++, Ctrl+-, Ctrl+0) para navegar em diagramas complexos.

### 3.4. Editores Integrados

#### 3.4.1. Editor de Formulários

Para tarefas que requerem interação do utilizador, pode criar formulários diretamente no editor:

-   **Acesso ao Editor:** Selecione uma tarefa de utilizador (UserTask) ou evento de início (StartEvent) e procure a secção "Formulário" no painel de propriedades.
-   **Criação Visual:** Utilize o editor visual para adicionar campos, definir validações e organizar o layout do formulário.
-   **Pré-visualização:** Veja como o formulário ficará para o utilizador final.
-   **Associação Automática:** O formulário criado fica automaticamente associado à tarefa ou evento selecionado.

#### 3.4.2. Editor de Tabelas de Decisão

Para tarefas que envolvem regras de negócio, pode criar tabelas de decisão:

-   **Acesso ao Editor:** Selecione uma tarefa de regra de negócio (BusinessRuleTask) e procure a secção "Tabela de Decisão" no painel de propriedades.
-   **Definição de Regras:** Crie condições (se) e resultados (então) de forma visual e intuitiva.
-   **Teste de Regras:** Verifique se as suas regras funcionam como esperado.
-   **Associação Automática:** A tabela de decisão fica automaticamente associada à tarefa selecionada.

## 4. Utilização Diária

-   **Navegação:** Familiarize-se com a forma de navegar entre Aplicações, Áreas e os seus respetivos Processos.
-   **Criação de Processos:** Aprenda a criar um novo processo dentro da Aplicação/Área apropriada.
-   **Edição de Processos:** Utilize o Designer de Processos para construir ou modificar os fluxos.
-   **Guardar Alterações:** Certifique-se de que guarda o seu trabalho regularmente.
-   **Criação de Formulários:** Desenhe formulários para tarefas que requerem interação humana.
-   **Definição de Regras:** Crie tabelas de decisão para automatizar decisões baseadas em regras.

## 5. Guia Rápido para Novas Funcionalidades

### 5.1. Como Criar um Formulário

1. Selecione uma tarefa de utilizador (UserTask) ou evento de início (StartEvent) no seu diagrama.
2. No painel de propriedades à direita, localize a secção "Formulário".
3. Clique no botão "Editar Formulário" para abrir o editor visual.
4. Adicione campos ao formulário arrastando-os da paleta para a área de desenho.
5. Configure cada campo (tipo, rótulo, validações, etc.).
6. Clique em "Guardar" para associar o formulário à tarefa ou evento.

### 5.2. Como Criar uma Tabela de Decisão

1. Selecione uma tarefa de regra de negócio (BusinessRuleTask) no seu diagrama.
2. No painel de propriedades à direita, localize a secção "Tabela de Decisão".
3. Clique no botão "Editar Tabela de Decisão" para abrir o editor visual.
4. Defina as variáveis de entrada (condições) e saída (resultados).
5. Adicione regras à tabela, especificando condições e resultados.
6. Clique em "Guardar" para associar a tabela de decisão à tarefa.

### 5.3. Como Utilizar o Zoom

- Para aumentar o zoom: Clique no botão "+" no canto inferior direito ou use Ctrl++.
- Para diminuir o zoom: Clique no botão "-" no canto inferior direito ou use Ctrl+-.
- Para ajustar o zoom à tela: Clique no botão "Fit" no canto inferior direito ou use Ctrl+0.
- Para um zoom específico: Utilize o controlo deslizante entre os botões "+" e "-".

## 6. Suporte

Se encontrar dificuldades ou tiver dúvidas, contacte o administrador do sistema ou a equipa de suporte designada na sua organização.

Esperamos que este manual o ajude a tirar o máximo partido do IGRP Workflow Studio!
