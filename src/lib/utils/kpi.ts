import { Production, KPIData, WorkerStats } from '@/types';

// KPI 목표값 상수
export const KPI_TARGETS = {
  ACHIEVEMENT_RATE: 96, // 목표 달성률 96%
  DEFECT_RATE: 2, // 불량률 2% 이하
  EFFICIENCY_RATE: 95, // 작업효율 95%
};

/**
 * 생산 데이터에서 KPI 계산
 */
export function calculateKPIs(data: Production[]): KPIData {
  if (!data || data.length === 0) {
    return {
      totalTarget: 0,
      totalProduction: 0,
      totalDefects: 0,
      achievementRate: 0,
      defectRate: 0,
      efficiencyRate: 0,
    };
  }

  const totalTarget = data.reduce((sum, item) => sum + (item.목표수량 || 0), 0);
  const totalProduction = data.reduce((sum, item) => sum + (item.생산수량 || 0), 0);
  const totalDefects = data.reduce((sum, item) => sum + (item.불량수량 || 0), 0);

  // 목표달성률: (생산수량 / 목표수량) × 100
  const achievementRate = totalTarget > 0
    ? (totalProduction / totalTarget) * 100
    : 0;

  // 불량률: (불량수량 / 생산수량) × 100
  const defectRate = totalProduction > 0
    ? (totalDefects / totalProduction) * 100
    : 0;

  // 작업효율: ((생산수량 - 불량수량) / 목표수량) × 100
  const efficiencyRate = totalTarget > 0
    ? ((totalProduction - totalDefects) / totalTarget) * 100
    : 0;

  return {
    totalTarget,
    totalProduction,
    totalDefects,
    achievementRate: Math.round(achievementRate * 10) / 10,
    defectRate: Math.round(defectRate * 100) / 100,
    efficiencyRate: Math.round(efficiencyRate * 10) / 10,
  };
}

/**
 * 작업자별 통계 계산
 */
export function calculateWorkerStats(data: Production[]): WorkerStats[] {
  if (!data || data.length === 0) return [];

  const workerMap = new Map<string, Production[]>();

  data.forEach((item) => {
    const key = item.작업자;
    if (!workerMap.has(key)) {
      workerMap.set(key, []);
    }
    workerMap.get(key)!.push(item);
  });

  const stats: WorkerStats[] = [];

  workerMap.forEach((items, worker) => {
    const kpis = calculateKPIs(items);
    const line = items[0]?.라인번호 || '';

    stats.push({
      worker,
      line,
      totalTarget: kpis.totalTarget,
      totalProduction: kpis.totalProduction,
      totalDefects: kpis.totalDefects,
      achievementRate: kpis.achievementRate,
      defectRate: kpis.defectRate,
      efficiencyRate: kpis.efficiencyRate,
    });
  });

  return stats.sort((a, b) => b.achievementRate - a.achievementRate);
}

/**
 * 라인별 통계 계산
 */
export function calculateLineStats(data: Production[]): WorkerStats[] {
  if (!data || data.length === 0) return [];

  const lineMap = new Map<string, Production[]>();

  data.forEach((item) => {
    const key = item.라인번호;
    if (!lineMap.has(key)) {
      lineMap.set(key, []);
    }
    lineMap.get(key)!.push(item);
  });

  const stats: WorkerStats[] = [];

  lineMap.forEach((items, line) => {
    const kpis = calculateKPIs(items);

    stats.push({
      worker: line,
      line,
      totalTarget: kpis.totalTarget,
      totalProduction: kpis.totalProduction,
      totalDefects: kpis.totalDefects,
      achievementRate: kpis.achievementRate,
      defectRate: kpis.defectRate,
      efficiencyRate: kpis.efficiencyRate,
    });
  });

  return stats.sort((a, b) => a.line.localeCompare(b.line));
}

/**
 * 최고 성과자 찾기
 */
export function findBestPerformers(stats: WorkerStats[], count: number = 3): WorkerStats[] {
  return [...stats]
    .sort((a, b) => b.achievementRate - a.achievementRate)
    .slice(0, count);
}

/**
 * KPI 상태 판단 (양호/주의/경고)
 */
export function getKPIStatus(
  value: number,
  type: 'achievement' | 'defect' | 'efficiency'
): 'success' | 'warning' | 'error' {
  switch (type) {
    case 'achievement':
      if (value >= KPI_TARGETS.ACHIEVEMENT_RATE) return 'success';
      if (value >= KPI_TARGETS.ACHIEVEMENT_RATE - 5) return 'warning';
      return 'error';
    case 'defect':
      if (value <= KPI_TARGETS.DEFECT_RATE) return 'success';
      if (value <= KPI_TARGETS.DEFECT_RATE + 1) return 'warning';
      return 'error';
    case 'efficiency':
      if (value >= KPI_TARGETS.EFFICIENCY_RATE) return 'success';
      if (value >= KPI_TARGETS.EFFICIENCY_RATE - 5) return 'warning';
      return 'error';
    default:
      return 'warning';
  }
}
