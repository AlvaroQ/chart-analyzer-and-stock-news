import type { NewsItem } from '@/types';

export interface NewsSearchOptions {
  apiKey: string;
  ticker: string;
}

export interface NewsSearchResult {
  ticker: string;
  news: NewsItem[];
}

/** Un adaptador busca noticias del ticker ya normalizado y devuelve el texto crudo */
export type NewsAdapter = (apiKey: string, ticker: string) => Promise<string>;
