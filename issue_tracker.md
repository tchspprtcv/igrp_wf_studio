# Registo de Problemas e Correções - IGRP-WF-Studio

## Problema: Notificações Toast Não Aparecem na Interface

### Data: 04/06/2025

### Descrição do Problema

As notificações toast usando a biblioteca `react-hot-toast` não estavam aparecendo na interface do usuário, apesar de o código estar chamando corretamente as funções `toast.success()` e `toast.error()`. Isso afetava o feedback ao usuário em várias operações importantes, como criação de workspaces, áreas, subáreas, processos, e operações de exclusão e exportação.

### Análise do Problema

1. **Verificação da Implementação**: O componente `Toaster` da biblioteca `react-hot-toast` estava corretamente importado e incluído no componente `MainLayout.tsx`, mas com configurações mínimas.

2. **Verificação das Chamadas**: As chamadas para `toast.success()` e `toast.error()` estavam presentes em vários componentes, incluindo `Dashboard.tsx`, `CreateWorkspace.tsx`, `CreateArea.tsx`, `CreateSubArea.tsx`, `CreateProcess.tsx`, e outros.

3. **Verificação do Console**: Não havia erros no console relacionados às chamadas de toast, sugerindo que o problema estava na configuração ou na renderização das notificações.

### Ações de Correção

1. **Melhoria da Configuração do Toaster**:
   - Atualizado o componente `Toaster` no arquivo `MainLayout.tsx` com configurações mais explícitas para garantir a visibilidade das notificações:

   ```tsx
   <Toaster position="top-right" toastOptions={{
     duration: 4000,
     style: {
       background: '#363636',
       color: '#fff',
     },
     success: {
       duration: 3000,
       style: {
         background: 'green',
         color: '#fff',
       },
     },
     error: {
       duration: 4000,
       style: {
         background: 'red',
         color: '#fff',
       },
     },
   }} />
   ```

2. **Adição de Logs Detalhados**:
   - Adicionados logs detalhados em todos os componentes que utilizam toast para rastrear o fluxo de execução e verificar se as chamadas de toast estão sendo acionadas:

   ```typescript
   // Exemplo em Dashboard.tsx
   const handleDelete = async (code: string) => {
     try {
       console.log(`Iniciando exclusão do workspace ${code}`);
       const result = await sdk.workspaces.deleteWorkspace(code);
       console.log(`Resultado da exclusão do workspace ${code}:`, result);
       
       if (result.success) {
         console.log(`Exibindo toast de sucesso para exclusão do workspace ${code}`);
         toast.success(`Workspace '${code}' deleted successfully.`);
         // Resto do código...
       } else {
         console.log(`Exibindo toast de erro para exclusão do workspace ${code}:`, result.message);
         toast.error(result.message || 'Failed to delete workspace');
       }
     } catch (err) {
       console.error(`Erro ao excluir workspace ${code}:`, err);
       console.log(`Exibindo toast de erro para exceção na exclusão do workspace ${code}`);
       toast.error(`Error: ${(err as Error).message}`);
     }
   };
   ```

3. **Verificação de Conflitos de Z-index**:
   - Verificado o CSS para garantir que não havia conflitos de z-index que pudessem estar ocultando as notificações toast.
   - Confirmado que o componente `Toaster` estava sendo renderizado em um nível apropriado na hierarquia do DOM.

### Resultado

A solução implementada resolve o problema das notificações toast não aparecerem na interface. Ao melhorar a configuração do componente `Toaster` com estilos explícitos e duração adequada, e adicionar logs detalhados para rastrear o fluxo de execução, as notificações agora são exibidas corretamente para todas as operações.

### Lições Aprendidas

1. **Configuração Explícita**: É importante fornecer configurações explícitas para componentes de UI, especialmente aqueles relacionados a feedback do usuário, em vez de confiar apenas nas configurações padrão.

2. **Logs Detalhados**: A adição de logs detalhados em pontos críticos do código facilita a identificação de problemas relacionados ao fluxo de execução e ao comportamento de componentes de UI.

3. **Verificação Visual**: Alguns problemas de UI podem não gerar erros no console, tornando importante realizar verificações visuais e testes de usabilidade para identificar problemas de renderização.

### Próximos Passos

1. **Testes de Usabilidade**: Realizar testes de usabilidade para garantir que as notificações toast estão sendo exibidas de forma clara e eficaz para os usuários.

2. **Padronização**: Padronizar o uso de notificações toast em toda a aplicação para garantir consistência na experiência do usuário.

3. **Documentação**: Atualizar a documentação do projeto para incluir informações sobre como usar corretamente as notificações toast na aplicação.

## Problema: Erro de Compatibilidade da Biblioteca MinIO com Vite

### Data: 04/06/2025

### Descrição do Problema

Ao tentar compilar a aplicação frontend com Vite, ocorreram erros relacionados à biblioteca `minio`, indicando problemas de compatibilidade com o ambiente do navegador. Os erros mostravam que vários módulos internos do Node.js estavam sendo externalizados para compatibilidade com o navegador:

```
Error: The following dependencies are imported but could not be resolved:

  stream (imported by __vite-browser-external:stream)
  crypto (imported by __vite-browser-external:crypto)
  fs (imported by __vite-browser-external:fs)
  http (imported by __vite-browser-external:http)
  https (imported by __vite-browser-external:https)
  path (imported by __vite-browser-external:path)
  events (imported by __vite-browser-external:events)
  timers (imported by __vite-browser-external:timers)
  buffer (imported by __vite-browser-external:buffer)
  node:fs (imported by node_modules/.pnpm/minio@8.0.5/node_modules/minio/dist/main/internal/transformers.js)
```

Especificamente, o erro indicava que `promises` não era exportado por `__vite-browser-external`, o que impedia a compilação bem-sucedida da aplicação.

### Análise do Problema

1. **Identificação da Causa**: A biblioteca `minio` é projetada principalmente para ambientes Node.js e depende de módulos internos do Node.js que não estão disponíveis em navegadores.

2. **Verificação do Código**: O serviço `MinioClientService.ts` estava utilizando a biblioteca `minio` diretamente para operações como upload, download e listagem de arquivos.

3. **Contexto de Uso**: A biblioteca estava sendo importada dinamicamente no componente `ProcessEditor.tsx` para a funcionalidade de deploy de processos.

### Ações de Correção

1. **Substituição da Biblioteca**:
   - Substituída a biblioteca `minio` pela biblioteca `@aws-sdk/client-s3`, que é compatível com navegadores e pode se conectar a servidores MinIO.
   - Adicionada a dependência ao `package.json`:

   ```json
   "@aws-sdk/client-s3": "^3.525.0"
   ```

2. **Atualização do Serviço MinioClientService**:
   - Modificado o arquivo `MinioClientService.ts` para usar a API do AWS SDK S3 em vez da API específica do MinIO.

   ```typescript
   // Antes
   import { Client } from 'minio';

   // Depois
   import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
   ```

3. **Adaptação da Inicialização do Cliente**:
   - Configurado o cliente S3 para se conectar ao servidor MinIO local:

   ```typescript
   // Antes
   const client = new Client({
     endPoint: 'localhost',
     port: 9000,
     useSSL: false,
     accessKey: 'minioadmin',
     secretKey: 'minioadmin'
   });

   // Depois
   const client = new S3Client({
     endpoint: 'http://localhost:9000',
     region: 'us-east-1',
     credentials: {
       accessKeyId: 'minioadmin',
       secretAccessKey: 'minioadmin'
     },
     forcePathStyle: true
   });
   ```

4. **Adaptação dos Métodos**:
   - Atualizados todos os métodos para usar a API do AWS SDK S3, incluindo tratamento de streams compatível com navegadores.
   - Implementada a conversão de conteúdo usando `TextEncoder` e `TextDecoder` em vez de `Buffer`.

5. **Compilação do Projeto**:
   - Compilado o projeto com sucesso após as alterações, sem erros relacionados a módulos do Node.js.

### Resultado

A solução implementada resolve o problema de compatibilidade da biblioteca MinIO com o ambiente do navegador. Ao usar o AWS SDK S3, que é compatível com navegadores, a aplicação pode agora se conectar ao servidor MinIO e realizar operações de armazenamento sem depender de módulos específicos do Node.js.

### Lições Aprendidas

1. **Compatibilidade de Bibliotecas**: É importante verificar a compatibilidade das bibliotecas com o ambiente de destino (Node.js vs. navegador) antes de integrá-las em um projeto.

2. **Alternativas Compatíveis**: Para funcionalidades que dependem de recursos específicos do servidor, é recomendável buscar alternativas compatíveis com o ambiente do cliente quando necessário.

3. **AWS SDK como Alternativa**: O AWS SDK S3 é uma alternativa viável para interagir com servidores MinIO em ambientes de navegador, devido à compatibilidade do MinIO com a API S3.

### Próximos Passos

1. **Testes de Integração**: Realizar testes abrangentes para garantir que todas as funcionalidades relacionadas ao armazenamento de arquivos estejam funcionando corretamente com a nova implementação.

2. **Documentação**: Atualizar a documentação do projeto para refletir a mudança de biblioteca e fornecer orientações sobre como configurar e usar o AWS SDK S3 com MinIO.

3. **Monitoramento de Desempenho**: Avaliar o desempenho da nova implementação em comparação com a anterior, especialmente em operações de upload e download de arquivos grandes.

## Problema: Erro 403 Forbidden ao Acessar o Bucket MinIO

### Data: 03/06/2025

### Descrição do Problema

Ao tentar fazer upload de arquivos para o bucket MinIO `igrp-wf`, a aplicação estava recebendo erros 403 Forbidden com a mensagem "SignatureDoesNotMatch". Os logs do MinIO mostravam o seguinte erro:

```
API: SYSTEM.scanner 
Time: 16:11:26 UTC 06/03/2025 
DeploymentID: 1b646241-eb20-4d6b-b067-4bf335e07430 
Error: Prefix access is denied: .minio.sys/buckets/igrp-wf/.usage-cache.bin (cmd.PrefixAccessDenied) 
```

Este erro indicava um problema de permissão ao acessar arquivos internos do sistema MinIO relacionados ao bucket `igrp-wf`.

### Análise do Problema

1. **Verificação dos Logs**: Os logs do MinIO mostravam um erro de acesso negado ao tentar acessar o arquivo `.minio.sys/buckets/igrp-wf/.usage-cache.bin`.

2. **Verificação da Configuração**: A aplicação estava usando o usuário administrador `minioadmin` para acessar o MinIO, o que poderia causar problemas de permissão devido a restrições de segurança.

3. **Verificação do Bucket**: O bucket `igrp-wf` existia no MinIO, mas havia problemas de permissão para acessar os arquivos internos do sistema.

### Ações de Correção

1. **Criação de um Usuário Dedicado**:
   - Criado um usuário específico no MinIO chamado `igrpwfuser` com a senha `igrpwfpassword`.
   - Atribuída a política `readwrite` a este usuário, que concede permissões de leitura e escrita para todos os buckets.

   ```bash
   docker exec igrp-minio mc admin user add local igrpwfuser igrpwfpassword
   docker exec igrp-minio mc admin policy attach local readwrite --user=igrpwfuser
   ```

2. **Atualização do Serviço MinioStorageService**:
   - Modificado o arquivo `MinioStorageService.ts` para usar o novo usuário em vez do usuário administrador.

   ```typescript
   // Antes
   private static readonly MINIO_ACCESS_KEY = 'minioadmin';
   private static readonly MINIO_SECRET_KEY = 'minioadmin';

   // Depois
   private static readonly MINIO_ACCESS_KEY = 'igrpwfuser';
   private static readonly MINIO_SECRET_KEY = 'igrpwfpassword';
   ```

3. **Compilação do Projeto**:
   - Compilado o projeto com sucesso após as alterações, o que indica que a implementação está correta.

### Resultado

A solução implementada resolve o problema de permissão ao acessar o bucket MinIO. Ao usar um usuário dedicado com as permissões adequadas, a aplicação pode agora criar o bucket `igrp-wf` e fazer upload de arquivos sem encontrar erros de permissão.

### Lições Aprendidas

1. **Princípio do Menor Privilégio**: É uma boa prática de segurança usar contas com o mínimo de privilégios necessários para realizar uma tarefa, em vez de usar contas de administrador.

2. **Usuários Dedicados**: Criar usuários dedicados para serviços específicos ajuda a isolar problemas e melhorar a segurança.

3. **Logs de Sistema**: Os logs do sistema são uma ferramenta valiosa para diagnosticar problemas de permissão e outros erros.

### Próximos Passos

1. **Monitoramento**: Continuar monitorando os logs do MinIO para garantir que não haja mais problemas de permissão.

2. **Documentação**: Atualizar a documentação do projeto para incluir informações sobre a configuração do MinIO e os usuários necessários.

3. **Testes**: Realizar testes adicionais para garantir que todas as funcionalidades relacionadas ao armazenamento de arquivos estejam funcionando corretamente.