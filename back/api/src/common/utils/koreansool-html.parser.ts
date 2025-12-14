import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface SearchResult {
  book: string;
  liquor: string;
  recipe: RecipeStep[];
}

export interface RecipeStep {
  step: string;
  day: number;
  fermentation: number;
  materials: {
    mepRice?: number;
    chapRice?: number;
    chimMi?: number;
    water?: number;
    jangsu?: number;
    tangHon?: number;
    naengHon?: number;
  };
  processing?: string;
  nuruk?: {
    amount?: number;
    type?: string;
  };
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

@Injectable()
export class KoreansoolHtmlParser {
  parseSearchResults(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.table_rcp').each((_, element) => {
      const $table = $(element);
      const titleText = $table.find('.tr_rcp_title td').text().trim();
      const [book, liquor] = this.parseTitle(titleText);

      const recipe: RecipeStep[] = [];
      $table.find('.tr_rcp_grid').each((_, row) => {
        const $row = $(row);
        const cells = $row.find('td').map((_, cell) => $(cell).text().trim()).get();

        if (cells.length > 0) {
          recipe.push(this.parseRecipeRow(cells));
        }
      });

      if (book && liquor) {
        results.push({ book, liquor, recipe });
      }
    });

    return results;
  }

  parseBooks(html: string): Book[] {
    const $ = cheerio.load(html);
    const books: Book[] = [];

    $('table tr').each((_, row) => {
      const $row = $(row);
      const cells = $row.find('td').map((_, cell) => $(cell).text().trim()).get();

      if (cells.length >= 3) {
        const book: Book = {
          name: cells[0],
          nameHanja: cells[1] || undefined,
          author: cells[2] || undefined,
        };

        if (cells[3]) {
          const yearMatch = cells[3].match(/(\d{4})/);
          if (yearMatch) {
            book.year = parseInt(yearMatch[1], 10);
          }
        }

        books.push(book);
      }
    });

    return books;
  }

  parseRecipe(html: string): RecipeStep[] {
    const $ = cheerio.load(html);
    const recipe: RecipeStep[] = [];

    $('.tr_rcp_grid').each((_, row) => {
      const $row = $(row);
      const cells = $row.find('td').map((_, cell) => $(cell).text().trim()).get();

      if (cells.length > 0) {
        recipe.push(this.parseRecipeRow(cells));
      }
    });

    return recipe;
  }

  private parseTitle(title: string): [string, string] {
    const parts = title.split(' - ');
    if (parts.length === 2) {
      return [parts[0].trim(), parts[1].trim()];
    }
    return ['', title.trim()];
  }

  private parseRecipeRow(cells: string[]): RecipeStep {
    const step = this.parseRecipeStep({
      step: cells[0] || '',
      day: this.parseNumber(cells[1]),
      fermentation: this.parseNumber(cells[2]),
      mepRice: this.parseNumber(cells[3]),
      chapRice: this.parseNumber(cells[4]),
      chimMi: this.parseNumber(cells[5]),
      water: this.parseNumber(cells[6]),
      jangsu: this.parseNumber(cells[7]),
      tangHon: this.parseNumber(cells[8]),
      naengHon: this.parseNumber(cells[9]),
      processing: cells[10] || undefined,
      nurukAmount: this.parseNumber(cells[11]),
      nurukType: cells[12] || undefined,
      memo: cells[13] || undefined,
    });

    return step;
  }

  private parseRecipeStep(data: any): RecipeStep {
    const step: RecipeStep = {
      step: data.step,
      day: data.day,
      fermentation: data.fermentation,
      materials: {
        mepRice: data.mepRice,
        chapRice: data.chapRice,
        chimMi: data.chimMi,
        water: data.water,
        jangsu: data.jangsu,
        tangHon: data.tangHon,
        naengHon: data.naengHon,
      },
      processing: data.processing,
      nuruk: {
        amount: data.nurukAmount,
        type: data.nurukType,
      },
      memo: data.memo,
    };

    return step;
  }

  private parseNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }
}
