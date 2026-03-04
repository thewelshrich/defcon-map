import { describe, expect, it } from "vitest";

import {
  defaultIngestionConfig,
  getCloudflareRuntimeConfig,
  getGcpRuntimeConfig,
  getProductionRuntimeConfig
} from "./config";

describe("getProductionRuntimeConfig", () => {
  it("reads the required cloud runtime configuration from environment variables", () => {
    const config = getProductionRuntimeConfig({
      GCP_PROJECT_ID: "defcon-prod",
      GCP_BIGQUERY_LOCATION: "US",
      CLOUDFLARE_ACCOUNT_ID: "account-123",
      CLOUDFLARE_R2_BUCKET: "defcon-snapshots",
      CLOUDFLARE_R2_ACCESS_KEY_ID: "access-key",
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: "secret-key",
      CLOUDFLARE_KV_NAMESPACE_ID: "namespace-123",
      CLOUDFLARE_API_TOKEN: "token-123"
    });

    expect(config).toMatchObject({
      gcp: {
        projectId: "defcon-prod",
        location: "US"
      },
      cloudflare: {
        accountId: "account-123",
        r2Bucket: "defcon-snapshots",
        kvNamespaceId: "namespace-123"
      }
    });
  });

  it("throws when a required cloud variable is missing", () => {
    expect(() =>
      getProductionRuntimeConfig({
        GCP_PROJECT_ID: "defcon-prod"
      })
    ).toThrow("Missing required environment variable");
  });
});

describe("defaultIngestionConfig", () => {
  it("uses a 3-day extraction and publish window", () => {
    expect(defaultIngestionConfig).toMatchObject({
      ingestionWindowDays: 3,
      publicFeedWindowDays: 3
    });
  });
});

describe("getGcpRuntimeConfig", () => {
  it("reads only the required GCP runtime configuration", () => {
    expect(
      getGcpRuntimeConfig({
        GCP_PROJECT_ID: "defcon-prod",
        GCP_BIGQUERY_LOCATION: "US"
      })
    ).toEqual({
      projectId: "defcon-prod",
      location: "US"
    });
  });
});

describe("getCloudflareRuntimeConfig", () => {
  it("reads only the required Cloudflare runtime configuration", () => {
    expect(
      getCloudflareRuntimeConfig({
        CLOUDFLARE_ACCOUNT_ID: "account-123",
        CLOUDFLARE_R2_BUCKET: "bucket-123",
        CLOUDFLARE_R2_ACCESS_KEY_ID: "key-123",
        CLOUDFLARE_R2_SECRET_ACCESS_KEY: "secret-123",
        CLOUDFLARE_KV_NAMESPACE_ID: "namespace-123",
        CLOUDFLARE_API_TOKEN: "token-123"
      })
    ).toMatchObject({
      accountId: "account-123",
      r2Bucket: "bucket-123",
      kvNamespaceId: "namespace-123"
    });
  });
});
