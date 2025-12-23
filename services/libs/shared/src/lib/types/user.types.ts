export type Provider = 'naver' | 'google' | 'kakao' | 'local';

export interface User {
  id: string;
  email: string;
  name: string;
  provider: Provider;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

