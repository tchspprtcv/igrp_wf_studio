/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MINIO_ENDPOINT: string;
  readonly VITE_MINIO_REGION: string;
  readonly VITE_MINIO_ACCESS_KEY: string;
  readonly VITE_MINIO_SECRET_KEY: string;
  readonly VITE_MINIO_BUCKET_NAME: string;
  readonly VITE_MINIO_FORCE_PATH_STYLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}