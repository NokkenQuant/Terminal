import { CommodityData, NewsItem } from './types';

export const COMMODITIES: CommodityData[] = [
  {
    symbol: 'MILHO (ZC)',
    name: 'Milho (CBOT) - Jul 24',
    price: 438.25,
    change: 5.25,
    changePercent: 1.21,
    volume: '142.390',
    openInt: '842k',
    trend: [20, 40, 30, 60, 100],
    category: 'grãos'
  },
  {
    symbol: 'SOJA (ZS)',
    name: 'Soja (CBOT) - Nov 24',
    price: 1182.50,
    change: -9.75,
    changePercent: -0.82,
    volume: '92.104',
    openInt: '1.2M',
    trend: [100, 60, 40, 20, 10],
    category: 'oleaginosas'
  },
  {
    symbol: 'TRIGO (ZW)',
    name: 'Trigo (CBOT) - Set 24',
    price: 562.75,
    change: 13.25,
    changePercent: 2.41,
    volume: '74.228',
    openInt: '411k',
    trend: [20, 40, 60, 80, 100],
    category: 'grãos'
  },
  {
    symbol: 'AÇÚCAR #11',
    name: 'Açúcar #11 (ICE) - Jul 24',
    price: 18.42,
    change: -0.04,
    changePercent: -0.22,
    volume: '42.912',
    openInt: '205k',
    trend: [20, 40, 30, 60, 100],
    category: 'softs'
  }
];

export const NEWS: NewsItem[] = [
  {
    id: '1',
    category: 'Análise Premium',
    time: '12:42 PM',
    title: 'China desloca importações de milho dos EUA para o Brasil devido à vantagem competitiva de preço',
    summary: 'Mudanças estratégicas de fornecimento à medida que o prêmio brasileiro sobre a CBOT permanece em mínimas de vários anos, pressionando as margens de exportação dos EUA...',
    tags: ['#MILHO', '#EXPORTAÇÕES'],
    isPremium: true
  },
  {
    id: '2',
    category: 'Reuters',
    time: '11:15 AM',
    title: 'Futuros de trigo saltam com escalada das tensões no Mar Negro mais uma vez',
    tags: ['#TRIGO', '#GEOPOLÍTICA'],
    isPremium: false
  },
  {
    id: '3',
    category: 'Relatório USDA',
    time: '09:30 AM',
    title: 'Progresso Semanal da Safra: Plantio de milho em 75%, igualando a média de 5 anos',
    tags: ['#DADOS', '#PRODUÇÃO'],
    isPremium: false
  }
];
