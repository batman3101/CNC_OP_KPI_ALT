'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, DatePicker, Spin, Row, Col, Table, message, Button, Input, Space, InputRef } from 'antd';
import type { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import dayjs, { Dayjs } from 'dayjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Production } from '@/types';
import { calculateKPIs, calculateWorkerStats, calculateLineStats, findBestPerformers, KPI_TARGETS, WorkerStats } from '@/lib/utils/kpi';
import BarChart from '@/components/charts/BarChart';
import { exportProductionToExcel } from '@/lib/utils/excel';

export default function YearlyReportPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Production[]>([]);
  const [selectedYear, setSelectedYear] = useState<Dayjs>(dayjs());
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const startOfYear = selectedYear.startOf('year');
  const endOfYear = selectedYear.endOf('year');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = selectedYear.startOf('year').format('YYYY-MM-DD');
      const endDate = selectedYear.endOf('year').format('YYYY-MM-DD');

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
  }, [selectedYear, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = calculateKPIs(data);
  const workerStats = calculateWorkerStats(data);
  const lineStats = calculateLineStats(data);
  const bestPerformers = findBestPerformers(workerStats, 3);

  const handleExport = () => {
    exportProductionToExcel(data, `yearly_report_${selectedYear.format('YYYY')}`);
    message.success(t('export_excel') + ' ' + t('complete'));
  };

  // 검색 기능
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: keyof WorkerStats, title: string): ColumnType<WorkerStats> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`${title} ${t('search_keyword')}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex as string)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex as string)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {t('search_keyword')}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            {t('reset_filter')}
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            {t('close')}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      if (recordValue == null) return false;
      return recordValue.toString().toLowerCase().includes((value as string).toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  // 필터 옵션
  const lineFilters = Array.from(new Set(workerStats.map((w) => w.line).filter(Boolean))).map((line) => ({
    text: line,
    value: line,
  }));

  const columns: ColumnType<WorkerStats>[] = [
    {
      title: t('worker'),
      dataIndex: 'worker',
      key: 'worker',
      sorter: (a, b) => (a.worker || '').localeCompare(b.worker || ''),
      ...getColumnSearchProps('worker', t('worker')),
    },
    {
      title: t('line'),
      dataIndex: 'line',
      key: 'line',
      sorter: (a, b) => (a.line || '').localeCompare(b.line || ''),
      filters: lineFilters,
      onFilter: (value, record) => record.line === value,
    },
    {
      title: t('target_quantity'),
      dataIndex: 'totalTarget',
      key: 'target',
      sorter: (a, b) => (a.totalTarget || 0) - (b.totalTarget || 0),
    },
    {
      title: t('production_quantity'),
      dataIndex: 'totalProduction',
      key: 'production',
      sorter: (a, b) => (a.totalProduction || 0) - (b.totalProduction || 0),
    },
    {
      title: t('defect_quantity'),
      dataIndex: 'totalDefects',
      key: 'defects',
      sorter: (a, b) => (a.totalDefects || 0) - (b.totalDefects || 0),
    },
    {
      title: t('achievement_rate'),
      dataIndex: 'achievementRate',
      key: 'achievement',
      sorter: (a, b) => (a.achievementRate || 0) - (b.achievementRate || 0),
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
          <h1 className="text-2xl font-bold">{t('yearly_report')}</h1>
          <p className="text-gray-500">{selectedYear.format('YYYY')}년</p>
        </div>
        <div className="flex gap-2">
          <DatePicker
            picker="year"
            value={selectedYear}
            onChange={(date) => date && setSelectedYear(date)}
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

          {/* 최고 성과자 */}
          <Card title={t('best_performer')}>
            <Row gutter={[16, 16]}>
              {[0, 1, 2].map((index) => {
                const performer = bestPerformers[index];
                return (
                  <Col xs={24} md={8} key={index}>
                    <div className={`p-6 rounded-lg text-center min-h-[160px] flex flex-col justify-center ${index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                      {performer ? (
                        <>
                          <span className="text-4xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                          <h4 className="font-bold mt-3 text-xl">{performer.worker}</h4>
                          <p className="text-gray-600 text-lg">{performer.line}</p>
                          <p className="text-2xl font-bold text-blue-600 mt-2">
                            {performer.achievementRate.toFixed(1)}%
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                          <p className="text-gray-400 mt-3 text-lg">-</p>
                        </>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>

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
              pagination={{
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
              }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
