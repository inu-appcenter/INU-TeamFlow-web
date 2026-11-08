import type { ApiClient } from "./createAxiosInstance";

let client: ApiClient | null = null;

export function setApiClient(instance: ApiClient): void {
  client = instance;
}

export function getApiClient(): ApiClient {
  if (!client) {
    throw new Error(
      "API client가 초기화되지 않았습니다. setApiClient()를 먼저 호출하세요."
    );
  }
  return client;
}
