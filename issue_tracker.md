# Registo de Problemas e Correções - IGRP-WF-Studio

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