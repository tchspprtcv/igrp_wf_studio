# Integração com MinIO para IGRP-WF-Studio

Este documento descreve como utilizar a integração simplificada com MinIO implementada no projeto IGRP-WF-Studio.

## Visão Geral

Foram criadas duas abordagens para integração com o MinIO:

1. **MinioStorageService**: Implementação manual usando XMLHttpRequest e assinatura AWS4-HMAC-SHA256
2. **MinioClientService**: Implementação simplificada usando a biblioteca oficial do MinIO para JavaScript/TypeScript

## Pré-requisitos

- Node.js e npm/yarn instalados
- Servidor MinIO em execução (por padrão em localhost:9000)

## Instalação da Biblioteca MinIO

Para utilizar o `MinioClientService`, é necessário instalar a biblioteca oficial do MinIO:

```bash
yarn add minio
# ou com npm
npm install minio --save
```

## Configuração

As configurações do MinIO estão definidas diretamente nos serviços. Você pode modificar as seguintes variáveis conforme necessário:

```typescript
// Em MinioClientService.ts
private static client = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'OVn3ueI6Rq4idnvCNxmT',
  secretKey: 'KMZ2qCtMVl5VinrEqz3F35ubwYpaJxYMfDPuvw0p',
  region: 'GMT-1'
});
```

## Como Usar

### Exemplo Básico

```typescript
import MinioClientService from '../services/MinioClientService';

// Upload de arquivo
async function uploadExample() {
  try {
    const content = '<xml>Exemplo de conteúdo</xml>';
    const url = await MinioClientService.uploadFile('exemplo/teste.xml', content);
    console.log('URL do arquivo:', url);
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Download de arquivo
async function downloadExample() {
  try {
    const content = await MinioClientService.downloadFile('exemplo/teste.xml');
    console.log('Conteúdo:', content);
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Listar arquivos
async function listFilesExample() {
  try {
    const files = await MinioClientService.listFiles('exemplo/');
    console.log('Arquivos:', files);
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

### Deploy de Processos BPMN

```typescript
import MinioClientService from '../services/MinioClientService';

async function deployProcess() {
  try {
    const bpmnXml = '<?xml version="1.0" encoding="UTF-8"?>...';
    const url = await MinioClientService.deployProcess('P.exemplo.1', bpmnXml);
    console.log('URL do processo:', url);
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

## Exemplos Completos

Veja exemplos completos no arquivo `src/examples/MinioClientExample.ts`.

## Diferenças entre as Implementações

### MinioStorageService (Implementação Manual)

- Implementa manualmente a autenticação AWS4-HMAC-SHA256
- Usa XMLHttpRequest para comunicação HTTP
- Não requer bibliotecas externas
- Mais complexo de manter e estender

### MinioClientService (Biblioteca Oficial)

- Usa a biblioteca oficial do MinIO
- Implementação mais simples e robusta
- Suporta mais funcionalidades do MinIO
- Requer a instalação da biblioteca `minio`

## Solução de Problemas

### Erro de Região

Se você encontrar erros relacionados à região, verifique se a região configurada (`GMT-1`) corresponde à configuração do seu servidor MinIO.

### Erro de Autenticação

Verifique se as credenciais (accessKey e secretKey) estão corretas e correspondem às configuradas no servidor MinIO.

### Bucket não Existe

O serviço tenta criar o bucket automaticamente se ele não existir. Se você encontrar erros relacionados ao bucket, verifique as permissões do usuário MinIO.

## Recursos Adicionais

- [Documentação oficial do MinIO](https://docs.min.io/)
- [Documentação da API JavaScript/TypeScript do MinIO](https://docs.min.io/docs/javascript-client-api-reference.html)