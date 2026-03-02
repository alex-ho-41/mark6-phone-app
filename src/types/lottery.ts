export interface PayoutDetail {
  prizeLevel: string;
  dividend: number;
  winningUnits: number;
}

export interface NextDraw {
  drawNumber: string;
  drawDate: string;
  estimatedJackpot: number;
}

export interface MarkSixResult {
  drawNumber: string;
  drawDate: string;
  turnover: number;
  numbers: string[];
  extraNumber: string;
  payoutDetails: PayoutDetail[];
  nextDraw: NextDraw | null;
  updateTime: string;
}

export interface ApiResponse {
  success: boolean;
  data?: MarkSixResult;
  error?: string;
}

export interface ColorDistribution {
  red: number;
  blue: number;
  green: number;
}

export interface BankerConfig {
  bankerCount: number;        // 1-5
  bankerColors: ColorDistribution;
  playerCount: number;        // 1-44 (banker+player ≤ 49)
  playerColors: ColorDistribution;
}

export interface MultipleConfig {
  totalCount: number;         // 7-49
  colors: ColorDistribution;
}

export interface HistoryEntry {
  id: number;
  numbers: number[];
  timestamp: Date;
  bankerCount?: number;
}

export interface FavoriteEntry {
  id: number;
  numbers: number[];
  timestamp: Date;
  bankerCount?: number;
}

export interface DrawResult {
  drawNumber: string;
  drawDate: string;
  turnover: number;
  numbers: string[];
  extraNumber: string;
  payoutDetails: PayoutDetail[];
}

export interface AnalyseResponse {
  success: boolean;
  count?: number;
  data?: DrawResult[];
  error?: string;
}
