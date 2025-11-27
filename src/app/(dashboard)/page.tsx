'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Card, Select, DatePicker, Button, Statistic, Spin, message } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Production } from '@/types';
import { calculateKPIs, calculateLineStats, calculateWorkerStats, KPI_TARGETS, getKPIStatus } from '@/lib/utils/kpi';
import KPICard from '@/components/dashboard/KPICard';
import GaugeChart from '@/components/charts/GaugeChart';
import BarChart from '@/components/charts/BarChart';
import { exportToExcel } from '@/lib/utils/excel';

const { RangePicker } = DatePicker;

export default function DashboardPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Production[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [lines, setLines] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      let query = supabase
        .from('Production')
        .select('*')
        .gte('날짜', startDate)
        .lte('날짜', endDate);

      if (selectedLine !== 'all') {
        query = query.eq('라인번호', selectedLine);
      }

      const { data: productionData, error } = await query;

      if (error) throw error;

      setData(productionData || []);

      // 라인 목록 추출
      const uniqueLines = [...new Set((productionData || []).map((item) => item.라인번호))].sort();
      setLines(uniqueLines);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, selectedLine]);

  const kpis = calculateKPIs(data);
  const lineStats = calculateLineStats(data);
  const workerStats = calculateWorkerStats(data);

  const handleExport = () => {
    exportToExcel(data, `dashboard_${dateRange[0].format('YYYYMMDD')}_${dateRange[1].format('YYYYMMDD')}`);
    message.success(t('export_excel') + ' ' + t('complete'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
        <div className="flex flex-wrap gap-2">
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
          />
          <Select
            value={selectedLine}
            onChange={setSelectedLine}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: t('all') },
              ...lines.map((line) => ({ value: line, label: line })),
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            {t('refresh')}
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            {t('export_excel')}
          </Button>
        </div>
      </div>

      {/* KPI 카드 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title={t('target_quantity')}
            value={kpis.totalTarget}
            suffix={t('quantity')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title={t('production_quantity')}
            value={kpis.totalProduction}
            suffix={t('quantity')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title={t('defect_quantity')}
            value={kpis.totalDefects}
            suffix={t('quantity')}
            status={getKPIStatus(kpis.defectRate, 'defect')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title={t('achievement_rate')}
            value={kpis.achievementRate}
            suffix="%"
            status={getKPIStatus(kpis.achievementRate, 'achievement')}
          />
        </Col>
      </Row>

      {/* 게이지 차트 & 경고 카드 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title={t('production_achievement_rate')}>
            <GaugeChart
              value={kpis.achievementRate}
              target={KPI_TARGETS.ACHIEVEMENT_RATE}
              title={t('achievement_rate')}
            />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className={`border-l-4 ${getKPIStatus(kpis.achievementRate, 'achievement') === 'success' ? 'border-l-green-500' : getKPIStatus(kpis.achievementRate, 'achievement') === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
                <Statistic
                  title={t('achievement_rate')}
                  value={kpis.achievementRate}
                  suffix="%"
                  valueStyle={{ color: getKPIStatus(kpis.achievementRate, 'achievement') === 'success' ? '#52c41a' : getKPIStatus(kpis.achievementRate, 'achievement') === 'warning' ? '#faad14' : '#ff4d4f' }}
                />
                <p className="text-gray-500 text-sm mt-2">
                  {t('target')}: {KPI_TARGETS.ACHIEVEMENT_RATE}%
                </p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={`border-l-4 ${getKPIStatus(kpis.defectRate, 'defect') === 'success' ? 'border-l-green-500' : getKPIStatus(kpis.defectRate, 'defect') === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
                <Statistic
                  title={t('defect_rate')}
                  value={kpis.defectRate}
                  suffix="%"
                  precision={2}
                  valueStyle={{ color: getKPIStatus(kpis.defectRate, 'defect') === 'success' ? '#52c41a' : getKPIStatus(kpis.defectRate, 'defect') === 'warning' ? '#faad14' : '#ff4d4f' }}
                />
                <p className="text-gray-500 text-sm mt-2">
                  {t('target')}: ≤{KPI_TARGETS.DEFECT_RATE}%
                </p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={`border-l-4 ${getKPIStatus(kpis.efficiencyRate, 'efficiency') === 'success' ? 'border-l-green-500' : getKPIStatus(kpis.efficiencyRate, 'efficiency') === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
                <Statistic
                  title={t('work_efficiency')}
                  value={kpis.efficiencyRate}
                  suffix="%"
                  valueStyle={{ color: getKPIStatus(kpis.efficiencyRate, 'efficiency') === 'success' ? '#52c41a' : getKPIStatus(kpis.efficiencyRate, 'efficiency') === 'warning' ? '#faad14' : '#ff4d4f' }}
                />
                <p className="text-gray-500 text-sm mt-2">
                  {t('target')}: {KPI_TARGETS.EFFICIENCY_RATE}%
                </p>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* 라인별 생산량 차트 */}
      <Card title={t('line_stats')}>
        <BarChart
          data={lineStats}
          xKey="line"
          yKeys={['totalTarget', 'totalProduction', 'totalDefects']}
          labels={[t('target_quantity'), t('production_quantity'), t('defect_quantity')]}
          colors={['#1890ff', '#52c41a', '#ff4d4f']}
        />
      </Card>

      {/* 작업자별 생산량 차트 */}
      <Card title={t('stats_by_worker')}>
        <BarChart
          data={workerStats.slice(0, 10)}
          xKey="worker"
          yKeys={['totalTarget', 'totalProduction', 'totalDefects']}
          labels={[t('target_quantity'), t('production_quantity'), t('defect_quantity')]}
          colors={['#1890ff', '#52c41a', '#ff4d4f']}
        />
      </Card>
    </div>
  );
}
