import * as XLSX from 'xlsx';
import { Production, WorkerStats } from '@/types';

/**
 * 데이터를 엑셀 파일로 내보내기
 */
export function exportToExcel<T extends object>(
  data: T[],
  filename: string
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // 컬럼 너비 자동 조정
  const maxWidth = 20;
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.min(maxWidth, Math.max(key.length, 10)),
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * 생산 데이터를 엑셀로 내보내기
 */
export function exportProductionToExcel(
  data: Production[],
  filename: string
): void {
  const formattedData = data.map((item) => ({
    날짜: item.날짜,
    작업자: item.작업자,
    라인번호: item.라인번호,
    모델차수: item.모델차수,
    목표수량: item.목표수량,
    생산수량: item.생산수량,
    불량수량: item.불량수량,
    달성률: item.목표수량 > 0
      ? `${((item.생산수량 / item.목표수량) * 100).toFixed(1)}%`
      : '0%',
    불량률: item.생산수량 > 0
      ? `${((item.불량수량 / item.생산수량) * 100).toFixed(2)}%`
      : '0%',
    특이사항: item.특이사항 || '',
  }));

  exportToExcel(formattedData, filename);
}

/**
 * 작업자 통계를 엑셀로 내보내기
 */
export function exportWorkerStatsToExcel(
  data: WorkerStats[],
  filename: string
): void {
  const formattedData = data.map((item) => ({
    작업자: item.worker,
    라인번호: item.line,
    목표수량: item.totalTarget,
    생산수량: item.totalProduction,
    불량수량: item.totalDefects,
    달성률: `${item.achievementRate.toFixed(1)}%`,
    불량률: `${item.defectRate.toFixed(2)}%`,
    작업효율: `${item.efficiencyRate.toFixed(1)}%`,
  }));

  exportToExcel(formattedData, filename);
}
