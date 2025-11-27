'use client';

import { useState, useEffect } from 'react';
import { Card, DatePicker, Spin, Row, Col, Table, message, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Production } from '@/types';
import { calculateKPIs, calculateWorkerStats, calculateLineStats, KPI_TARGETS } from '@/lib/utils/kpi';
import BarChart from '@/components/charts/BarChart';
import { exportProductionToExcel } from '@/lib/utils/excel';

export default function MonthlyReportPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Production[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());

  const startOfMonth = selectedMonth.startOf('month');
  const endOfMonth = selectedMonth.endOf('month');

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = startOfMonth.format('YYYY-MM-DD');
      const endDate = endOfMonth.format('YYYY-MM-DD');

      const { data: productionData, error } = await supabase
        .from('Production')
        .select('*')
        .gte('날짜', startDate)
        .lte('날짜', endDate);

      if (error) throw error;

      setData(productionData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const kpis = calculateKPIs(data);
  const workerStats = calculateWorkerStats(data);
  const lineStats = calculateLineStats(data);

  const handleExport = () => {
    exportProductionToExcel(data, `monthly_report_${selectedMonth.format('YYYYMM')}`);
    message.success(t('export_excel') + ' ' + t('complete'));
  };

  const columns = [
    { title: t('worker'), dataIndex: 'worker', key: 'worker' },
    { title: t('line'), dataIndex: 'line', key: 'line' },
    { title: t('target_quantity'), dataIndex: 'totalTarget', key: 'target' },
    { title: t('production_quantity'), dataIndex: 'totalProduction', key: 'production' },
    { title: t('defect_quantity'), dataIndex: 'totalDefects', key: 'defects' },
    {
      title: t('achievement_rate'),
      dataIndex: 'achievementRate',
      key: 'achievement',
      render: (value: number) => `${value.toFixed(1)}%`,
    },
    {
      title: t('work_efficiency'),
      dataIndex: 'efficiencyRate',
      key: 'efficiency',
      render: (value: number) => `${value.toFixed(1)}%`,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('monthly_report')}</h1>
          <p className="text-gray-500">{selectedMonth.format('YYYY년 MM월')}</p>
        </div>
        <div className="flex gap-2">
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(date) => date && setSelectedMonth(date)}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            {t('export_excel')}
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">{t('no_production_data')}</p>
        </Card>
      ) : (
        <>
          {/* KPI 요약 */}
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Card className="text-center">
                <h3 className="text-gray-600 text-sm">{t('target_quantity')}</h3>
                <p className="text-xl font-bold">{kpis.totalTarget.toLocaleString()}</p>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="text-center">
                <h3 className="text-gray-600 text-sm">{t('production_quantity')}</h3>
                <p className="text-xl font-bold text-green-600">{kpis.totalProduction.toLocaleString()}</p>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="text-center">
                <h3 className="text-gray-600 text-sm">{t('achievement_rate')}</h3>
                <p className={`text-xl font-bold ${kpis.achievementRate >= KPI_TARGETS.ACHIEVEMENT_RATE ? 'text-green-600' : 'text-orange-600'}`}>
                  {kpis.achievementRate.toFixed(1)}%
                </p>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="text-center">
                <h3 className="text-gray-600 text-sm">{t('defect_rate')}</h3>
                <p className={`text-xl font-bold ${kpis.defectRate <= KPI_TARGETS.DEFECT_RATE ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.defectRate.toFixed(2)}%
                </p>
              </Card>
            </Col>
          </Row>

          {/* 라인별 생산량 */}
          <Card title={t('line_stats')}>
            <BarChart
              data={lineStats}
              xKey="line"
              yKeys={['totalTarget', 'totalProduction']}
              labels={[t('target_quantity'), t('production_quantity')]}
              colors={['#1890ff', '#52c41a']}
            />
          </Card>

          {/* 작업자별 통계 */}
          <Card title={t('stats_by_worker')}>
            <Table
              dataSource={workerStats}
              columns={columns}
              rowKey="worker"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
