declare module 'react-highlight-words' {
  import { ComponentType } from 'react';

  interface HighlighterProps {
    autoEscape?: boolean;
    activeClassName?: string;
    activeIndex?: number;
    activeStyle?: React.CSSProperties;
    caseSensitive?: boolean;
    className?: string;
    findChunks?: (options: {
      autoEscape?: boolean;
      caseSensitive?: boolean;
      sanitize?: (text: string) => string;
      searchWords: string[];
      textToHighlight: string;
    }) => Array<{ start: number; end: number }>;
    highlightClassName?: string | Record<string, string>;
    highlightStyle?: React.CSSProperties;
    highlightTag?: string | ComponentType<{ children: React.ReactNode; highlightIndex: number }>;
    sanitize?: (text: string) => string;
    searchWords: string[];
    textToHighlight: string;
    unhighlightClassName?: string;
    unhighlightStyle?: React.CSSProperties;
    unhighlightTag?: string | ComponentType<{ children: React.ReactNode }>;
  }

  const Highlighter: ComponentType<HighlighterProps>;
  export default Highlighter;
}
