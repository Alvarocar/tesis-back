export class ParsingUtil {
  /**
   * Pagination Utility: Formats results into paginated response object.
   *
   * @param data - The retrieved data (results)
   * @param count - Total number of results available
   * @param page - The requested page number
   * @param pageSize - The number of items per page
   * @returns Object containing result, totalPages, and currentPage
   */
  static paginate<T>(data: T[], count: number, page: number, pageSize: number) {
    const totalPages = Math.ceil(count / pageSize);
    const currentPage = page;

    return {
      result: data,
      totalPages,
      currentPage,
    };
  }
}
