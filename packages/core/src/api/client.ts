import type { AxiosInstance } from "axios";

let client: AxiosInstance | null = null;

export function setApiClient(instance: AxiosInstance): void {
  client = instance;
}

export function getApiClient(): AxiosInstance {
  if (!client) {
    throw new Error(
      "API client가 초기화되지 않았습니다. setApiClient()를 먼저 호출하세요."
    );
  }
  return client;
}
