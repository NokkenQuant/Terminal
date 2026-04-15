export type View = 'dashboard' | 'market-data' | 'analysis' | 'premium' | 'portfolio' | 'pricing';

export interface CommodityData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  openInt: string;
  trend: number[];
  category: 'grãos' | 'oleaginosas' | 'softs' | 'macro';
}

export interface NewsItem {
  id: string;
  category: string;
  time: string;
  title: string;
  summary?: string;
  tags: string[];
  isPremium: boolean;
}
