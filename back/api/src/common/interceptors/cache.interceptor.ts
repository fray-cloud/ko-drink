import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

export const CacheKey = (key: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('cache:key', key, descriptor.value);
  };
};

export const CacheTTL = (ttl: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('cache:ttl', ttl, descriptor.value);
  };
};

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    const cacheKey = this.reflector.get<string>('cache:key', handler);
    const cacheTTL = this.reflector.get<number>('cache:ttl', handler);

    if (!cacheKey) {
      return next.handle();
    }

    const key = this.generateCacheKey(cacheKey, request, controller.name, handler.name);

    const cached = await this.redisService.get(key);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (data) => {
        const ttl = cacheTTL || this.getDefaultTTL(controller.name);
        await this.redisService.set(key, data, ttl);
      }),
    );
  }

  private generateCacheKey(
    baseKey: string,
    request: any,
    controllerName: string,
    handlerName: string,
  ): string {
    const params = { ...request.params, ...request.query };
    const paramString = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join('|');
    return `cache:${controllerName}:${handlerName}:${baseKey}${paramString ? `:${paramString}` : ''}`;
  }

  private getDefaultTTL(controllerName: string): number {
    const redisConfig = this.configService.get('redis');
    if (controllerName.toLowerCase().includes('koreansool')) {
      return redisConfig.ttl.koreansool;
    }
    if (controllerName.toLowerCase().includes('user')) {
      return redisConfig.ttl.user;
    }
    return 3600;
  }
}
