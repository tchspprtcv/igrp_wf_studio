# MinIO para IGRP-WF-Studio

Este diretório contém a configuração do MinIO, um servidor de armazenamento de objetos compatível com Amazon S3, utilizado para desenvolvimento local.

## Estrutura

- `data/` - Diretório onde os dados do MinIO serão armazenados (criado automaticamente na primeira execução)

## Configuração

O MinIO está configurado no arquivo `docker-compose.yml` na raiz do projeto com as seguintes configurações:

- **Porta API**: 9000
- **Porta Console Web**: 9001
- **Usuário**: minioadmin
- **Senha**: minioadmin

## Como Acessar

- **API S3**: http://localhost:9000
- **Console Web**: http://localhost:9001

## Uso Básico

1. Inicie o serviço com:
   ```
   docker-compose up -d minio
   ```

2. Acesse o console web em http://localhost:9001
   - Login: minioadmin
   - Senha: minioadmin

3. Crie buckets e gerencie seus objetos através da interface web

## Integração com Aplicações

Para integrar com aplicações, utilize as credenciais e endpoint configurados:

```
Endpoint: http://localhost:9000
Access Key: minioadmin
Secret Key: minioadmin
```

## Persistência de Dados

Os dados são persistidos no diretório `./minio/data` e permanecerão mesmo após a reinicialização dos contêineres.