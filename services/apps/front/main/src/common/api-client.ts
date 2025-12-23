import { createApiClient } from '@ko-drink/api-client';

// nginx gateway를 통해 상대 경로로 API 호출
const API_BASE_URL = '/api';

export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
});

