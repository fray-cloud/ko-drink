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
      timeout: 30000, // timeout을 30초로 증가 (원문 텍스트 가져오기 시간 고려)
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
      // book만 제공할 때는 GET 요청 사용
      // liq만 제공하거나 book과 liq 모두 제공할 때는 POST 요청 사용 (method=simple)
      if (book && !liq) {
        // GET 요청으로 변경
        const params = new URLSearchParams();
        params.append('book', book);
        
        const response = await this.client.get(`/recipe.php?${params.toString()}`);
        return response.data;
      } else {
        // liq만 제공하거나 book과 liq 모두 제공할 때는 POST 요청 (method=simple)
        const formData = new URLSearchParams();
        formData.append('method', 'simple');
        
        // book이 없으면 @, 있으면 실제 값
        formData.append('book', book || '@');
        
        // liq가 없으면 @, 있으면 실제 값
        formData.append('liq', liq || '@');
        
        // dup가 없으면 @, 있으면 실제 값
        if (book && liq) {
          formData.append('dup', dup ? dup.toString() : '@');
        } else {
          formData.append('dup', '@');
        }
        
        const response = await this.client.post('/recipe.php', formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        return response.data;
      }
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

  async getOriginalText(book: string, liq: string, dup?: number, html?: string): Promise<string> {
    try {
      // 원문 텍스트는 JavaScript ToggleText 함수로 토글되는 요소에 포함되어 있음
      // ToggleText(this, idx_rcp)에서 idx_rcp는 레시피 번호 (보통 1)
      // id_text_org_1, id_text_trs_1 같은 ID를 가진 요소를 찾아야 함
      // HTML이 제공되지 않으면 getRecipe를 호출
      const recipeHtml = html || await this.getRecipe(book, liq, dup);
      const $ = cheerio.load(recipeHtml);
      
      // 1. id_text_org_1 ID를 가진 요소 찾기 (원문 텍스트)
      // ToggleText 함수가 이 요소를 display: table-row로 토글함
      let originalText = $('#id_text_org_1').text().trim();
      
      if (originalText && originalText.length > 5) {
        return originalText;
      }
      
      // 2. 다른 번호의 원문 텍스트 찾기 (idx_rcp가 1이 아닐 수 있음)
      for (let i = 1; i <= 10; i++) {
        const text = $(`#id_text_org_${i}`).text().trim();
        if (text && text.length > 5) {
          originalText = text;
          break;
        }
      }
      
      if (originalText && originalText.length > 5) {
        return originalText;
      }
      
      // 3. display:none으로 숨겨진 원문 텍스트 찾기
      $('tr, div, span').each((_, el) => {
        const $el = $(el);
        const id = $el.attr('id') || '';
        const style = $el.attr('style') || '';
        
        // id_text_org_ 또는 id_text_trs_ 패턴이고 숨겨진 요소
        if ((id.includes('id_text_org_') || id.includes('id_text_trs_')) && 
            (style.includes('display:none') || style.includes('display: none'))) {
          const text = $el.text().trim();
          if (text && text.length > 5) {
            originalText = text;
            return false; // break
          }
        }
      });
      
      // 4. 원문 텍스트가 HTML에 없을 수 있음 (JavaScript로 동적 로드)
      // 이 경우 빈 문자열 반환 (실제로는 브라우저에서만 접근 가능)
      return originalText || '';
    } catch (error) {
      if (error instanceof AxiosError) {
        // 원문 텍스트를 가져올 수 없는 경우 에러를 던지지 않고 빈 문자열 반환
        // (이것은 정상적인 경우일 수 있음)
        return '';
      }
      return '';
    }
  }
}
