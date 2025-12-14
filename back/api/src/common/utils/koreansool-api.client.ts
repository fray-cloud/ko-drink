import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class KoreansoolApiClient {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const koreansoolConfig = this.configService.get('koreansool');
    this.baseUrl = koreansoolConfig.baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });
  }

  async getSearchResults(searchText: string): Promise<string> {
    try {
      const response = await this.client.get('/print_table.php', {
        params: {
          table: 'SEARCH',
          _search_txt: searchText,
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch search results: ${error.message}`);
      }
      throw error;
    }
  }

  async getBooks(): Promise<string> {
    try {
      const response = await this.client.get('/print_table.php', {
        params: {
          table: 'book',
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch books: ${error.message}`);
      }
      throw error;
    }
  }

  async getRecipe(book?: string, liq?: string, dup?: number): Promise<string> {
    try {
      const params: any = {};
      // book과 liq가 있으면 파라미터에 추가
      if (book) {
        params.book = book;
      }
      if (liq) {
        params.liq = liq;
      }
      // dup가 없으면 기본값 1 사용
      params.dup = dup ?? 1;
      const response = await this.client.get('/recipe.php', { params });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch recipe: ${error.message}`);
      }
      throw error;
    }
  }

  async getReferences(): Promise<string> {
    try {
      const response = await this.client.get('/print_table.php', {
        params: {
          table: 'ref',
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch references: ${error.message}`);
      }
      throw error;
    }
  }

  async getImage(book: string, liq: string, dup?: number): Promise<Buffer> {
    try {
      const params: any = { book, liq };
      // dup가 없으면 기본값 1 사용
      params.dup = dup ?? 1;
      const response = await this.client.get('/print_org_img.php', {
        params,
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch image: ${error.message}`);
      }
      throw error;
    }
  }

  async getSimilarRecipes(
    book: string,
    liq: string,
    dup: number,
  ): Promise<string> {
    try {
      const response = await this.client.get('/anal1.php', {
        params: { book, liq, dup },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to fetch similar recipes: ${error.message}`);
      }
      throw error;
    }
  }
}
