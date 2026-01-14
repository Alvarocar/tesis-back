import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
export class DomUtil {
  private static purify = DOMPurify(window);

  static sanitizeHtml(input: string): string {
    return DomUtil.purify.sanitize(input);
  }

  static getWindow() {
    return window;
  }
}
