'use client';

import { useState, useEffect } from 'react';
import { Card, DatePicker, Spin, Row, Col, Table, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Production } from '@/types';
import { calculateKPIs, calculateWorkerStats, findBestPerformers, KPI_TARGETS } from '@/lib/utils/kpi';
import BarChart from '@/components/charts/BarChart';
import { exportProductionToExcel } from '@/lib/utils/excel';
import { Button } from 'antd';

export default function DailyReportPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Production[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');

      const { data: productionData, error } = await supabase
        .from('Production')
        .select('*')
        .eq('날짜', dateStr);

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
  }, [selectedDate]);

  const kpis = calculateKPIs(data);
  const workerStats = calculateWorkerStats(data);
  const bestPerformers = findBestPerformers(workerStats, 3);

  const handleExport = () => {
    exportProductionToExcel(data, `daily_report_${selectedDate.format('YYYYMMDD')}`);
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
      title: t('defect_rate'),
      dataIndex: 'defectRate',
      key: 'defectRate',
      render: (value: number) => `${value.toFixed(2)}%`,
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
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('daily_report')}</h1>
        <div className="flex gap-2">
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
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
            <Col xs={24} md={8}>
              <Card className="text-center bg-blue-50">
                <h3 className="text-gray-600">{t('production_achievement_rate')}</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {kpis.achievementRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-400">{t('target')}: {KPI_TARGETS.ACHIEVEMENT_RATE}%</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center bg-orange-50">
                <h3 className="text-gray-600">{t('defect_rate')}</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {kpis.defectRate.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-400">{t('target')}: ≤{KPI_TARGETS.DEFECT_RATE}%</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center bg-green-50">
                <h3 className="text-gray-600">{t('work_efficiency')}</h3>
                <p className="text-3xl font-bold text-green-600">
                  {kpis.efficiencyRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-400">{t('target')}: {KPI_TARGETS.EFFICIENCY_RATE}%</p>
              </Card>
            </Col>
          </Row>

          {/* 최고 성과자 */}
          <Card title={t('best_performer')}>
            <Row gutter={[16, 16]}>
              {bestPerformers.map((performer, index) => (
                <Col xs={24} md={8} key={performer.worker}>
                  <div className={`p-4 rounded-lg text-center ${index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                    <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                    <h4 className="font-bold mt-2">{performer.worker}</h4>
                    <p className="text-gray-600">{performer.line}</p>
                    <p className="text-lg font-semibold text-primary-500">
                      {performer.achievementRate.toFixed(1)}%
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 작업자별 생산량 차트 */}
          <Card title={t('production_by_worker')}>
            <BarChart
              data={workerStats}
              xKey="worker"
              yKeys={['totalTarget', 'totalProduction', 'totalDefects']}
              labels={[t('target_quantity'), t('production_quantity'), t('defect_quantity')]}
              colors={['#1890ff', '#52c41a', '#ff4d4f']}
            />
          </Card>

          {/* 작업자별 통계 테이블 */}
          <Card title={t('stats_by_worker')}>
            <Table
              dataSource={workerStats}
              columns={columns}
              rowKey="worker"
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
}
