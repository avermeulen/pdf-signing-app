// src/utils/markdownParser.ts
import { marked } from 'marked';

// Set up marked options for security and features
marked.setOptions({
  gfm: true, // GitHub flavored markdown
  breaks: true, // Convert line breaks to <br>
  sanitize: false, // Allow HTML (but be careful with XSS)
  smartLists: true, // Use smarter list behavior
  smartypants: true, // Use "smart" typographic punctuation
});

/**
 * Parse markdown string to HTML
 */
export const parseMarkdown = (markdown: string): string => {
  return marked.parse(markdown);
};

/**
 * Parse an array of markdown strings and join them
 */
export const parseMarkdownArray = (markdownArray: string[]): string => {
  return markdownArray.map(md => parseMarkdown(md)).join('\n');
};

/**
 * Checks if a string starts with a Markdown heading (# or ##)
 */
export const isHeading = (text: string): boolean => {
  return /^#{1,6}\s+/.test(text);
};

/**
 * Gets the heading level (1-6) from a markdown heading
 */
export const getHeadingLevel = (text: string): number => {
  const match = text.match(/^(#{1,6})\s+/);
  return match ? match[1].length : 0;
};

/**
 * Gets the heading text without the # characters
 */
export const getHeadingText = (text: string): string => {
  return text.replace(/^#{1,6}\s+/, '');
};