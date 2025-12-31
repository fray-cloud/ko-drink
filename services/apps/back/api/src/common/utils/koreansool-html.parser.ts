import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

/**
 * 상세 레시피 링크 정보
 */
export interface DetailRecipeLink {
  href: string;
  params: {
    book: string;
    liquor: string;
    dup?: number;
  };
}

/**
 * 검색 결과 정보
 */
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

/**
 * 레시피 정보
 */
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

/**
 * 레시피 재료 정보
 */
export interface RecipeMaterial {
  materialName: string;
  value: string;
}

/**
 * 레시피 단계 정보
 */
export interface RecipeStep {
  step?: string;
  day: number;
  materials?: RecipeMaterial[];
  memo?: string;
}

/**
 * 문헌 정보
 */
export interface Book {
  name: string;
  nameHanja?: string;
  author?: string;
  authorHanja?: string;
  year?: number;
  description?: string;
  originalLink?: string;
  referenceLink?: string;
  recipeLink?: string;
}

/**
 * 참조 자료 정보
 */
export interface Reference {
  id?: string;
  title?: string;
  content?: string;
  category?: string;
  link?: string;
}

interface TitleInfo {
  book: string;
  liquor: string;
  titleText: string;
  $titleRow: cheerio.Cheerio<any>;
}

interface RecipeIndexInfo {
  recipeIndex: number;
  $titleRow: cheerio.Cheerio<any>;
}

/**
 * 한국 전통주 레시피 HTML 파서
 * 한국 전통주 관련 웹사이트의 HTML을 파싱하여 구조화된 데이터로 변환합니다.
 */
@Injectable()
export class KoreansoolHtmlParser {
  private static readonly MIN_TEXT_LENGTH = 5;
  private static readonly DEFAULT_FIELD_NAMES = [
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

  /**
   * 검색 결과 HTML을 파싱하여 레시피 목록을 반환합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @returns 파싱된 검색 결과 배열 (book과 liquor가 모두 있는 경우만 포함)
   */
  parseSearchResults(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.table_rcp, .table_each_rcp').each((_, element) => {
      const $table = $(element);
      const titleInfo = this.extractTitleInfo($table, $);

      if (!titleInfo.book || !titleInfo.liquor) {
        return;
      }

      const recipe = this.parseRecipeSteps($table, $);
      const metaInfo = this.parseMetaInfo(
        titleInfo.$titleRow,
        titleInfo.titleText,
      );
      const { originalText, originalTextTranslation } =
        this.extractOriginalTexts($table, titleInfo.$titleRow, html);

      results.push({
        book: titleInfo.book,
        liquor: titleInfo.liquor,
        recipe,
        ...metaInfo,
        originalText,
        originalTextTranslation,
      });
    });

    return results;
  }

  /**
   * 문헌 목록 HTML을 파싱하여 Book 객체 배열을 반환합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @returns 파싱된 Book 객체 배열
   */
  parseBooks(html: string): Book[] {
    const $ = cheerio.load(html);
    const books: Book[] = [];

    $('table tr').each((_, row) => {
      const $row = $(row);
      const $cells = $row.find('td');

      if ($cells.length < 2) {
        return;
      }

      const $secondCell = $cells.eq(1);
      if (!$secondCell.text().trim()) {
        return;
      }

      const book = this.parseBookRow($secondCell, $);
      if (book.name?.trim()) {
        books.push(book);
      }
    });

    return books;
  }

  /**
   * 레시피 상세 페이지 HTML에서 첫 번째 레시피의 단계 정보를 파싱합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @returns 레시피 단계 배열
   */
  parseRecipe(html: string): RecipeStep[] {
    const $ = cheerio.load(html);
    const $firstRecipeTable = $('.table_each_rcp').first();
    const $container =
      $firstRecipeTable.length > 0 ? $firstRecipeTable : $('body');
    return this.parseRecipeSteps($container, $);
  }

  /**
   * 레시피 HTML에서 문헌명과 술 이름을 추출합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @returns book과 liquor 정보가 담긴 객체, 파싱 실패 시 null
   */
  parseRecipeMetadata(html: string): { book: string; liquor: string } | null {
    const $ = cheerio.load(html);
    const $titleRow = $('.tr_rcp_title').first();

    if ($titleRow.length === 0) {
      return null;
    }

    const $links = $titleRow.find('a');
    if ($links.length < 2) {
      return null;
    }

    const book = $links.eq(0).text().trim();
    const liquor = $links.eq(1).text().trim();

    return book && liquor ? { book, liquor } : null;
  }

  /**
   * 레시피 HTML에서 메타 정보를 파싱합니다.
   * 한자명, 설명, 태그, 별칭, 유사 문헌 등의 정보를 추출합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @returns 레시피 메타 정보 객체
   */
  parseRecipeMetaInfo(html: string): Partial<RecipeInfo> {
    const $ = cheerio.load(html);
    const $titleRow = $('.tr_rcp_title').first();

    if ($titleRow.length === 0) {
      return {};
    }

    return this.parseMetaInfo($titleRow, $titleRow.text());
  }

  /**
   * HTML에서 모든 레시피를 파싱하여 반환합니다.
   * book만 제공하거나 liquor만 제공한 경우에도 처리합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @returns 파싱된 레시피 정보 배열
   */
  parseAllRecipes(html: string): RecipeInfo[] {
    const $ = cheerio.load(html);
    const recipes: RecipeInfo[] = [];

    $('.table_each_rcp, .table_rcp').each((_, element) => {
      const $recipeTable = $(element);
      const titleInfo = this.extractTitleInfoForRecipe($recipeTable, $);

      if (!titleInfo.book && !titleInfo.liquor) {
        return;
      }

      const dup = this.extractDupFromTitleRow(titleInfo.$titleRow);
      const recipeSteps = this.parseRecipeSteps($recipeTable, $);
      const metaInfo = this.parseMetaInfo(
        titleInfo.$titleRow,
        titleInfo.titleText,
      );
      const { originalText, originalTextTranslation } =
        this.extractOriginalTexts($recipeTable, titleInfo.$titleRow, html);

      if (recipeSteps.length > 0 || titleInfo.book || titleInfo.liquor) {
        recipes.push({
          book: titleInfo.book || '',
          liquor: titleInfo.liquor || '',
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

  /**
   * 참조 자료 목록 HTML을 파싱합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @returns 파싱된 참조 자료 배열
   */
  parseReferences(html: string): Reference[] {
    const $ = cheerio.load(html);
    const references: Reference[] = [];

    $('table tr').each((_, row) => {
      const $row = $(row);
      const cells = $row
        .find('td')
        .map((_, cell) => $(cell).text().trim())
        .get();

      if (cells.length === 0 || $row.find('b').length > 0) {
        return;
      }

      const reference: Reference = {
        content: cells.join(' | '),
      };

      const $links = $row.find('a');
      if ($links.length > 0) {
        reference.link = $links.first().attr('href') || undefined;
        reference.title = $links.first().text().trim() || reference.content;
      } else {
        reference.title = cells[0] || undefined;
      }

      if (reference.title || reference.content) {
        references.push(reference);
      }
    });

    return references;
  }

  // ========== Private Helper Methods ==========

  /**
   * 테이블에서 제목 정보를 추출합니다.
   *
   * @param $table - 파싱할 테이블 요소
   * @param $ - cheerio 루트 객체
   * @returns 추출된 제목 정보 (book, liquor, titleText, $titleRow)
   */
  private extractTitleInfo(
    $table: cheerio.Cheerio<any>,
    $: ReturnType<typeof cheerio.load>,
  ): TitleInfo {
    let $titleRow = $table.find('.tr_rcp_title').first();
    let titleText = '';

    if ($titleRow.length > 0) {
      const $links = $titleRow.find('a');
      if ($links.length >= 2) {
        const book = $links.eq(0).text().trim();
        const liquor = $links.eq(1).text().trim();
        if (book && liquor) {
          titleText = `${book} - ${liquor}`;
        }
      } else {
        titleText = $titleRow.find('td').text().trim();
      }
    } else {
      $titleRow = $table.find('tr').first();
      titleText = $titleRow.find('td').first().text().trim();
    }

    const [book, liquor] = this.parseTitle(titleText);
    return { book, liquor, titleText, $titleRow };
  }

  /**
   * 레시피 테이블에서 제목 정보를 추출합니다.
   * parseAllRecipes에서 사용하며, 링크가 하나만 있는 경우도 처리합니다.
   *
   * @param $recipeTable - 파싱할 레시피 테이블 요소
   * @param $ - cheerio 루트 객체
   * @returns 추출된 제목 정보 (book, liquor, titleText, $titleRow)
   */
  private extractTitleInfoForRecipe(
    $recipeTable: cheerio.Cheerio<any>,
    $: ReturnType<typeof cheerio.load>,
  ): TitleInfo {
    let $titleRow = $recipeTable.find('.tr_rcp_title').first();
    let titleText = '';
    let book = '';
    let liquor = '';

    if ($titleRow.length > 0) {
      const $links = $titleRow.find('a');
      if ($links.length >= 2) {
        book = $links.eq(0).text().trim();
        liquor = $links.eq(1).text().trim();
        if (book && liquor) {
          titleText = `${book} - ${liquor}`;
        }
      } else if ($links.length === 1) {
        const linkText = $links.eq(0).text().trim();
        titleText = $titleRow.find('td').text().trim();
        const [parsedBook, parsedLiquor] = this.parseTitle(titleText);

        if (parsedBook && linkText === parsedBook) {
          book = linkText;
          liquor = parsedLiquor || '';
        } else if (parsedLiquor && linkText === parsedLiquor) {
          liquor = linkText;
          book = parsedBook || '';
        } else {
          book = linkText;
          liquor = parsedLiquor || '';
        }
      } else {
        titleText = $titleRow.find('td').text().trim();
        [book, liquor] = this.parseTitle(titleText);
      }
    } else {
      $titleRow = $recipeTable.find('tr').first();
      titleText = $titleRow.find('td').first().text().trim();
      [book, liquor] = this.parseTitle(titleText);
    }

    return { book, liquor, titleText, $titleRow };
  }

  /**
   * 제목 행에서 중복 번호(dup)를 추출합니다.
   * href의 dup 파라미터 또는 target 속성의 숫자를 확인합니다.
   *
   * @param $titleRow - 제목 행 요소
   * @returns 추출된 dup 값, 없으면 기본값 1
   */
  private extractDupFromTitleRow($titleRow: cheerio.Cheerio<any>): number {
    const $links = $titleRow.find('a');
    if ($links.length < 2) {
      return 1;
    }

    const $liquorLink = $links.eq(1);
    const href = $liquorLink.attr('href') || '';
    const dupMatch = href.match(/dup=(\d+)/);

    if (dupMatch) {
      return parseInt(dupMatch[1], 10);
    }

    const target = $liquorLink.attr('target') || '';
    const targetDupMatch = target.match(/(\d+)$/);
    return targetDupMatch ? parseInt(targetDupMatch[1], 10) : 1;
  }

  /**
   * 제목 행에서 레시피 인덱스를 추출합니다.
   * toggle_org_button의 onclick 속성에서 ToggleText 함수의 인자를 파싱합니다.
   *
   * @param $titleRow - 제목 행 요소
   * @returns 추출된 레시피 인덱스, 없으면 기본값 1
   */
  private extractRecipeIndex($titleRow: cheerio.Cheerio<any>): number {
    const $toggleButton = $titleRow.find('.toggle_org_button').first();
    if ($toggleButton.length === 0) {
      return 1;
    }

    const onclick = $toggleButton.attr('onclick') || '';
    const match = onclick.match(/ToggleText\(this,(\d+)\)/);
    return match && match[1] ? parseInt(match[1], 10) : 1;
  }

  /**
   * 원문 텍스트와 해석 텍스트를 추출합니다.
   * 여러 위치에서 텍스트를 찾기 위해 폴백 전략을 사용합니다.
   *
   * @param $table - 레시피 테이블 요소
   * @param $titleRow - 제목 행 요소
   * @param html - 전체 HTML 문자열
   * @returns 원문 텍스트와 해석 텍스트가 담긴 객체
   */
  private extractOriginalTexts(
    $table: cheerio.Cheerio<any>,
    $titleRow: cheerio.Cheerio<any>,
    html: string,
  ): { originalText?: string; originalTextTranslation?: string } {
    const recipeIndex = this.extractRecipeIndex($titleRow);
    const orgSelector = `#id_text_org_${recipeIndex}, [id^="id_text_org_"]`;
    const trsSelector = `#id_text_trs_${recipeIndex}, [id^="id_text_trs_"]`;

    const originalText = this.findTextBySelector($table, orgSelector, html);
    const originalTextTranslation = this.findTextBySelector(
      $table,
      trsSelector,
      html,
    );

    return {
      originalText: this.normalizeText(originalText),
      originalTextTranslation: this.normalizeText(originalTextTranslation),
    };
  }

  /**
   * 셀렉터를 사용하여 텍스트를 찾습니다.
   * 테이블 내부, 다음 형제 요소, 부모 요소, 전체 HTML 순서로 검색합니다.
   *
   * @param $table - 검색 시작점이 되는 테이블 요소
   * @param selector - CSS 셀렉터 문자열
   * @param html - 전체 HTML 문자열 (폴백 검색용)
   * @returns 찾은 텍스트, 없으면 undefined
   */
  private findTextBySelector(
    $table: cheerio.Cheerio<any>,
    selector: string,
    html: string,
  ): string | undefined {
    // 방법 1: 테이블 내부에서 찾기
    const $textInTable = $table.find(selector).first();
    if ($textInTable.length > 0) {
      const text = $textInTable.text().trim();
      if (text.length > KoreansoolHtmlParser.MIN_TEXT_LENGTH) {
        return text;
      }
    }

    // 방법 2: 테이블 다음 형제 요소에서 찾기
    const $nextSibling = $table.next();
    if ($nextSibling.length > 0) {
      const $textNext = $nextSibling.find(selector).first();
      if ($textNext.length > 0) {
        const text = $textNext.text().trim();
        if (text.length > KoreansoolHtmlParser.MIN_TEXT_LENGTH) {
          return text;
        }
      }
    }

    // 방법 3: 테이블의 부모 요소에서 찾기
    const $parent = $table.parent();
    const $textParent = $parent.find(selector).first();
    if ($textParent.length > 0) {
      const text = $textParent.text().trim();
      if (text.length > KoreansoolHtmlParser.MIN_TEXT_LENGTH) {
        return text;
      }
    }

    // 방법 4: 전체 HTML에서 해당 레시피와 관련된 텍스트 찾기
    const tableHtml = $table.html() || '';
    const tableIndex = html.indexOf(tableHtml);
    if (tableIndex >= 0) {
      const afterTableHtml = html.substring(tableIndex);
      const $afterTable = cheerio.load(afterTableHtml);
      const $textAfter = $afterTable(selector).first();
      if ($textAfter.length > 0) {
        const text = $textAfter.text().trim();
        if (text.length > KoreansoolHtmlParser.MIN_TEXT_LENGTH) {
          return text;
        }
      }
    }

    return undefined;
  }

  /**
   * 텍스트를 정규화합니다.
   * 최소 길이보다 짧은 텍스트는 undefined로 변환합니다.
   *
   * @param text - 정규화할 텍스트
   * @returns 정규화된 텍스트 또는 undefined
   */
  private normalizeText(text: string | undefined): string | undefined {
    return text && text.length > KoreansoolHtmlParser.MIN_TEXT_LENGTH
      ? text
      : undefined;
  }

  /**
   * 컨테이너에서 레시피 단계들을 파싱합니다.
   *
   * @param $container - 파싱할 컨테이너 요소
   * @param $ - cheerio 루트 객체
   * @returns 파싱된 레시피 단계 배열
   */
  private parseRecipeSteps(
    $container: cheerio.Cheerio<any>,
    $: ReturnType<typeof cheerio.load>,
  ): RecipeStep[] {
    const fieldNames = this.extractFieldNames($container, $);
    const recipe: RecipeStep[] = [];

    $container.find('.tr_rcp_grid').each((_, row) => {
      const $row = $(row);
      const cells = $row
        .find('td')
        .map((_, cell) => $(cell).text().trim())
        .get();

      if (cells.length > 0) {
        const recipeStep = this.parseRecipeRow(cells, fieldNames);
        if (
          recipeStep.step ||
          (recipeStep.materials && recipeStep.materials.length > 0)
        ) {
          recipe.push(recipeStep);
        }
      }
    });

    return recipe;
  }

  /**
   * 컨테이너에서 필드명을 추출합니다.
   * 헤더 행(.tr_rcp_field)에서 필드명을 읽어오며, 없으면 기본 필드명을 사용합니다.
   *
   * @param $container - 파싱할 컨테이너 요소
   * @param $ - cheerio 루트 객체
   * @returns 필드명 배열
   */
  private extractFieldNames(
    $container: cheerio.Cheerio<any>,
    $: ReturnType<typeof cheerio.load>,
  ): string[] {
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

    return fieldNames.length > 0
      ? fieldNames
      : KoreansoolHtmlParser.DEFAULT_FIELD_NAMES;
  }

  /**
   * 레시피 행 데이터를 파싱하여 RecipeStep 객체를 생성합니다.
   *
   * @param cells - 테이블 셀의 텍스트 배열
   * @param fieldNames - 필드명 배열
   * @returns 파싱된 레시피 단계 객체
   */
  private parseRecipeRow(cells: string[], fieldNames: string[]): RecipeStep {
    const effectiveFieldNames =
      fieldNames.length > 0
        ? fieldNames
        : KoreansoolHtmlParser.DEFAULT_FIELD_NAMES;
    const materials: RecipeMaterial[] = [];

    for (let i = 2; i < cells.length && i < effectiveFieldNames.length; i++) {
      const fieldName = effectiveFieldNames[i];
      const value = cells[i];

      if (
        fieldName &&
        fieldName !== '단계' &&
        fieldName !== '일' &&
        fieldName !== '메모' &&
        value?.trim()
      ) {
        materials.push({
          materialName: fieldName,
          value: value.trim(),
        });
      }
    }

    const memo = this.extractMemo(cells, effectiveFieldNames);

    return {
      step: cells[0] || '',
      day: this.parseNumber(cells[1]) || 0,
      materials,
      memo,
    };
  }

  /**
   * 셀 배열에서 메모 필드를 추출합니다.
   * 필드명에 '메모'가 있으면 해당 위치에서 추출하고, 없으면 마지막 셀을 메모로 간주합니다.
   *
   * @param cells - 테이블 셀의 텍스트 배열
   * @param fieldNames - 필드명 배열
   * @returns 추출된 메모 텍스트 또는 undefined
   */
  private extractMemo(
    cells: string[],
    fieldNames: string[],
  ): string | undefined {
    const memoIndex = fieldNames.indexOf('메모');
    if (memoIndex >= 0 && memoIndex < cells.length) {
      return cells[memoIndex]?.trim() || undefined;
    }

    if (cells.length > fieldNames.length) {
      const lastCell = cells[cells.length - 1];
      return lastCell?.trim() || undefined;
    }

    return undefined;
  }

  /**
   * 제목 행에서 메타 정보를 파싱합니다.
   * 한자명, 상세 레시피 링크, 태그, 설명, 별칭, 유사 문헌 등을 추출합니다.
   *
   * @param $titleRow - 제목 행 요소
   * @param titleText - 제목 텍스트
   * @returns 파싱된 메타 정보 객체
   */
  private parseMetaInfo(
    $titleRow: cheerio.Cheerio<any>,
    titleText: string,
  ): Partial<SearchResult> {
    const meta: Partial<SearchResult> = {};
    const $titleRowHtml = $titleRow.html() || '';
    const contentBeforeOrgText =
      this.extractContentBeforeOrgText($titleRowHtml);
    const $content = cheerio.load(contentBeforeOrgText);

    this.extractLiquorHanja($content, meta);
    this.extractDetailRecipe($content, meta);
    this.extractTags(contentBeforeOrgText, meta);
    this.extractDescription(contentBeforeOrgText, meta);
    this.extractAliasAndSimilarBook(contentBeforeOrgText, meta);

    return meta;
  }

  /**
   * HTML에서 org_text_and_error 스팬 이전의 내용만 추출합니다.
   *
   * @param html - 원본 HTML 문자열
   * @returns org_text_and_error 이전의 HTML 문자열
   */
  private extractContentBeforeOrgText(html: string): string {
    const orgTextIndex = html.indexOf('<span class="org_text_and_error"');
    return orgTextIndex > 0 ? html.substring(0, orgTextIndex) : html;
  }

  /**
   * 술 이름의 한자명을 추출합니다.
   * 상세 주방문 링크의 텍스트에서 괄호 안의 한자를 찾습니다.
   *
   * @param $content - 파싱할 HTML 컨텐츠
   * @param meta - 메타 정보 객체 (결과를 이 객체에 추가)
   */
  private extractLiquorHanja(
    $content: ReturnType<typeof cheerio.load>,
    meta: Partial<SearchResult>,
  ): void {
    const $liquorLink = $content('a[target*="상세 주방문"]').first();
    if ($liquorLink.length === 0) {
      return;
    }

    const liquorText = $liquorLink.text().trim();
    const hanjaMatch = liquorText.match(/\(([^)]+)\)/);
    if (hanjaMatch?.[1]) {
      const hanjaText = hanjaMatch[1].trim();
      if (/[\u4E00-\u9FFF]/.test(hanjaText)) {
        meta.liquorHanja = hanjaText;
      }
    }
  }

  /**
   * 상세 주방문 링크를 추출하여 메타 정보에 추가합니다.
   * recipe.php 링크에서 book, liq, dup 파라미터를 파싱합니다.
   *
   * @param $content - 파싱할 HTML 컨텐츠
   * @param meta - 메타 정보 객체 (결과를 이 객체에 추가)
   */
  private extractDetailRecipe(
    $content: ReturnType<typeof cheerio.load>,
    meta: Partial<SearchResult>,
  ): void {
    const $detailRecipeLink = $content(
      'a.a_nowrap[target="동일"][title="상세 주방문"]',
    ).last();
    if ($detailRecipeLink.length === 0) {
      return;
    }

    const href = $detailRecipeLink.attr('href') || '';
    if (!href.includes('recipe.php')) {
      return;
    }

    const queryString = href.includes('?')
      ? href.split('?')[1].split('#')[0]
      : '';
    const urlParams = new URLSearchParams(queryString);
    const book = urlParams.get('book') || '';
    const liq = urlParams.get('liq') || '';
    const dup = urlParams.get('dup');

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

  /**
   * 태그 정보를 추출합니다.
   * [발효주,순곡주,단양주] 형식의 태그를 파싱하고, 링크 태그는 제거합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @param meta - 메타 정보 객체 (결과를 이 객체에 추가)
   */
  private extractTags(html: string, meta: Partial<SearchResult>): void {
    const tagsMatch = html.match(/\[([^\]]+)\]/);
    if (!tagsMatch?.[1]) {
      return;
    }

    const tagsHtml = tagsMatch[1];
    const $tags = cheerio.load(tagsHtml);
    $tags(
      'a[href*="원본"], a[href*="참조"], a[href*="유사"], a[href*="anal"], a[href*="kfood-view"]',
    ).remove();

    const tagsText = $tags('body').text() || tagsHtml;
    meta.tags = tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => {
        const trimmed = tag.trim();
        return (
          trimmed &&
          trimmed !== '원본' &&
          trimmed !== '유사' &&
          trimmed !== '참조'
        );
      });
  }

  /**
   * 설명 텍스트를 추출합니다.
   * 태그 앞뒤의 텍스트를 모두 포함하며, 한자명 괄호와 특수 문자를 제거합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @param meta - 메타 정보 객체 (결과를 이 객체에 추가)
   */
  private extractDescription(html: string, meta: Partial<SearchResult>): void {
    const tagsMatch = html.match(/\[([^\]]+)\]/);
    if (!tagsMatch?.index) {
      return;
    }

    const $descContent = cheerio.load(html);
    $descContent('a.a_nowrap[target="동일"][title="상세 주방문"]').remove();
    const cleanTextForDesc = $descContent('body').text() || '';

    const tagsMatchForDesc = cleanTextForDesc.match(/\[([^\]]+)\]/);
    if (!tagsMatchForDesc?.index) {
      return;
    }

    const beforeTags = cleanTextForDesc.substring(0, tagsMatchForDesc.index);
    const afterTags = cleanTextForDesc.substring(
      tagsMatchForDesc.index + tagsMatchForDesc[0].length,
    );

    const cleanedBefore = beforeTags
      .replace(/^\d+\.\s*/, '')
      .replace(/\(([^)]+)\)/g, '')
      .trim();

    const cleanedAfter = afterTags.replace(/☞/g, '').trim();

    const parts = cleanedBefore
      .split(/\s+/)
      .filter((part) => part.trim().length > 0);
    let description =
      parts.length > 2
        ? parts.slice(2).join(' ').trim()
        : parts.join(' ').trim();

    if (cleanedAfter) {
      const similarMatch = cleanedAfter.match(/유사[：:]\s*《([^》]+)》/);
      if (similarMatch) {
        const beforeSimilar = cleanedAfter
          .substring(0, similarMatch.index || 0)
          .trim();
        if (beforeSimilar) {
          description = description
            ? `${description} ${beforeSimilar}`
            : beforeSimilar;
        }
      } else {
        description = description
          ? `${description} ${cleanedAfter}`
          : cleanedAfter;
      }
    }

    if (description) {
      meta.description = description.trim();
    }
  }

  /**
   * 별칭과 유사 문헌 정보를 추출합니다.
   * 태그 이후의 텍스트에서 "유사:《잡초》" 형식의 유사 문헌과 별칭을 파싱합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @param meta - 메타 정보 객체 (결과를 이 객체에 추가)
   */
  private extractAliasAndSimilarBook(
    html: string,
    meta: Partial<SearchResult>,
  ): void {
    const tagsMatch = html.match(/\[([^\]]+)\]/);
    if (!tagsMatch?.index) {
      return;
    }

    const $titleRowClean = cheerio.load(html);
    const cleanText = $titleRowClean('body').text() || '';
    const afterTagsIndex = tagsMatch.index + tagsMatch[0].length;
    const afterTags = cleanText.substring(afterTagsIndex);

    const similarMatch = afterTags.match(/유사[：:]\s*《([^》]+)》/);
    if (similarMatch?.[1]) {
      meta.similarBook = similarMatch[1].trim();
    }

    const aliasText = similarMatch
      ? afterTags.substring(0, similarMatch.index || 0)
      : afterTags;

    const alias = aliasText.replace(/\s+/g, ' ').replace(/[⚠️]/g, '').trim();
    if (alias) {
      meta.alias = alias;
    }
  }

  /**
   * 문헌 행을 파싱하여 Book 객체를 생성합니다.
   *
   * @param $secondCell - 두 번째 셀 요소 (문헌 정보가 있는 셀)
   * @param $ - cheerio 루트 객체
   * @returns 파싱된 Book 객체
   */
  private parseBookRow(
    $secondCell: cheerio.Cheerio<any>,
    $: ReturnType<typeof cheerio.load>,
  ): Book {
    const book: Partial<Book> = {};
    const $allLinks = $secondCell.find('a');
    const nameLink = $allLinks.first();

    if (nameLink.length > 0) {
      book.name = nameLink.text().trim();
      book.recipeLink = nameLink.attr('href') || undefined;
    }

    this.extractBookHanja($secondCell, book);
    this.extractAuthorAndYear($secondCell, book);
    this.extractBookLinks($secondCell, $allLinks, $, book);
    this.extractBookDescription($secondCell, book);

    return book as Book;
  }

  /**
   * 문헌의 한자명을 추출합니다.
   * 첫 번째 줄에서 링크 다음의 괄호 안 텍스트를 찾습니다.
   *
   * @param $secondCell - 두 번째 셀 요소
   * @param book - Book 객체 (결과를 이 객체에 추가)
   */
  private extractBookHanja(
    $secondCell: cheerio.Cheerio<any>,
    book: Partial<Book>,
  ): void {
    const firstLine = $secondCell.html() || '';
    const hanjaMatch = firstLine.match(/<a[^>]*>([^<]+)<\/a>\s*\(([^)]+)\)/);
    if (hanjaMatch?.[2]) {
      book.nameHanja = hanjaMatch[2].trim();
    }
  }

  /**
   * 저자와 연도 정보를 추출합니다.
   * 첫 번째 br과 두 번째 br 사이의 텍스트에서 "최치원(崔致遠) 886년" 형식을 파싱합니다.
   *
   * @param $secondCell - 두 번째 셀 요소
   * @param book - Book 객체 (결과를 이 객체에 추가)
   */
  private extractAuthorAndYear(
    $secondCell: cheerio.Cheerio<any>,
    book: Partial<Book>,
  ): void {
    const secondCellHtml = $secondCell.html() || '';
    const brSplits = secondCellHtml.split(/<br\s*\/?>/i);
    let authorYearText = '';

    if (brSplits.length >= 3) {
      authorYearText = this.extractTextFromHtml(brSplits[1]);
    } else if (brSplits.length >= 2) {
      const afterFirstBrHtml = brSplits[1];
      const $afterFirstBr = cheerio.load(afterFirstBrHtml);
      $afterFirstBr('a').remove();
      const afterBrText = $afterFirstBr('body').text().trim();
      authorYearText =
        afterBrText.split('\n')[0].trim() ||
        afterFirstBrHtml
          .replace(/<[^>]+>/g, '')
          .trim()
          .split('\n')[0]
          .trim();
    }

    if (authorYearText) {
      this.parseAuthorYearText(authorYearText, book);
    }
  }

  /**
   * HTML에서 텍스트만 추출합니다.
   * 링크 태그를 제거한 후 텍스트를 반환합니다.
   *
   * @param html - 파싱할 HTML 문자열
   * @returns 추출된 텍스트
   */
  private extractTextFromHtml(html: string): string {
    const $parsed = cheerio.load(html);
    $parsed('a').remove();
    const text = $parsed('body').text().trim();
    return text || html.replace(/<[^>]+>/g, '').trim();
  }

  /**
   * 저자와 연도가 포함된 텍스트를 파싱합니다.
   * 여러 패턴을 시도하여 저자명, 저자 한자, 연도를 추출합니다.
   *
   * @param text - 파싱할 텍스트
   * @param book - Book 객체 (결과를 이 객체에 추가)
   */
  private parseAuthorYearText(text: string, book: Partial<Book>): void {
    const cleaned = text
      .replace(/^[(),\s\n\r\t,]+/, '')
      .trim()
      .replace(/[\s\n\r\t]+/g, ' ')
      .trim();

    const fullPatternMatch = this.matchAuthorYearPattern(cleaned);
    if (fullPatternMatch) {
      book.author = fullPatternMatch.author.trim();
      book.authorHanja = fullPatternMatch.authorHanja.trim();
      book.year = parseInt(fullPatternMatch.year, 10);
      return;
    }

    const yearMatch = this.matchYear(cleaned);
    if (yearMatch) {
      book.year = parseInt(yearMatch.year, 10);
      const beforeYear = cleaned.substring(0, yearMatch.index).trim();
      if (beforeYear) {
        const authorMatch = beforeYear.match(/^(.+?)\s*\(([^)]+)\)\s*$/u);
        if (authorMatch) {
          book.author = authorMatch[1].trim();
          book.authorHanja = authorMatch[2].trim();
        } else {
          book.author = beforeYear;
        }
      }
    } else {
      const authorMatch = cleaned.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
      if (authorMatch) {
        book.author = authorMatch[1].trim();
        book.authorHanja = authorMatch[2].trim();
      } else if (cleaned.trim()) {
        const fallbackMatch = cleaned.match(
          /^(.+?)\s*\(([^)]+)\)\s*(\d{3,4})\s*년/u,
        );
        if (fallbackMatch) {
          book.author = fallbackMatch[1].trim();
          book.authorHanja = fallbackMatch[2].trim();
          book.year = parseInt(fallbackMatch[3], 10);
        } else {
          book.author = cleaned.trim();
        }
      }
    }
  }

  /**
   * 저자명, 저자 한자, 연도가 모두 포함된 패턴을 매칭합니다.
   * 여러 변형 패턴을 시도합니다.
   *
   * @param text - 매칭할 텍스트
   * @returns 매칭 성공 시 { author, authorHanja, year } 객체, 실패 시 null
   */
  private matchAuthorYearPattern(
    text: string,
  ): { author: string; authorHanja: string; year: string } | null {
    const patterns = [
      /^(.+?)\s*\(([^)]+)\)\s*(\d{3,4})\s*년\s*$/u,
      /^(.+?)\s*\(([^)]+)\)\s*(\d{3,4})년\s*$/u,
      /^(.+?)\s*\(([^)]+)\)\s*(\d{3,4})\s*년$/u,
      /^(.+?)\s*\(([^)]+)\)\s*(\d{3,4})년$/u,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return { author: match[1], authorHanja: match[2], year: match[3] };
      }
    }

    return null;
  }

  /**
   * 텍스트에서 연도를 찾습니다.
   * "886년" 형식의 패턴을 여러 방법으로 시도합니다.
   *
   * @param text - 검색할 텍스트
   * @returns 매칭 성공 시 { year, index } 객체, 실패 시 null
   */
  private matchYear(text: string): { year: string; index: number } | null {
    const patterns = [/(\d{3,4})\s*년/u, /(\d{3,4})년/u];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        return { year: match[1], index: match.index };
      }
    }

    const numberMatch = text.match(/(\d{3,4})/);
    const yearCharIndex = text.indexOf('년');
    if (
      numberMatch &&
      yearCharIndex !== -1 &&
      numberMatch.index !== undefined
    ) {
      const numberEndIndex = numberMatch.index + numberMatch[0].length;
      if (
        yearCharIndex >= numberEndIndex &&
        yearCharIndex <= numberEndIndex + 2
      ) {
        return { year: numberMatch[1], index: numberMatch.index };
      }
    }

    return null;
  }

  /**
   * 문헌의 원본 링크와 참조 링크를 추출합니다.
   *
   * @param $secondCell - 두 번째 셀 요소
   * @param $allLinks - 모든 링크 요소
   * @param $ - cheerio 루트 객체
   * @param book - Book 객체 (결과를 이 객체에 추가)
   */
  private extractBookLinks(
    $secondCell: cheerio.Cheerio<any>,
    $allLinks: cheerio.Cheerio<any>,
    $: ReturnType<typeof cheerio.load>,
    book: Partial<Book>,
  ): void {
    const originalLink = this.findLinkByCriteria($secondCell, $allLinks, $, [
      '원본',
      '책원본',
    ]);
    if (originalLink) {
      book.originalLink = originalLink;
    }

    const referenceLink = this.findLinkByCriteria($secondCell, $allLinks, $, [
      '참조',
      '책참조',
    ]);
    if (referenceLink) {
      book.referenceLink = referenceLink;
    }
  }

  /**
   * 키워드를 기반으로 링크를 찾습니다.
   * target 속성, title 속성, 링크 텍스트에서 키워드를 검색합니다.
   *
   * @param $cell - 검색할 셀 요소
   * @param $allLinks - 모든 링크 요소
   * @param $ - cheerio 루트 객체
   * @param keywords - 검색할 키워드 배열
   * @returns 찾은 링크의 href 속성 값 또는 undefined
   */
  private findLinkByCriteria(
    $cell: cheerio.Cheerio<any>,
    $allLinks: cheerio.Cheerio<any>,
    $: ReturnType<typeof cheerio.load>,
    keywords: string[],
  ): string | undefined {
    const selector = keywords.map((kw) => `a[target*="${kw}"]`).join(', ');
    let link = $cell.find(selector).attr('href');

    if (!link) {
      $allLinks.each((_, linkEl) => {
        const $link = $(linkEl);
        const target = $link.attr('target') || '';
        const title = $link.attr('title') || '';
        const linkText = $link.text().trim();

        if (
          keywords.some(
            (kw) =>
              target.includes(kw) ||
              title.includes(`${kw} 보기`) ||
              linkText === kw,
          )
        ) {
          link = $link.attr('href');
          return false;
        }
      });
    }

    return link;
  }

  /**
   * 문헌의 설명을 추출합니다.
   * 두 번째 br 태그 이후의 텍스트를 설명으로 간주합니다.
   *
   * @param $secondCell - 두 번째 셀 요소
   * @param book - Book 객체 (결과를 이 객체에 추가)
   */
  private extractBookDescription(
    $secondCell: cheerio.Cheerio<any>,
    book: Partial<Book>,
  ): void {
    const secondCellHtml = $secondCell.html() || '';
    let descriptionText = '';

    const doubleBrMatch = secondCellHtml.match(/<br>\s*<br>/);
    if (doubleBrMatch?.index !== undefined) {
      const afterDoubleBrHtml = secondCellHtml.substring(
        doubleBrMatch.index + doubleBrMatch[0].length,
      );
      const $afterDoubleBr = cheerio.load(afterDoubleBrHtml);
      $afterDoubleBr('a').remove();
      descriptionText = $afterDoubleBr('body')
        .text()
        .trim()
        .replace(/<br\s*\/?>/g, '')
        .trim();
    } else {
      const brs = $secondCell.find('br');
      if (brs.length >= 2) {
        const firstBrIndex = secondCellHtml.indexOf('<br>');
        if (firstBrIndex >= 0) {
          const afterFirstBr = secondCellHtml.substring(firstBrIndex + 4);
          const secondBrIndex = afterFirstBr.indexOf('<br>');
          if (secondBrIndex >= 0) {
            const afterSecondBrHtml = afterFirstBr.substring(secondBrIndex + 4);
            const $afterSecondBr = cheerio.load(afterSecondBrHtml);
            $afterSecondBr('a').remove();
            descriptionText = $afterSecondBr('body').text().trim();
          }
        }
      }
    }

    if (descriptionText) {
      descriptionText = this.cleanBookDescription(descriptionText, book);
      if (descriptionText) {
        book.description = descriptionText;
      }
    }
  }

  /**
   * 문헌 설명에서 저자와 연도 정보를 제거합니다.
   * 중복된 정보를 정리하여 깔끔한 설명만 남깁니다.
   *
   * @param description - 정리할 설명 텍스트
   * @param book - Book 객체 (저자/연도 정보 참조용)
   * @returns 정리된 설명 텍스트
   */
  private cleanBookDescription(
    description: string,
    book: Partial<Book>,
  ): string {
    let cleaned = description;

    if (book.author) {
      if (book.authorHanja) {
        const fullAuthorPattern = `${book.author.replace(/[()]/g, '\\$&')}\\s*\\(${book.authorHanja.replace(/[()]/g, '\\$&')}\\)`;
        cleaned = cleaned
          .replace(new RegExp(fullAuthorPattern, 'g'), '')
          .trim();
      }
      cleaned = cleaned
        .replace(new RegExp(book.author.replace(/[()]/g, '\\$&'), 'g'), '')
        .trim();
      if (book.authorHanja) {
        cleaned = cleaned
          .replace(
            new RegExp(book.authorHanja.replace(/[()]/g, '\\$&'), 'g'),
            '',
          )
          .trim();
      }
    }

    if (book.year) {
      cleaned = cleaned.replace(new RegExp(`${book.year}년`, 'g'), '').trim();
    }

    return cleaned.replace(/\s+/g, ' ').trim();
  }

  /**
   * 제목 텍스트를 book과 liquor로 분리합니다.
   * 여러 구분자를 시도하여 분리합니다.
   *
   * @param title - 분리할 제목 텍스트
   * @returns [book, liquor] 튜플
   */
  private parseTitle(title: string): [string, string] {
    if (!title) {
      return ['', ''];
    }

    const parts = title.split(' - ');
    if (parts.length === 2) {
      return [parts[0].trim(), parts[1].trim()];
    }

    const parts2 = title.split(/[\s-]+/);
    if (parts2.length >= 2) {
      const first = parts2[0].trim();
      const rest = parts2.slice(1).join(' ').trim();
      if (first && rest) {
        return [first, rest];
      }
    }

    const trimmed = title.trim();
    if (trimmed) {
      const match = trimmed.match(/^(.+?)\s+(.+)$/);
      if (match) {
        return [match[1].trim(), match[2].trim()];
      }
      return ['', trimmed];
    }

    return ['', ''];
  }

  /**
   * 문자열을 숫자로 변환합니다.
   *
   * @param value - 변환할 문자열
   * @returns 변환된 숫자, 실패 시 undefined
   */
  private parseNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }
}
