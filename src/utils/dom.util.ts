import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

export const window = new JSDOM('').window;

export const purify = DOMPurify(window);
