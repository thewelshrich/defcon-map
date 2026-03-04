export type IngestionConfig = {
  ingestionWindowDays: number;
  publicFeedWindowDays: number;
  rawRetentionDays: number;
  refreshIntervalHours: number;
};

export type ProductionRuntimeConfig = {
  gcp: GcpRuntimeConfig;
  cloudflare: CloudflareRuntimeConfig;
};

export type GcpRuntimeConfig = {
  projectId: string;
  location: string;
};

export type CloudflareRuntimeConfig = {
  accountId: string;
  r2Bucket: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  kvNamespaceId: string;
  apiToken: string;
};

export const defaultIngestionConfig: IngestionConfig = {
  ingestionWindowDays: 3,
  publicFeedWindowDays: 3,
  rawRetentionDays: 30,
  refreshIntervalHours: 3
};

export function getIngestionConfig(): IngestionConfig {
  return defaultIngestionConfig;
}

function requireEnv(env: Partial<Record<string, string>>, key: string) {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getProductionRuntimeConfig(
  env: Partial<Record<string, string>> = process.env
): ProductionRuntimeConfig {
  return {
    gcp: getGcpRuntimeConfig(env),
    cloudflare: getCloudflareRuntimeConfig(env)
  };
}

export function getGcpRuntimeConfig(
  env: Partial<Record<string, string>> = process.env
): GcpRuntimeConfig {
  return {
    projectId: requireEnv(env, "GCP_PROJECT_ID"),
    location: requireEnv(env, "GCP_BIGQUERY_LOCATION")
  };
}

export function getCloudflareRuntimeConfig(
  env: Partial<Record<string, string>> = process.env
): CloudflareRuntimeConfig {
  return {
    accountId: requireEnv(env, "CLOUDFLARE_ACCOUNT_ID"),
    r2Bucket: requireEnv(env, "CLOUDFLARE_R2_BUCKET"),
    r2AccessKeyId: requireEnv(env, "CLOUDFLARE_R2_ACCESS_KEY_ID"),
    r2SecretAccessKey: requireEnv(env, "CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    kvNamespaceId: requireEnv(env, "CLOUDFLARE_KV_NAMESPACE_ID"),
    apiToken: requireEnv(env, "CLOUDFLARE_API_TOKEN")
  };
}
