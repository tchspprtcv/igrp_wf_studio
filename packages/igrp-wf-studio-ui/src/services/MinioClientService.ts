// MinioClientService.ts
// Serviço simplificado para integração com MinIO usando AWS SDK S3 (compatível com navegadores)

import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';

export class MinioClientService {
  private static client: S3Client;
  private static readonly BUCKET_NAME = import.meta.env.VITE_MINIO_BUCKET_NAME || 'igrp-wf';

  /**
   * Inicializa o cliente S3 para conexão com MinIO
   */
  private static initClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        endpoint: import.meta.env.VITE_MINIO_ENDPOINT || 'http://localhost:9000',
        region: import.meta.env.VITE_MINIO_REGION || 'GMT-1', // Região padrão, MinIO não exige uma região específica
        credentials: {
          accessKeyId: import.meta.env.VITE_MINIO_ACCESS_KEY || 'OVn3ueI6Rq4idnvCNxmT',
          secretAccessKey: import.meta.env.VITE_MINIO_SECRET_KEY || 'KMZ2qCtMVl5VinrEqz3F35ubwYpaJxYMfDPuvw0p'
        },
        forcePathStyle: import.meta.env.VITE_MINIO_FORCE_PATH_STYLE !== 'false' // Necessário para MinIO
      });
    }
    return this.client;
  }

  /**
   * Verifica se o bucket existe, se não existir, cria
   */
  private static async ensureBucketExists(): Promise<void> {
    const client = this.initClient();
    
    try {
      // Verificar se o bucket existe
      try {
        await client.send(new HeadBucketCommand({ Bucket: this.BUCKET_NAME }));
        console.log(`Bucket ${this.BUCKET_NAME} já existe`);
      } catch (error) {
        // Se o bucket não existir, criar
        console.log(`Bucket ${this.BUCKET_NAME} não existe, criando...`);
        await client.send(new CreateBucketCommand({ 
          Bucket: this.BUCKET_NAME,
          // CreateBucketConfiguration: { LocationConstraint: 'us-east-1' }
        }));
        console.log(`Bucket ${this.BUCKET_NAME} criado com sucesso`);
      }
    } catch (error) {
      console.error('Erro ao verificar/criar bucket no MinIO:', error);
      throw error;
    }
  }

  /**
   * Faz upload de um arquivo para o bucket MinIO
   * @param fileName Nome do arquivo
   * @param content Conteúdo do arquivo
   * @param contentType Tipo de conteúdo do arquivo
   * @returns URL do arquivo no MinIO
   */
  static async uploadFile(fileName: string, content: string, contentType: string = 'text/xml'): Promise<string> {
    try {
      console.log(`Iniciando upload do arquivo ${fileName} para o MinIO...`);
      
      // Verificar se o bucket existe, se não existir, criar
      await this.ensureBucketExists();

      const client = this.initClient();
      
      // Converter string para Uint8Array (compatível com navegador)
      const encoder = new TextEncoder();
      const buffer = encoder.encode(content);
      
      // Fazer upload do arquivo
      await client.send(new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: contentType
      }));
      
      // Construir a URL do arquivo
      const endpoint = import.meta.env.VITE_MINIO_ENDPOINT || 'http://localhost:9000';
      const url = `${endpoint}/${this.BUCKET_NAME}/${fileName}`;
      console.log(`Upload concluído com sucesso: ${url}`);
      
      return url;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo para o MinIO:', error);
      throw error;
    }
  }

  /**
   * Faz download de um arquivo do bucket MinIO
   * @param fileName Nome do arquivo
   * @returns Conteúdo do arquivo
   */
  static async downloadFile(fileName: string): Promise<string> {
    try {
      console.log(`Iniciando download do arquivo ${fileName} do MinIO...`);
      
      const client = this.initClient();
      
      // Fazer download do arquivo
      const response = await client.send(new GetObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: fileName
      }));
      
      // Converter o corpo da resposta para string
      if (!response.Body) {
        throw new Error('Corpo da resposta vazio');
      }
      
      // Usar o método adequado para navegadores
      const streamReader = response.Body;
      
      // Se for um ReadableStream (navegador)
      if ('getReader' in streamReader) {
        const reader = (streamReader as ReadableStream).getReader();
        const chunks: Uint8Array[] = [];
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        // Concatenar os chunks em um único Uint8Array
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        // Converter para string
        const decoder = new TextDecoder();
        const text = decoder.decode(result);
        console.log(`Download concluído com sucesso`);
        return text;
      } else {
        // Fallback para outros tipos de streams
        const chunks: Uint8Array[] = [];
        for await (const chunk of streamReader as AsyncIterable<Uint8Array>) {
          chunks.push(chunk);
        }
        
        // Concatenar os chunks em um único Uint8Array
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        // Converter para string
        const decoder = new TextDecoder();
        const text = decoder.decode(result);
        console.log(`Download concluído com sucesso`);
        return text;
      }
    } catch (error) {
      console.error('Erro ao fazer download do arquivo do MinIO:', error);
      throw error;
    }
  }

  /**
   * Lista todos os arquivos em um diretório do bucket
   * @param prefix Prefixo do diretório (opcional)
   * @returns Lista de objetos
   */
  static async listFiles(prefix: string = ''): Promise<string[]> {
    try {
      console.log(`Listando arquivos com prefixo ${prefix || 'raiz'} no MinIO...`);
      
      const client = this.initClient();
      
      // Listar objetos
      const response = await client.send(new ListObjectsCommand({
        Bucket: this.BUCKET_NAME,
        Prefix: prefix
      }));
      
      const files: string[] = [];
      
      // Processar os objetos retornados
      if (response.Contents) {
        for (const obj of response.Contents) {
          if (obj.Key) {
            files.push(obj.Key);
          }
        }
      }
      
      console.log(`Listagem concluída, encontrados ${files.length} arquivos`);
      return files;
    } catch (error) {
      console.error('Erro ao listar arquivos no MinIO:', error);
      throw error;
    }
  }

  /**
   * Faz deploy de um processo BPMN para o bucket MinIO
   * @param processId ID do processo
   * @param bpmnXml Definição BPMN em XML
   * @returns URL do arquivo no MinIO
   */
  static async deployProcess(processId: string, bpmnXml: string): Promise<string> {
    try {
      console.log(`Iniciando deploy do processo ${processId} para o MinIO...`);
      const fileName = `process-definitions/${processId}.bpmn`;
      const url = await this.uploadFile(fileName, bpmnXml, 'text/xml');
      console.log(`Processo deployado com sucesso para ${url}`);
      return url;
    } catch (error) {
      console.error('Erro ao fazer deploy do processo para o MinIO:', error);
      throw error;
    }
  }
}

export default MinioClientService;