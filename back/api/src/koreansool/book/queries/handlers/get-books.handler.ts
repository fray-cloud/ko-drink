import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBooksQuery } from '../queries/get-books.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';
import { KoreansoolHtmlParser } from '../../../../common/utils/koreansool-html.parser';

@QueryHandler(GetBooksQuery)
export class GetBooksHandler implements IQueryHandler<GetBooksQuery> {
  constructor(
    private readonly apiClient: KoreansoolApiClient,
    private readonly htmlParser: KoreansoolHtmlParser,
  ) {}

  async execute(query: GetBooksQuery) {
    const html = await this.apiClient.getBooks();
    const books = this.htmlParser.parseBooks(html);
    return {
      books,
      count: books.length,
    };
  }
}
