import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface SearchResult {
  book: string;
  liquor: string;
  recipe: RecipeStep[];
  // 메타 정보
  liquorHanja?: string; // 술 이름 한자 (예: 甘香酒)
  description?: string; // 설명 (예: "달고 향기로운 술")
  tags?: string[]; // 분류 태그 (예: ["발효주", "순곡주", "단양주", "느림", "유사"])
  alias?: string; // 별칭 (예: "이화주")
  similarBook?: string; // 유사 문헌 (예: "잡초")
  originalText?: string; // 원문 텍스트
  // 내부 사용을 위한 임시 필드 (파싱 후 제거)
  _originalLinkInfo?: { href?: string; dup?: number } | null;
}

export interface RecipeInfo {
  book: string;
  liquor: string;
  dup: number;
  recipe: RecipeStep[];
  // 메타 정보
  liquorHanja?: string; // 술 이름 한자 (예: 甘香酒)
  description?: string; // 설명 (예: "달고 향기로운 술")
  tags?: string[]; // 분류 태그 (예: ["발효주", "순곡주", "단양주", "느림", "유사"])
  alias?: string; // 별칭 (예: "이화주")
  similarBook?: string; // 유사 문헌 (예: "잡초")
  originalText?: string; // 원문 텍스트
}

export interface RecipeMaterial {
  materialName: string;
  value: string;
}

export interface RecipeStep {
  step?: string;
  day: number;
  materials?: RecipeMaterial[];
  memo?: string;
}

export interface Book {
  name: string;
  nameHanja?: string;
  author?: string;
  year?: number;
  description?: string;
  originalLink?: string;
  referenceLink?: string;
  recipeLink?: string;
}

export interface Reference {
  id?: string;
  title?: string;
  content?: string;
  category?: string;
  link?: string;
}

@Injectable()
export class KoreansoolHtmlParser {
  parseSearchResults(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // .table_rcp 또는 .table_each_rcp 클래스를 가진 테이블 찾기
    $('.table_rcp, .table_each_rcp').each((_, element) => {
      const $table = $(element);
      
      // 제목 추출 - 여러 방법 시도
      let titleText = '';
      let $titleRow = $table.find('.tr_rcp_title').first();
      if ($titleRow.length > 0) {
        // 링크에서 추출 시도
        const $links = $titleRow.find('a');
        if ($links.length >= 2) {
          const book = $links.eq(0).text().trim();
          const liquor = $links.eq(1).text().trim();
          if (book && liquor) {
            titleText = `${book} - ${liquor}`;
          }
        } else {
          // 텍스트에서 추출
          titleText = $titleRow.find('td').text().trim();
        }
      } else {
        // 대체 방법: 테이블의 첫 번째 행에서 제목 찾기
        $titleRow = $table.find('tr').first();
        titleText = $titleRow.find('td').first().text().trim();
      }

      // 메타 정보 파싱
      const metaInfo = this.parseSearchMetaInfo($titleRow, titleText);
      const [book, liquor] = this.parseTitle(titleText);

      // book과 liquor가 없으면 건너뛰기
      if (!book || !liquor) {
        return;
      }

      const recipe: RecipeStep[] = [];
      // 헤더 행에서 필드명 추출
      const fieldNames: string[] = [];
      const $headerRow = $table.find('.tr_rcp_field').first();
      if ($headerRow.length > 0) {
        $headerRow.find('td').each((_, cell) => {
          const fieldName = $(cell).text().trim();
          if (fieldName) {
            fieldNames.push(fieldName);
          }
        });
      }

      $table.find('.tr_rcp_grid').each((_, row) => {
        const $row = $(row);
        const cells = $row
          .find('td')
          .map((_, cell) => $(cell).text().trim())
          .get();

        if (cells.length > 0) {
          recipe.push(this.parseRecipeRow(cells, fieldNames));
        }
      });

      // 원문 링크 정보 추출 (나중에 원문 텍스트를 가져올 때 사용)
      let originalLinkInfo: { href?: string; dup?: number } | null = null;
      const $originalLink = $titleRow.find('a').filter((_, el) => {
        const text = $(el).text().trim();
        return text === '원본' || text === '원문' || text.includes('원문');
      }).first();
      
      if ($originalLink.length > 0) {
        const href = $originalLink.attr('href');
        if (href) {
          try {
            // href에서 dup 파라미터 추출
            const url = new URL(href, 'http://koreansool.kr');
            const dup = url.searchParams.get('dup');
            originalLinkInfo = {
              href: href.startsWith('http') ? href : `http://koreansool.kr${href.startsWith('/') ? '' : '/'}${href}`,
              dup: dup ? parseInt(dup, 10) : undefined,
            };
          } catch (e) {
            // URL 파싱 실패 시 href만 저장
            originalLinkInfo = {
              href: href.startsWith('http') ? href : `http://koreansool.kr${href.startsWith('/') ? '' : '/'}${href}`,
            };
          }
        }
      }

      results.push({ 
        book, 
        liquor, 
        recipe,
        ...metaInfo,
        _originalLinkInfo: originalLinkInfo, // 내부 사용을 위한 임시 필드
      });
    });

    return results;
  }

  parseBooks(html: string): Book[] {
    const $ = cheerio.load(html);
    const books: Book[] = [];

    // 테이블의 각 행을 파싱 (첫 번째 tr은 헤더일 수 있으므로 제외)
    $('table tr').each((_, row) => {
      const $row = $(row);
      const $cells = $row.find('td');

      // 각 행은 2개의 td를 가짐: 첫 번째는 이미지, 두 번째는 정보
      if ($cells.length >= 2) {
        const $firstCell = $cells.eq(0);
        const $secondCell = $cells.eq(1);

        // 두 번째 셀에서 정보 추출
        const secondCellText = $secondCell.text().trim();
        if (!secondCellText) {
          return; // 빈 행은 건너뛰기
        }

        const book: Partial<Book> = {};

        // 문헌명 추출 (첫 번째 링크의 텍스트)
        const nameLink = $secondCell.find('a').first();
        if (nameLink.length > 0) {
          book.name = nameLink.text().trim();
        }

        // 한문명 추출 (문헌명 링크 다음의 괄호 안 텍스트)
        // 첫 번째 줄에서 괄호 안의 텍스트 찾기
        const firstLine = $secondCell.html() || '';
        const hanjaMatch = firstLine.match(/<a[^>]*>([^<]+)<\/a>\(([^)]+)\)/);
        if (hanjaMatch && hanjaMatch[2]) {
          book.nameHanja = hanjaMatch[2];
        }

        // 저자와 연도 추출 (예: "최치원(崔致遠) 886년")
        // 첫 번째 br 태그 이후의 텍스트에서 추출
        const firstBr = $secondCell.find('br').first();
        if (firstBr.length > 0) {
          const afterBrText = firstBr.nextAll().text().trim();
          const authorYearMatch = afterBrText.match(
            /^([^(]+(?:\([^)]+\))?)\s+(\d{4})년/,
          );
          if (authorYearMatch) {
            book.author = authorYearMatch[1].trim();
            book.year = parseInt(authorYearMatch[2], 10);
          } else {
            // 연도만 있는 경우
            const yearMatch = afterBrText.match(/(\d{4})년/);
            if (yearMatch) {
              book.year = parseInt(yearMatch[1], 10);
            }
          }
        }

        // 원본 링크 추출
        const originalLink = $secondCell.find('a[target*="원본"]').attr('href');
        if (originalLink) {
          book.originalLink = originalLink;
        }

        // 참조 링크 추출
        const referenceLink = $secondCell
          .find('a[target*="참조"]')
          .attr('href');
        if (referenceLink) {
          book.referenceLink = referenceLink;
        }

        // 레시피 링크 추출 (문헌명 링크)
        const recipeLink = nameLink.attr('href');
        if (recipeLink) {
          book.recipeLink = recipeLink;
        }

        // 설명 추출 (두 번째 br 태그 이후의 텍스트)
        const brs = $secondCell.find('br');
        if (brs.length >= 2) {
          const secondBr = brs.eq(1);
          const descriptionText = secondBr.nextAll().text().trim();
          if (descriptionText) {
            book.description = descriptionText;
          }
        }

        // name이 있을 때만 추가
        if (book.name && book.name.trim()) {
          books.push(book as Book);
        }
      }
    });

    return books;
  }

  parseRecipe(html: string): RecipeStep[] {
    const $ = cheerio.load(html);
    const recipe: RecipeStep[] = [];

    // 첫 번째 레시피 테이블만 파싱 (.table_each_rcp)
    const $firstRecipeTable = $('.table_each_rcp').first();

    // 파싱할 컨테이너 결정
    const $container =
      $firstRecipeTable.length > 0 ? $firstRecipeTable : $('body');

    // 헤더 행에서 필드명 추출
    const fieldNames: string[] = [];
    const $headerRow = $container.find('.tr_rcp_field').first();
    if ($headerRow.length > 0) {
      $headerRow.find('td').each((_, cell) => {
        const fieldName = $(cell).text().trim();
        if (fieldName) {
          fieldNames.push(fieldName);
        }
      });
    }

    // 데이터 행 파싱
    $container.find('.tr_rcp_grid').each((_, row) => {
      const $row = $(row);
      const cells = $row
        .find('td')
        .map((_, cell) => $(cell).text().trim())
        .get();

      if (cells.length > 0) {
        const recipeStep = this.parseRecipeRow(cells, fieldNames);
        // 빈 레시피 스텝은 제외 (step이 없거나 materials가 비어있는 경우)
        if (recipeStep.step || (recipeStep.materials && recipeStep.materials.length > 0)) {
          recipe.push(recipeStep);
        }
      }
    });

    return recipe;
  }

  parseRecipeMetadata(html: string): { book: string; liquor: string } | null {
    const $ = cheerio.load(html);
    const $titleRow = $('.tr_rcp_title').first();

    if ($titleRow.length === 0) {
      return null;
    }

    // .tr_rcp_title 내의 모든 링크 찾기
    const $links = $titleRow.find('a');

    if ($links.length < 2) {
      return null;
    }

    // 첫 번째 링크: 문헌명
    const book = $links.eq(0).text().trim();

    // 두 번째 링크: 술 이름
    const liquor = $links.eq(1).text().trim();

    if (!book || !liquor) {
      return null;
    }

    return { book, liquor };
  }

  // 레시피 메타 정보 파싱 (검색 결과와 동일한 형식)
  parseRecipeMetaInfo(html: string): Partial<RecipeInfo> {
    const $ = cheerio.load(html);
    const meta: Partial<RecipeInfo> = {};

    // 제목 행 찾기
    const $titleRow = $('.tr_rcp_title').first();
    if ($titleRow.length === 0) {
      return meta;
    }

    const titleText = $titleRow.text() || '';
    const fullText = titleText;

    // 한자명 추출: (甘香酒) 형식
    const hanjaMatch = fullText.match(/\(([^)]+)\)/);
    if (hanjaMatch && hanjaMatch[1]) {
      meta.liquorHanja = hanjaMatch[1].trim();
    }

    // 태그 추출: [발효주,순곡주,단양주,느림,유사] 형식
    // HTML에서 태그 부분 추출 (링크가 포함된 경우 처리)
    const $titleRowHtml = $titleRow.html() || '';
    const tagsMatch = $titleRowHtml.match(/\[([^\]]+)\]/);
    if (tagsMatch && tagsMatch[1]) {
      // HTML 태그 제거 후 태그 추출
      const tagsHtml = tagsMatch[1];
      const $tags = cheerio.load(tagsHtml);
      const tagsText = $tags('body').text() || tagsHtml;
      
      meta.tags = tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => {
          const trimmed = tag.trim();
          // 원본, 유사, 참조 링크 제거
          return trimmed && 
                 trimmed !== '원본' && 
                 trimmed !== '유사' && 
                 trimmed !== '참조' &&
                 !trimmed.includes('원본') &&
                 !trimmed.includes('유사') &&
                 !trimmed.includes('참조');
        });
    }

    // 설명 추출: 태그 앞의 텍스트 (예: "달고 향기로운 술")
    // 오류신고 링크와 원문열기 버튼 제거 후 텍스트 추출
    const $titleRowCleanForDesc = $titleRow.clone();
    $titleRowCleanForDesc.find('.org_text_and_error, .toggle_org_button, a[href*="오류신고"], a[href*="er/write"]').remove();
    const cleanTextForDesc = $titleRowCleanForDesc.text() || fullText;
    
    const cleanTagsMatchForDesc = cleanTextForDesc.match(/\[([^\]]+)\]/);
    if (cleanTagsMatchForDesc) {
      const beforeTags = cleanTextForDesc.substring(0, cleanTagsMatchForDesc.index || 0);
      const cleaned = beforeTags
        .replace(/\([^)]+\)/g, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/⚠️/g, '') // 이모지 제거
        .replace(/오류신고/g, '') // 오류신고 텍스트 제거
        .trim();
      const parts = cleaned.split(/\s+/).filter(part => part.trim().length > 0);
      if (parts.length > 2) {
        const description = parts.slice(2).join(' ').trim();
        // 오류신고 관련 텍스트가 남아있으면 제거
        if (description && !description.includes('오류신고') && !description.includes('⚠️')) {
          meta.description = description;
        }
      }
    }

    // 별칭 추출: 태그 뒤의 텍스트 중 마지막 부분 (예: "이화주.")
    // HTML에서 원문열기 버튼과 오류신고 링크 제거 후 추출
    const $titleRowWithoutButtons = $titleRow.clone();
    $titleRowWithoutButtons.find('.org_text_and_error, .toggle_org_button, a[href*="오류신고"], a[href*="er/write"]').remove();
    const cleanText = $titleRowWithoutButtons.text() || fullText;
    
    const cleanTagsMatch = cleanText.match(/\[([^\]]+)\]/);
    if (cleanTagsMatch) {
      const afterTags = cleanText.substring((cleanTagsMatch.index || 0) + cleanTagsMatch[0].length);
      // "유사:《잡초》" 부분을 제외한 나머지에서 별칭 추출
      // 오류신고, 원문열기 등 제거
      const aliasMatch = afterTags.match(/^([^유사《⚠️]+?)(?:\.|유사|$)/);
      if (aliasMatch && aliasMatch[1]) {
        const alias = aliasMatch[1].trim();
        // 오류신고, 원문열기 등 제거
        if (alias && 
            !alias.includes('오류신고') && 
            !alias.includes('원문열기') &&
            !alias.includes('원문닫기') &&
            alias.length > 0) {
          meta.alias = alias;
        }
      }
    }

    // 유사 문헌 추출: 유사:《잡초》 형식
    const similarMatch = fullText.match(/유사[：:]\s*《([^》]+)》/);
    if (similarMatch && similarMatch[1]) {
      meta.similarBook = similarMatch[1].trim();
    }

    return meta;
  }

  parseAllRecipes(html: string): RecipeInfo[] {
    const $ = cheerio.load(html);
    const recipes: RecipeInfo[] = [];

    // 모든 레시피 테이블 파싱 (.table_each_rcp 또는 .table_rcp)
    $('.table_each_rcp, .table_rcp').each((_, element) => {
      const $recipeTable = $(element);

      // 각 레시피의 메타데이터 추출
      let book = '';
      let liquor = '';
      let $links: ReturnType<typeof $> | null = null;
      
      const $titleRow = $recipeTable.find('.tr_rcp_title').first();
      if ($titleRow.length > 0) {
        // 링크에서 추출 시도
        $links = $titleRow.find('a');
        if ($links.length >= 2) {
          book = $links.eq(0).text().trim();
          liquor = $links.eq(1).text().trim();
        } else if ($links.length === 1) {
          // 링크가 하나만 있는 경우 (liq만 제공했을 때)
          liquor = $links.eq(0).text().trim();
          // 텍스트에서 book 추출 시도
          const titleText = $titleRow.find('td').text().trim();
          const [parsedBook, parsedLiquor] = this.parseTitle(titleText);
          if (parsedBook) book = parsedBook;
          if (parsedLiquor) liquor = parsedLiquor || liquor;
        } else {
          // 텍스트에서 추출
          const titleText = $titleRow.find('td').text().trim();
          [book, liquor] = this.parseTitle(titleText);
        }
      } else {
        // 대체 방법: 테이블의 첫 번째 행에서 제목 찾기
        const titleText = $recipeTable.find('tr').first().find('td').first().text().trim();
        [book, liquor] = this.parseTitle(titleText);
      }

      if (!book || !liquor) {
        return;
      }

      // dup 추출 (링크의 href나 target에서 추출)
      let dup = 1;
      if ($links && $links.length >= 2) {
        const $liquorLink = $links.eq(1);
        const href = $liquorLink.attr('href') || '';
        const dupMatch = href.match(/dup=(\d+)/);
        if (dupMatch) {
          dup = parseInt(dupMatch[1], 10);
        } else {
          // target 속성에서 추출 시도 (예: '보덕공비망록백하주1')
          const target = $liquorLink.attr('target') || '';
          const targetDupMatch = target.match(/(\d+)$/);
          if (targetDupMatch) {
            dup = parseInt(targetDupMatch[1], 10);
          }
        }
      }

      // 레시피 스텝 파싱
      const recipeSteps: RecipeStep[] = [];

      // 헤더 행에서 필드명 추출
      const fieldNames: string[] = [];
      const $headerRow = $recipeTable.find('.tr_rcp_field').first();
      if ($headerRow.length > 0) {
        $headerRow.find('td').each((_, cell) => {
          const fieldName = $(cell).text().trim();
          if (fieldName) {
            fieldNames.push(fieldName);
          }
        });
      }

      // 데이터 행 파싱
      $recipeTable.find('.tr_rcp_grid').each((_, row) => {
        const $row = $(row);
        const cells = $row
          .find('td')
          .map((_, cell) => $(cell).text().trim())
          .get();

        if (cells.length > 0) {
          const recipeStep = this.parseRecipeRow(cells, fieldNames);
          // 빈 레시피 스텝은 제외 (step이 없거나 materials가 비어있는 경우)
          if (recipeStep.step || recipeStep.materials.length > 0) {
            recipeSteps.push(recipeStep);
          }
        }
      });

      if (recipeSteps.length > 0 || book || liquor) {
        // 메타 정보 파싱
        const metaInfo = this.parseSearchMetaInfo($titleRow, $titleRow.text());

        // 원문 텍스트 추출 (각 레시피 테이블의 HTML에서 직접 추출)
        // 각 레시피 테이블마다 id_text_org_1이 있을 수 있으므로,
        // 레시피 테이블 내부나 다음 형제 요소에서 원문 텍스트 찾기
        let originalText: string | undefined;
        
        // 방법 1: 레시피 테이블 내부에서 id_text_org_1 찾기
        const $orgTextInTable = $recipeTable.find('#id_text_org_1');
        if ($orgTextInTable.length > 0) {
          originalText = $orgTextInTable.text().trim();
        }
        
        // 방법 2: 레시피 테이블 다음 형제 요소에서 찾기
        if (!originalText || originalText.length <= 5) {
          const $nextSibling = $recipeTable.next();
          if ($nextSibling.length > 0) {
            const $orgTextNext = $nextSibling.find('#id_text_org_1, [id^="id_text_org_"]').first();
            if ($orgTextNext.length > 0) {
              originalText = $orgTextNext.text().trim();
            }
          }
        }
        
        // 방법 3: 레시피 테이블의 부모 요소에서 찾기
        if (!originalText || originalText.length <= 5) {
          const $parent = $recipeTable.parent();
          const $orgTextParent = $parent.find('#id_text_org_1, [id^="id_text_org_"]').first();
          if ($orgTextParent.length > 0) {
            originalText = $orgTextParent.text().trim();
          }
        }
        
        // 방법 4: 전체 HTML에서 해당 레시피와 관련된 원문 텍스트 찾기
        // (레시피 테이블 이후에 나오는 첫 번째 id_text_org_ 요소)
        if (!originalText || originalText.length <= 5) {
          const recipeTableHtml = $recipeTable.html() || '';
          const recipeTableIndex = html.indexOf(recipeTableHtml);
          if (recipeTableIndex >= 0) {
            const afterTableHtml = html.substring(recipeTableIndex);
            const $afterTable = cheerio.load(afterTableHtml);
            const $orgTextAfter = $afterTable('#id_text_org_1, [id^="id_text_org_"]').first();
            if ($orgTextAfter.length > 0) {
              originalText = $orgTextAfter.text().trim();
            }
          }
        }
        
        if (originalText && originalText.length > 5) {
          // 원문 텍스트가 있으면 사용
        } else {
          originalText = undefined;
        }

        recipes.push({
          book,
          liquor,
          dup,
          recipe: recipeSteps,
          ...metaInfo,
          originalText,
        });
      }
    });

    return recipes;
  }

  private parseSearchMetaInfo(
    $titleRow: cheerio.Cheerio<any>,
    titleText: string,
  ): Partial<SearchResult> {
    const meta: Partial<SearchResult> = {};

    // 오류신고 링크와 원문열기 버튼 제거 후 텍스트 추출
    const $titleRowClean = $titleRow.clone();
    $titleRowClean.find('.org_text_and_error, .toggle_org_button, a[href*="오류신고"], a[href*="er/write"]').remove();
    const fullText = $titleRowClean.text() || titleText;

    // 한자명 추출: (甘香酒) 형식
    const hanjaMatch = fullText.match(/\(([^)]+)\)/);
    if (hanjaMatch && hanjaMatch[1]) {
      meta.liquorHanja = hanjaMatch[1].trim();
    }

    // 태그 추출: [발효주,순곡주,단양주,느림,유사] 형식
    // HTML에서 태그 부분 추출 (링크가 포함된 경우 처리)
    const $titleRowHtml = $titleRow.html() || '';
    const tagsMatch = $titleRowHtml.match(/\[([^\]]+)\]/);
    if (tagsMatch && tagsMatch[1]) {
      // HTML 태그 제거 후 태그 추출
      const tagsHtml = tagsMatch[1];
      const $tags = cheerio.load(tagsHtml);
      const tagsText = $tags('body').text() || tagsHtml;
      
      meta.tags = tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => {
          const trimmed = tag.trim();
          // 원본, 유사, 참조 링크 제거
          return trimmed && 
                 trimmed !== '원본' && 
                 trimmed !== '유사' && 
                 trimmed !== '참조' &&
                 !trimmed.includes('원본') &&
                 !trimmed.includes('유사') &&
                 !trimmed.includes('참조');
        });
    }

    // 설명 추출: 태그 앞의 텍스트 (예: "달고 향기로운 술")
    // 오류신고가 제거된 텍스트에서 태그 위치 찾기
    const cleanTagsMatchForDesc = fullText.match(/\[([^\]]+)\]/);
    if (cleanTagsMatchForDesc) {
      const beforeTags = fullText.substring(0, cleanTagsMatchForDesc.index || 0);
      // 한자명과 괄호를 제거한 후 설명 추출
      const cleaned = beforeTags
        .replace(/\([^)]+\)/g, '')
        .replace(/^\d+\.\s*/, '') // "1. " 제거
        .replace(/⚠️/g, '') // 이모지 제거
        .replace(/오류신고/g, '') // 오류신고 텍스트 제거
        .trim();
      // 책이름과 술이름을 제외한 나머지가 설명
      const parts = cleaned.split(/\s+/).filter(part => part.trim().length > 0);
      if (parts.length > 2) {
        // 첫 두 개는 책이름과 술이름이므로 나머지가 설명
        const description = parts.slice(2).join(' ').trim();
        // 오류신고 관련 텍스트가 남아있으면 제거
        if (description && !description.includes('오류신고') && !description.includes('⚠️')) {
          meta.description = description;
        }
      }
    }

    // 별칭 추출: 태그 뒤의 텍스트 중 마지막 부분 (예: "이화주.")
    // HTML에서 원문열기 버튼과 오류신고 링크 제거 후 추출
    const $titleRowWithoutButtons = $titleRow.clone();
    $titleRowWithoutButtons.find('.org_text_and_error, .toggle_org_button, a[href*="오류신고"], a[href*="er/write"]').remove();
    const cleanText = $titleRowWithoutButtons.text() || fullText;
    
    const cleanTagsMatch = cleanText.match(/\[([^\]]+)\]/);
    if (cleanTagsMatch) {
      const afterTags = cleanText.substring((cleanTagsMatch.index || 0) + cleanTagsMatch[0].length);
      // "유사:《잡초》" 부분을 제외한 나머지에서 별칭 추출
      // 오류신고, 원문열기 등 제거
      const aliasMatch = afterTags.match(/^([^유사《⚠️]+?)(?:\.|유사|$)/);
      if (aliasMatch && aliasMatch[1]) {
        const alias = aliasMatch[1].trim();
        // 오류신고, 원문열기 등 제거
        if (alias && 
            !alias.includes('오류신고') && 
            !alias.includes('원문열기') &&
            !alias.includes('원문닫기') &&
            alias.length > 0) {
          meta.alias = alias;
        }
      }
    }

    // 유사 문헌 추출: 유사:《잡초》 형식
    const similarMatch = fullText.match(/유사[：:]\s*《([^》]+)》/);
    if (similarMatch && similarMatch[1]) {
      meta.similarBook = similarMatch[1].trim();
    }

    return meta;
  }

  private parseTitle(title: string): [string, string] {
    if (!title) {
      return ['', ''];
    }
    
    // ' - '로 분리 시도
    const parts = title.split(' - ');
    if (parts.length === 2) {
      return [parts[0].trim(), parts[1].trim()];
    }
    
    // ' -' 또는 '- '로 분리 시도
    const parts2 = title.split(/[\s-]+/);
    if (parts2.length >= 2) {
      // 첫 번째와 나머지를 합쳐서 반환
      const first = parts2[0].trim();
      const rest = parts2.slice(1).join(' ').trim();
      if (first && rest) {
        return [first, rest];
      }
    }
    
    // 분리할 수 없으면 첫 번째를 book으로, 나머지를 liquor로
    const trimmed = title.trim();
    if (trimmed) {
      // 공백이나 특수문자로 분리 시도
      const match = trimmed.match(/^(.+?)\s+(.+)$/);
      if (match) {
        return [match[1].trim(), match[2].trim()];
      }
      // 분리할 수 없으면 전체를 liquor로
      return ['', trimmed];
    }
    
    return ['', ''];
  }

  private parseRecipeRow(cells: string[], fieldNames: string[]): RecipeStep {
    const materials: RecipeMaterial[] = [];

    // 필드명이 없으면 기본 필드명 사용 (하위 호환성)
    const defaultFieldNames = [
      '단계',
      '일',
      '발효',
      '멥쌀',
      '찹쌀',
      '침미',
      '물',
      '장수',
      '탕혼',
      '냉혼',
      '가공',
      '살수',
      '침숙',
      '누룩',
      '누룩형태',
      '침국',
      '녹국',
      '밀분',
      '석임',
      '여과',
      '가주',
      '온혼',
      '보쌈',
      '밀봉',
      '메모',
    ];
    const effectiveFieldNames =
      fieldNames.length > 0 ? fieldNames : defaultFieldNames;

    // 각 필드를 materials 배열에 추가
    // cells[0]=단계(step), cells[1]=일(day)은 제외하고 나머지 필드 처리
    for (let i = 2; i < cells.length && i < effectiveFieldNames.length; i++) {
      const fieldName = effectiveFieldNames[i];
      const value = cells[i];

      // '단계'와 '일'은 제외하고, '메모'는 별도 필드로 처리
      if (
        fieldName &&
        fieldName !== '단계' &&
        fieldName !== '일' &&
        fieldName !== '메모' &&
        value &&
        value.trim()
      ) {
        materials.push({
          materialName: fieldName,
          value: value.trim(),
        });
      }
    }

    // 메모 필드 찾기 (마지막 셀이거나 '메모' 필드 위치)
    let memo: string | undefined;
    const memoIndex = effectiveFieldNames.indexOf('메모');
    if (memoIndex >= 0 && memoIndex < cells.length) {
      memo = cells[memoIndex]?.trim() || undefined;
    } else if (cells.length > effectiveFieldNames.length) {
      // 필드명보다 셀이 더 많으면 마지막 셀을 메모로 처리
      const lastCell = cells[cells.length - 1];
      if (lastCell && lastCell.trim()) {
        memo = lastCell.trim();
      }
    }

    const step: RecipeStep = {
      step: cells[0] || '',
      day: this.parseNumber(cells[1]) || 0,
      materials,
      memo,
    };

    return step;
  }

  parseReferences(html: string): Reference[] {
    const $ = cheerio.load(html);
    const references: Reference[] = [];

    // 테이블의 모든 행을 파싱
    $('table tr').each((index, row) => {
      const $row = $(row);
      const cells = $row
        .find('td')
        .map((_, cell) => $(cell).text().trim())
        .get();

      // 헤더 행은 제외
      if (cells.length === 0 || $row.find('b').length > 0) {
        return;
      }

      // 각 셀의 내용을 참조 정보로 파싱
      const reference: Reference = {};

      if (cells.length > 0) {
        reference.content = cells.join(' | ');
      }

      // 링크가 있으면 추출
      const links = $row.find('a');
      if (links.length > 0) {
        reference.link = links.first().attr('href') || undefined;
        reference.title = links.first().text().trim() || reference.content;
      } else {
        reference.title = cells[0] || undefined;
      }

      if (reference.title || reference.content) {
        references.push(reference);
      }
    });

    return references;
  }

  private parseNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }
}
