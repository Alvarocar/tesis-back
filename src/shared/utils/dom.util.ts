import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

export class DomUtil {
  private static window = new JSDOM('').window;
  private static purify = DOMPurify(DomUtil.window);

  static sanitizeHtml(input: string): string {
    return DomUtil.purify.sanitize(input);
  }
}
