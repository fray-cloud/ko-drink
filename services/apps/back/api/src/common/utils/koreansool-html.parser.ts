import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface DetailRecipeLink {
  href: string;
  params: {
    book: string;
    liquor: string;
    dup?: number;
  };
}

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
  originalTextTranslation?: string; // 원문 해석
  detailRecipe?: DetailRecipeLink; // 상세 주방문 링크
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
  originalTextTranslation?: string; // 원문 해석
  detailRecipe?: DetailRecipeLink; // 상세 주방문 링크
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

      // 원문 텍스트 및 해석 추출
      let originalText: string | undefined;
      let originalTextTranslation: string | undefined;
      
      // 레시피 번호 추출 (toggle_org_button의 onclick에서)
      let recipeIndex = 1; // 기본값
      const $toggleButton = $titleRow.find('.toggle_org_button').first();
      if ($toggleButton.length > 0) {
        const onclick = $toggleButton.attr('onclick') || '';
        const match = onclick.match(/ToggleText\(this,(\d+)\)/);
        if (match && match[1]) {
          recipeIndex = parseInt(match[1], 10);
        }
      }
      
      // 원문 텍스트 추출 (id_text_org_N)
      const orgSelector = `#id_text_org_${recipeIndex}, [id^="id_text_org_"]`;
      
      // 방법 1: 테이블 내부에서 찾기
      const $orgTextInTable = $table.find(orgSelector).first();
      if ($orgTextInTable.length > 0) {
        originalText = $orgTextInTable.text().trim();
      }
      
      // 방법 2: 테이블 다음 형제 요소에서 찾기
      if (!originalText || originalText.length <= 5) {
        const $nextSibling = $table.next();
        if ($nextSibling.length > 0) {
          const $orgTextNext = $nextSibling.find(orgSelector).first();
          if ($orgTextNext.length > 0) {
            originalText = $orgTextNext.text().trim();
          }
        }
      }
      
      // 방법 3: 테이블의 부모 요소에서 찾기
      if (!originalText || originalText.length <= 5) {
        const $parent = $table.parent();
        const $orgTextParent = $parent.find(orgSelector).first();
        if ($orgTextParent.length > 0) {
          originalText = $orgTextParent.text().trim();
        }
      }
      
      // 방법 4: 전체 HTML에서 해당 레시피와 관련된 원문 텍스트 찾기
      if (!originalText || originalText.length <= 5) {
        const tableHtml = $table.html() || '';
        const tableIndex = html.indexOf(tableHtml);
        if (tableIndex >= 0) {
          const afterTableHtml = html.substring(tableIndex);
          const $afterTable = cheerio.load(afterTableHtml);
          const $orgTextAfter = $afterTable(orgSelector).first();
          if ($orgTextAfter.length > 0) {
            originalText = $orgTextAfter.text().trim();
          }
        }
      }
      
      // 해석 텍스트 추출 (id_text_trs_N)
      const trsSelector = `#id_text_trs_${recipeIndex}, [id^="id_text_trs_"]`;
      
      // 방법 1: 테이블 내부에서 찾기
      const $trsTextInTable = $table.find(trsSelector).first();
      if ($trsTextInTable.length > 0) {
        originalTextTranslation = $trsTextInTable.text().trim();
      }
      
      // 방법 2: 테이블 다음 형제 요소에서 찾기
      if (!originalTextTranslation || originalTextTranslation.length <= 5) {
        const $nextSibling = $table.next();
        if ($nextSibling.length > 0) {
          const $trsTextNext = $nextSibling.find(trsSelector).first();
          if ($trsTextNext.length > 0) {
            originalTextTranslation = $trsTextNext.text().trim();
          }
        }
      }
      
      // 방법 3: 테이블의 부모 요소에서 찾기
      if (!originalTextTranslation || originalTextTranslation.length <= 5) {
        const $parent = $table.parent();
        const $trsTextParent = $parent.find(trsSelector).first();
        if ($trsTextParent.length > 0) {
          originalTextTranslation = $trsTextParent.text().trim();
        }
      }
      
      // 방법 4: 전체 HTML에서 해당 레시피와 관련된 해석 텍스트 찾기
      if (!originalTextTranslation || originalTextTranslation.length <= 5) {
        const tableHtml = $table.html() || '';
        const tableIndex = html.indexOf(tableHtml);
        if (tableIndex >= 0) {
          const afterTableHtml = html.substring(tableIndex);
          const $afterTable = cheerio.load(afterTableHtml);
          const $trsTextAfter = $afterTable(trsSelector).first();
          if ($trsTextAfter.length > 0) {
            originalTextTranslation = $trsTextAfter.text().trim();
          }
        }
      }
      
      // 원문 텍스트와 해석이 너무 짧으면 제거
      if (originalText && originalText.length <= 5) {
        originalText = undefined;
      }
      
      if (originalTextTranslation && originalTextTranslation.length <= 5) {
        originalTextTranslation = undefined;
      }

      results.push({ 
        book, 
        liquor, 
        recipe,
        ...metaInfo,
        originalText,
        originalTextTranslation,
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

    const $titleRowHtml = $titleRow.html() || '';

    // org_text_and_error 전까지의 HTML만 추출
    const orgTextIndex = $titleRowHtml.indexOf('<span class="org_text_and_error"');
    const contentBeforeOrgText = orgTextIndex > 0 
      ? $titleRowHtml.substring(0, orgTextIndex) 
      : $titleRowHtml;
    
    const $content = cheerio.load(contentBeforeOrgText);

    // 한자명 추출: (四時節酒) 형식에서 추출
    // 술 이름 링크의 텍스트에서 찾기
    const $liquorLink = $content('a[target*="상세 주방문"]').first();
    if ($liquorLink.length > 0) {
      const liquorText = $liquorLink.text().trim();
      // 술 이름 바로 뒤의 괄호에서 한자 추출
      const hanjaMatch = liquorText.match(/\(([^)]+)\)/);
      if (hanjaMatch && hanjaMatch[1]) {
        const hanjaText = hanjaMatch[1].trim();
        // 한자 문자(한자 범위: \u4E00-\u9FFF)가 포함되어 있으면 한자명으로 간주
        if (/[\u4E00-\u9FFF]/.test(hanjaText)) {
          meta.liquorHanja = hanjaText;
        }
      }
    }

    // org_text_and_error 바로 앞의 상세 주방문 링크 찾기
    const $detailRecipeLink = $content('a.a_nowrap[target="동일"][title="상세 주방문"]').last();
    if ($detailRecipeLink.length > 0) {
      const href = $detailRecipeLink.attr('href') || '';
      if (href.includes('recipe.php')) {
        // URL 파라미터 파싱 (상대 경로 또는 전체 URL 모두 처리)
        const queryString = href.includes('?') ? href.split('?')[1].split('#')[0] : '';
        const urlParams = new URLSearchParams(queryString);
        const book = urlParams.get('book') || '';
        const liq = urlParams.get('liq') || '';
        const dup = urlParams.get('dup');
        
        // @ 값은 무시
        if (book && book !== '@' && liq && liq !== '@') {
          meta.detailRecipe = {
            href: '/api/koreansool/recipes',
            params: {
              book: decodeURIComponent(book),
              liquor: decodeURIComponent(liq),
              dup: dup && dup !== '@' ? parseInt(dup, 10) : undefined,
            },
          };
        }
      }
    }

    // org_text_and_error 제거한 HTML로 파싱
    const $titleRowClean = cheerio.load(contentBeforeOrgText);
    const cleanText = $titleRowClean('body').text() || '';

    // 태그 추출: [발효주,순곡주,단양주,느림,원본,유사] 형식
    const tagsMatch = contentBeforeOrgText.match(/\[([^\]]+)\]/);
    if (tagsMatch && tagsMatch[1]) {
      // 태그 부분의 HTML을 파싱하여 링크 태그 제거
      const tagsHtml = tagsMatch[1];
      const $tags = cheerio.load(tagsHtml);
      
      // 원본, 참조, 유사 링크 태그 제거
      $tags('a[href*="원본"], a[href*="참조"], a[href*="유사"], a[href*="anal"], a[href*="kfood-view"]').remove();
      
      const tagsText = $tags('body').text() || tagsHtml;
      
      meta.tags = tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => {
          const trimmed = tag.trim();
          return trimmed && 
                 trimmed !== '원본' && 
                 trimmed !== '유사' && 
                 trimmed !== '참조';
        });
    }

    // 설명 추출: 태그를 제외하고 태그 앞과 뒤의 텍스트를 모두 포함
    if (tagsMatch && tagsMatch.index !== undefined) {
      // 상세 주방문 링크 제거한 HTML에서 설명 추출
      const $descContent = cheerio.load(contentBeforeOrgText);
      $descContent('a.a_nowrap[target="동일"][title="상세 주방문"]').remove();
      const cleanTextForDesc = $descContent('body').text() || '';
      
      const tagsMatchForDesc = cleanTextForDesc.match(/\[([^\]]+)\]/);
      if (tagsMatchForDesc && tagsMatchForDesc.index !== undefined) {
        const beforeTags = cleanTextForDesc.substring(0, tagsMatchForDesc.index);
        const afterTags = cleanTextForDesc.substring(tagsMatchForDesc.index + tagsMatchForDesc[0].length);
        
        // 태그 앞 텍스트 처리
        const cleanedBefore = beforeTags
          .replace(/^\d+\.\s*/, '') // "1. " 제거
          .replace(/\(([^)]+)\)/g, '') // 한자명 괄호 제거 (설명에는 포함하지 않음)
          // ⇐〚...〛 형식은 설명에 포함되므로 제거하지 않음
          .trim();
        
        // 태그 뒤 텍스트 처리 (인용 부분 포함, 상세 주방문 링크 제외)
        // HTML에서 이미 상세 주방문 링크 태그를 제거했으므로, ☞ 기호만 제거
        const cleanedAfter = afterTags
          .replace(/☞/g, '') // ☞ 제거
          .trim();
        
        // 책이름과 술이름을 제외한 나머지가 설명
        const parts = cleanedBefore.split(/\s+/).filter(part => part.trim().length > 0);
        let description = '';
        
        if (parts.length > 2) {
          description = parts.slice(2).join(' ').trim();
        } else if (parts.length > 0) {
          description = parts.join(' ').trim();
        }
        
        // 태그 뒤의 텍스트도 설명에 추가 (인용 등)
        if (cleanedAfter && cleanedAfter.length > 0) {
          // 유사 문헌 부분은 제외 (별도 필드로 추출)
          const similarMatch = cleanedAfter.match(/유사[：:]\s*《([^》]+)》/);
          if (similarMatch) {
            const beforeSimilar = cleanedAfter.substring(0, similarMatch.index || 0).trim();
            if (beforeSimilar) {
              description = description ? `${description} ${beforeSimilar}` : beforeSimilar;
            }
          } else {
            description = description ? `${description} ${cleanedAfter}` : cleanedAfter;
          }
        }
        
        if (description && description.length > 0) {
          meta.description = description.trim();
        }
      }
    }

    // 별칭 추출: [] 이후부터 org_text_and_error 전까지
    if (tagsMatch && tagsMatch.index !== undefined) {
      const afterTagsIndex = tagsMatch.index + tagsMatch[0].length;
      const afterTags = cleanText.substring(afterTagsIndex);
      
      // 유사 문헌 추출: 유사:《잡초》 형식
      const similarMatch = afterTags.match(/유사[：:]\s*《([^》]+)》/);
      if (similarMatch && similarMatch[1]) {
        meta.similarBook = similarMatch[1].trim();
      }
      
      // 별칭 추출: 유사 문헌 부분을 제외한 나머지
      let aliasText = afterTags;
      if (similarMatch) {
        aliasText = afterTags.substring(0, similarMatch.index || 0);
      }
      
      // 공백 정리 및 특수 문자 제거
      const alias = aliasText
        .replace(/\s+/g, ' ')
        .replace(/[⚠️]/g, '')
        .trim();
      
      if (alias && alias.length > 0) {
        meta.alias = alias;
      }
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
      
      // 제목 추출 - parseSearchResults와 동일한 로직 사용
      let titleText = '';
      let $titleRow = $recipeTable.find('.tr_rcp_title').first();
      if ($titleRow.length > 0) {
        // 링크에서 추출 시도
        $links = $titleRow.find('a');
        if ($links.length >= 2) {
          book = $links.eq(0).text().trim();
          liquor = $links.eq(1).text().trim();
          if (book && liquor) {
            titleText = `${book} - ${liquor}`;
          }
        } else if ($links.length === 1) {
          // 링크가 하나만 있는 경우
          const linkText = $links.eq(0).text().trim();
          titleText = $titleRow.find('td').text().trim();
          // parseTitle로 파싱 시도
          const [parsedBook, parsedLiquor] = this.parseTitle(titleText);
          
          // 링크 텍스트가 book인지 liquor인지 판단
          if (parsedBook && linkText === parsedBook) {
            book = linkText;
            liquor = parsedLiquor || '';
          } else if (parsedLiquor && linkText === parsedLiquor) {
            liquor = linkText;
            book = parsedBook || '';
          } else {
            // 판단이 어려우면 링크 텍스트를 book으로 가정 (book만 제공했을 가능성)
            book = linkText;
            liquor = parsedLiquor || '';
          }
        } else {
          // 텍스트에서 추출
          titleText = $titleRow.find('td').text().trim();
          [book, liquor] = this.parseTitle(titleText);
        }
      } else {
        // 대체 방법: 테이블의 첫 번째 행에서 제목 찾기
        $titleRow = $recipeTable.find('tr').first();
        titleText = $titleRow.find('td').first().text().trim();
        [book, liquor] = this.parseTitle(titleText);
      }

      // book만 제공했을 때는 liquor가 없어도 허용
      // liq만 제공했을 때는 book이 없어도 허용
      // 둘 다 없으면 건너뛰기
      if (!book && !liquor) {
        return;
      }
      
      // book만 있고 liquor가 없으면 빈 문자열로 설정
      if (book && !liquor) {
        liquor = '';
      }
      // liq만 있고 book이 없으면 빈 문자열로 설정
      if (liquor && !book) {
        book = '';
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
          if (recipeStep.step || (recipeStep.materials && recipeStep.materials.length > 0)) {
            recipeSteps.push(recipeStep);
          }
        }
      });

      if (recipeSteps.length > 0 || book || liquor) {
        // 메타 정보 파싱
        const metaInfo = this.parseSearchMetaInfo($titleRow, $titleRow.text());

        // 원문 텍스트 및 해석 추출 (각 레시피 테이블의 HTML에서 직접 추출)
        // 각 레시피 테이블마다 id_text_org_N, id_text_trs_N이 있을 수 있으므로,
        // 레시피 테이블 내부나 다음 형제 요소에서 원문 텍스트와 해석 찾기
        let originalText: string | undefined;
        let originalTextTranslation: string | undefined;
        
        // 레시피 번호 추출 (toggle_org_button의 onclick에서)
        let recipeIndex = 1; // 기본값
        const $toggleButton = $titleRow.find('.toggle_org_button').first();
        if ($toggleButton.length > 0) {
          const onclick = $toggleButton.attr('onclick') || '';
          const match = onclick.match(/ToggleText\(this,(\d+)\)/);
          if (match && match[1]) {
            recipeIndex = parseInt(match[1], 10);
          }
        }
        
        // 원문 텍스트 추출 (id_text_org_N)
        const orgSelector = `#id_text_org_${recipeIndex}, [id^="id_text_org_"]`;
        
        // 방법 1: 레시피 테이블 내부에서 찾기
        const $orgTextInTable = $recipeTable.find(orgSelector).first();
        if ($orgTextInTable.length > 0) {
          originalText = $orgTextInTable.text().trim();
        }
        
        // 방법 2: 레시피 테이블 다음 형제 요소에서 찾기
        if (!originalText || originalText.length <= 5) {
          const $nextSibling = $recipeTable.next();
          if ($nextSibling.length > 0) {
            const $orgTextNext = $nextSibling.find(orgSelector).first();
            if ($orgTextNext.length > 0) {
              originalText = $orgTextNext.text().trim();
            }
          }
        }
        
        // 방법 3: 레시피 테이블의 부모 요소에서 찾기
        if (!originalText || originalText.length <= 5) {
          const $parent = $recipeTable.parent();
          const $orgTextParent = $parent.find(orgSelector).first();
          if ($orgTextParent.length > 0) {
            originalText = $orgTextParent.text().trim();
          }
        }
        
        // 방법 4: 전체 HTML에서 해당 레시피와 관련된 원문 텍스트 찾기
        if (!originalText || originalText.length <= 5) {
          const recipeTableHtml = $recipeTable.html() || '';
          const recipeTableIndex = html.indexOf(recipeTableHtml);
          if (recipeTableIndex >= 0) {
            const afterTableHtml = html.substring(recipeTableIndex);
            const $afterTable = cheerio.load(afterTableHtml);
            const $orgTextAfter = $afterTable(orgSelector).first();
            if ($orgTextAfter.length > 0) {
              originalText = $orgTextAfter.text().trim();
            }
          }
        }
        
        // 해석 텍스트 추출 (id_text_trs_N)
        const trsSelector = `#id_text_trs_${recipeIndex}, [id^="id_text_trs_"]`;
        
        // 방법 1: 레시피 테이블 내부에서 찾기
        const $trsTextInTable = $recipeTable.find(trsSelector).first();
        if ($trsTextInTable.length > 0) {
          originalTextTranslation = $trsTextInTable.text().trim();
        }
        
        // 방법 2: 레시피 테이블 다음 형제 요소에서 찾기
        if (!originalTextTranslation || originalTextTranslation.length <= 5) {
          const $nextSibling = $recipeTable.next();
          if ($nextSibling.length > 0) {
            const $trsTextNext = $nextSibling.find(trsSelector).first();
            if ($trsTextNext.length > 0) {
              originalTextTranslation = $trsTextNext.text().trim();
            }
          }
        }
        
        // 방법 3: 레시피 테이블의 부모 요소에서 찾기
        if (!originalTextTranslation || originalTextTranslation.length <= 5) {
          const $parent = $recipeTable.parent();
          const $trsTextParent = $parent.find(trsSelector).first();
          if ($trsTextParent.length > 0) {
            originalTextTranslation = $trsTextParent.text().trim();
          }
        }
        
        // 방법 4: 전체 HTML에서 해당 레시피와 관련된 해석 텍스트 찾기
        if (!originalTextTranslation || originalTextTranslation.length <= 5) {
          const recipeTableHtml = $recipeTable.html() || '';
          const recipeTableIndex = html.indexOf(recipeTableHtml);
          if (recipeTableIndex >= 0) {
            const afterTableHtml = html.substring(recipeTableIndex);
            const $afterTable = cheerio.load(afterTableHtml);
            const $trsTextAfter = $afterTable(trsSelector).first();
            if ($trsTextAfter.length > 0) {
              originalTextTranslation = $trsTextAfter.text().trim();
            }
          }
        }
        
        if (originalText && originalText.length > 5) {
          // 원문 텍스트가 있으면 사용
        } else {
          originalText = undefined;
        }
        
        if (originalTextTranslation && originalTextTranslation.length > 5) {
          // 해석 텍스트가 있으면 사용
        } else {
          originalTextTranslation = undefined;
        }

        // book만 제공했을 때는 liquor가 없어도 허용 (빈 문자열로 설정)
        // liq만 제공했을 때는 book이 없어도 허용 (빈 문자열로 설정)
        recipes.push({
          book: book || '',
          liquor: liquor || '',
          dup,
          recipe: recipeSteps,
          ...metaInfo,
          originalText,
          originalTextTranslation,
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
    const $titleRowHtml = $titleRow.html() || '';

    // org_text_and_error 전까지의 HTML만 추출
    const orgTextIndex = $titleRowHtml.indexOf('<span class="org_text_and_error"');
    const contentBeforeOrgText = orgTextIndex > 0 
      ? $titleRowHtml.substring(0, orgTextIndex) 
      : $titleRowHtml;
    
    const $content = cheerio.load(contentBeforeOrgText);

    // 첫 번째 <a target="문헌 정보"> 태그에서 book 추출
    const $bookLink = $content('a[target="문헌 정보"]').first();
    if ($bookLink.length > 0) {
      // book은 이미 parseTitle에서 추출되므로 여기서는 한자명만 확인
    }

    // 한자명 추출: (四時節酒) 형식에서 추출
    // 술 이름 링크의 텍스트에서 찾기
    const $liquorLink = $content('a[target*="상세 주방문"]').first();
    if ($liquorLink.length > 0) {
      const liquorText = $liquorLink.text().trim();
      // 술 이름 바로 뒤의 괄호에서 한자 추출
      const hanjaMatch = liquorText.match(/\(([^)]+)\)/);
      if (hanjaMatch && hanjaMatch[1]) {
        const hanjaText = hanjaMatch[1].trim();
        // 한자 문자(한자 범위: \u4E00-\u9FFF)가 포함되어 있으면 한자명으로 간주
        if (/[\u4E00-\u9FFF]/.test(hanjaText)) {
          meta.liquorHanja = hanjaText;
        }
      }
    }

    // org_text_and_error 바로 앞의 상세 주방문 링크 찾기
    const $detailRecipeLink = $content('a.a_nowrap[target="동일"][title="상세 주방문"]').last();
    if ($detailRecipeLink.length > 0) {
      const href = $detailRecipeLink.attr('href') || '';
      if (href.includes('recipe.php')) {
        const urlParams = new URLSearchParams(href.split('?')[1] || '');
        const book = urlParams.get('book') || '';
        const liq = urlParams.get('liq') || '';
        const dup = urlParams.get('dup');
        
        if (book && liq) {
          meta.detailRecipe = {
            href: '/api/koreansool/recipes',
            params: {
              book: decodeURIComponent(book),
              liquor: decodeURIComponent(liq),
              dup: dup && dup !== '@' ? parseInt(dup, 10) : undefined,
            },
          };
        }
      }
    }

    // org_text_and_error 제거한 HTML로 파싱
    const $titleRowClean = cheerio.load(contentBeforeOrgText);
    const cleanText = $titleRowClean('body').text() || '';

    // 태그 추출: [발효주,순곡주,단양주,느림,원본,유사] 형식
    const tagsMatch = contentBeforeOrgText.match(/\[([^\]]+)\]/);
    if (tagsMatch && tagsMatch[1]) {
      // 태그 부분의 HTML을 파싱하여 링크 태그 제거
      const tagsHtml = tagsMatch[1];
      const $tags = cheerio.load(tagsHtml);
      
      // 원본, 참조, 유사 링크 태그 제거
      $tags('a[href*="원본"], a[href*="참조"], a[href*="유사"], a[href*="anal"], a[href*="kfood-view"]').remove();
      
      const tagsText = $tags('body').text() || tagsHtml;
      
      meta.tags = tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => {
          const trimmed = tag.trim();
          return trimmed && 
                 trimmed !== '원본' && 
                 trimmed !== '유사' && 
                 trimmed !== '참조';
        });
    }

    // 설명 추출: 태그를 제외하고 태그 앞과 뒤의 텍스트를 모두 포함
    if (tagsMatch && tagsMatch.index !== undefined) {
      // 상세 주방문 링크 제거한 HTML에서 설명 추출
      const $descContent = cheerio.load(contentBeforeOrgText);
      $descContent('a.a_nowrap[target="동일"][title="상세 주방문"]').remove();
      const cleanTextForDesc = $descContent('body').text() || '';
      
      const tagsMatchForDesc = cleanTextForDesc.match(/\[([^\]]+)\]/);
      if (tagsMatchForDesc && tagsMatchForDesc.index !== undefined) {
        const beforeTags = cleanTextForDesc.substring(0, tagsMatchForDesc.index);
        const afterTags = cleanTextForDesc.substring(tagsMatchForDesc.index + tagsMatchForDesc[0].length);
        
        // 태그 앞 텍스트 처리
        const cleanedBefore = beforeTags
          .replace(/^\d+\.\s*/, '') // "1. " 제거
          .replace(/\(([^)]+)\)/g, '') // 한자명 괄호 제거 (설명에는 포함하지 않음)
          // ⇐〚...〛 형식은 설명에 포함되므로 제거하지 않음
          .trim();
        
        // 태그 뒤 텍스트 처리 (인용 부분 포함, 상세 주방문 링크 제외)
        // HTML에서 이미 상세 주방문 링크 태그를 제거했으므로, ☞ 기호만 제거
        const cleanedAfter = afterTags
          .replace(/☞/g, '') // ☞ 제거
          .trim();
        
        // 책이름과 술이름을 제외한 나머지가 설명
        const parts = cleanedBefore.split(/\s+/).filter(part => part.trim().length > 0);
        let description = '';
        
        if (parts.length > 2) {
          description = parts.slice(2).join(' ').trim();
        } else if (parts.length > 0) {
          description = parts.join(' ').trim();
        }
        
        // 태그 뒤의 텍스트도 설명에 추가 (인용 등)
        if (cleanedAfter && cleanedAfter.length > 0) {
          // 유사 문헌 부분은 제외 (별도 필드로 추출)
          const similarMatch = cleanedAfter.match(/유사[：:]\s*《([^》]+)》/);
          if (similarMatch) {
            const beforeSimilar = cleanedAfter.substring(0, similarMatch.index || 0).trim();
            if (beforeSimilar) {
              description = description ? `${description} ${beforeSimilar}` : beforeSimilar;
            }
          } else {
            description = description ? `${description} ${cleanedAfter}` : cleanedAfter;
          }
        }
        
        if (description && description.length > 0) {
          meta.description = description.trim();
        }
      }
    }

    // 별칭 추출: [] 이후부터 org_text_and_error 전까지
    if (tagsMatch && tagsMatch.index !== undefined) {
      const afterTagsIndex = tagsMatch.index + tagsMatch[0].length;
      const afterTags = cleanText.substring(afterTagsIndex);
      
      // 유사 문헌 추출: 유사:《잡초》 형식
      const similarMatch = afterTags.match(/유사[：:]\s*《([^》]+)》/);
      if (similarMatch && similarMatch[1]) {
        meta.similarBook = similarMatch[1].trim();
      }
      
      // 별칭 추출: 유사 문헌 부분을 제외한 나머지
      let aliasText = afterTags;
      if (similarMatch) {
        aliasText = afterTags.substring(0, similarMatch.index || 0);
      }
      
      // 공백 정리 및 특수 문자 제거
      const alias = aliasText
        .replace(/\s+/g, ' ')
        .replace(/[⚠️]/g, '')
        .trim();
      
      if (alias && alias.length > 0) {
        meta.alias = alias;
      }
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

