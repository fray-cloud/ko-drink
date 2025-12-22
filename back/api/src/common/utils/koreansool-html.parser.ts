import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface SearchResult {
  book: string;
  liquor: string;
  recipe: RecipeStep[];
}

export interface RecipeInfo {
  book: string;
  liquor: string;
  dup: number;
  recipe: RecipeStep[];
}

export interface RecipeMaterial {
  materialName: string;
  value: string;
}

export interface RecipeStep {
  step: string;
  day: number;
  materials: RecipeMaterial[];
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
      const $titleRow = $table.find('.tr_rcp_title').first();
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
        titleText = $table.find('tr').first().find('td').first().text().trim();
      }

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

      results.push({ book, liquor, recipe });
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
        if (recipeStep.step || recipeStep.materials.length > 0) {
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

  parseAllRecipes(html: string): RecipeInfo[] {
    const $ = cheerio.load(html);
    const recipes: RecipeInfo[] = [];

    // 모든 레시피 테이블 파싱
    $('.table_each_rcp').each((_, element) => {
      const $recipeTable = $(element);

      // 각 레시피의 메타데이터 추출
      const $titleRow = $recipeTable.find('.tr_rcp_title').first();
      if ($titleRow.length === 0) {
        return;
      }

      const $links = $titleRow.find('a');
      if ($links.length < 2) {
        return;
      }

      const book = $links.eq(0).text().trim();
      const liquor = $links.eq(1).text().trim();

      if (!book || !liquor) {
        return;
      }

      // dup 추출 (링크의 href나 target에서 추출)
      let dup = 1;
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
        recipes.push({
          book,
          liquor,
          dup,
          recipe: recipeSteps,
        });
      }
    });

    return recipes;
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
