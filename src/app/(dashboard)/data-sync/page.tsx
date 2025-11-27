'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Tabs,
  Button,
  Table,
  Upload,
  message,
  Space,
  Spin,
  Alert,
  Statistic,
  Row,
  Col,
  Popconfirm,
  DatePicker,
  Input,
  InputRef,
} from 'antd';
import type { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';
import {
  DownloadOutlined,
  UploadOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import dayjs, { Dayjs } from 'dayjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Production, Worker, Model } from '@/types';
import { exportProductionToExcel } from '@/lib/utils/excel';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

interface DatabaseStats {
  workers: number;
  models: number;
  production: number;
  users: number;
}

export default function DataSyncPage() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DatabaseStats>({
    workers: 0,
    models: 0,
    production: 0,
    users: 0,
  });
  const [productionData, setProductionData] = useState<Production[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('year'),
    dayjs().endOf('year'),
  ]);
  const [uploading, setUploading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [workersRes, modelsRes, productionRes, usersRes] = await Promise.all([
        supabase.from('Workers').select('id', { count: 'exact' }),
        supabase.from('Model').select('id', { count: 'exact' }),
        supabase.from('Production').select('id', { count: 'exact' }),
        supabase.from('Users').select('id', { count: 'exact' }),
      ]);

      setStats({
        workers: workersRes.count || 0,
        models: modelsRes.count || 0,
        production: productionRes.count || 0,
        users: usersRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      message.error(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchProductionData = useCallback(async () => {
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      const { data, error } = await supabase
        .from('Production')
        .select('*')
        .gte('날짜', startDate)
        .lte('날짜', endDate)
        .order('날짜', { ascending: false });

      if (error) throw error;
      setProductionData(data || []);
    } catch (error) {
      console.error('Error fetching production data:', error);
      message.error(t('error_occurred'));
    }
  }, [dateRange, t]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchProductionData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchStats, fetchProductionData]);

  useEffect(() => {
    if (isAdmin) {
      fetchProductionData();
    }
  }, [isAdmin, fetchProductionData]);

  const handleExportProduction = () => {
    if (productionData.length === 0) {
      message.warning(t('no_data'));
      return;
    }
    exportProductionToExcel(
      productionData,
      `production_${dateRange[0].format('YYYYMMDD')}_${dateRange[1].format('YYYYMMDD')}`
    );
    message.success(t('export_excel') + ' ' + t('complete'));
  };

  const handleExportWorkers = async () => {
    try {
      const { data, error } = await supabase.from('Workers').select('*').order('이름');
      if (error) throw error;

      const exportData = (data || []).map((w: Worker) => ({
        사번: w.사번,
        이름: w.이름,
        부서: w.부서,
        라인번호: w.라인번호,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Workers');
      XLSX.writeFile(wb, `workers_${dayjs().format('YYYYMMDD')}.xlsx`);
      message.success(t('export_excel') + ' ' + t('complete'));
    } catch (error) {
      message.error(t('error_occurred'));
    }
  };

  const handleExportModels = async () => {
    try {
      const { data, error } = await supabase.from('Model').select('*').order('model');
      if (error) throw error;

      const exportData = (data || []).map((m: Model) => ({
        모델명: m.model,
        공정: m.process,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Models');
      XLSX.writeFile(wb, `models_${dayjs().format('YYYYMMDD')}.xlsx`);
      message.success(t('export_excel') + ' ' + t('complete'));
    } catch (error) {
      message.error(t('error_occurred'));
    }
  };

  const handleImportProduction = async (file: File) => {
    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData as Record<string, unknown>[]) {
        try {
          const { error } = await supabase.from('Production').insert([
            {
              날짜: row['날짜'] || row['date'],
              작업자: row['작업자'] || row['worker'],
              라인번호: row['라인번호'] || row['line'],
              모델차수: row['모델차수'] || row['model'],
              목표수량: Number(row['목표수량'] || row['target'] || 0),
              생산수량: Number(row['생산수량'] || row['production'] || 0),
              불량수량: Number(row['불량수량'] || row['defect'] || 0),
              특이사항: row['특이사항'] || row['note'] || '',
            },
          ]);

          if (error) {
            errorCount++;
          } else {
            successCount++;
          }
        } catch {
          errorCount++;
        }
      }

      message.success(`${successCount} ${t('import_success')}, ${errorCount} ${t('import_failed')}`);
      fetchProductionData();
      fetchStats();
    } catch (error) {
      message.error(t('error_occurred'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteOldData = async (months: number) => {
    try {
      const cutoffDate = dayjs().subtract(months, 'month').format('YYYY-MM-DD');

      const { error } = await supabase
        .from('Production')
        .delete()
        .lt('날짜', cutoffDate);

      if (error) throw error;

      message.success(`${months} ${t('data_deleted_months')}`);
      fetchStats();
      fetchProductionData();
    } catch (error) {
      message.error(t('error_occurred'));
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert message={t('admin_required')} type="warning" showIcon />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

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

  const getColumnSearchProps = (dataIndex: keyof Production, title: string): ColumnType<Production> => ({
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
  const lineFilters = Array.from(new Set(productionData.map((d) => d.라인번호).filter(Boolean))).map((line) => ({
    text: line,
    value: line,
  }));
  const workerFilters = Array.from(new Set(productionData.map((d) => d.작업자).filter(Boolean))).map((worker) => ({
    text: worker,
    value: worker,
  }));

  const columns: ColumnType<Production>[] = [
    {
      title: t('date'),
      dataIndex: '날짜',
      key: 'date',
      width: 120,
      sorter: (a, b) => (a.날짜 || '').localeCompare(b.날짜 || ''),
      defaultSortOrder: 'descend',
    },
    {
      title: t('worker'),
      dataIndex: '작업자',
      key: 'worker',
      width: 150,
      sorter: (a, b) => (a.작업자 || '').localeCompare(b.작업자 || ''),
      filters: workerFilters,
      onFilter: (value, record) => record.작업자 === value,
      ...getColumnSearchProps('작업자', t('worker')),
    },
    {
      title: t('line'),
      dataIndex: '라인번호',
      key: 'line',
      width: 100,
      sorter: (a, b) => (a.라인번호 || '').localeCompare(b.라인번호 || ''),
      filters: lineFilters,
      onFilter: (value, record) => record.라인번호 === value,
    },
    {
      title: t('model'),
      dataIndex: '모델차수',
      key: 'model',
      width: 150,
      sorter: (a, b) => (a.모델차수 || '').localeCompare(b.모델차수 || ''),
    },
    {
      title: t('target_quantity'),
      dataIndex: '목표수량',
      key: 'target',
      width: 100,
      sorter: (a, b) => (a.목표수량 || 0) - (b.목표수량 || 0),
    },
    {
      title: t('production_quantity'),
      dataIndex: '생산수량',
      key: 'production',
      width: 100,
      sorter: (a, b) => (a.생산수량 || 0) - (b.생산수량 || 0),
    },
    {
      title: t('defect_quantity'),
      dataIndex: '불량수량',
      key: 'defect',
      width: 100,
      sorter: (a, b) => (a.불량수량 || 0) - (b.불량수량 || 0),
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: t('database_status'),
      children: (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title={t('worker_management')}
                  value={stats.workers}
                  prefix={<DatabaseOutlined />}
                  suffix={t('unit_people')}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title={t('model_management')}
                  value={stats.models}
                  prefix={<DatabaseOutlined />}
                  suffix={t('unit_items')}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title={t('production_management')}
                  value={stats.production}
                  prefix={<DatabaseOutlined />}
                  suffix={t('unit_records')}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title={t('user_management')}
                  value={stats.users}
                  prefix={<DatabaseOutlined />}
                  suffix={t('unit_people')}
                />
              </Card>
            </Col>
          </Row>

          <Card title={t('data_refresh')}>
            <Button icon={<ReloadOutlined />} onClick={() => { fetchStats(); fetchProductionData(); }}>
              {t('refresh')}
            </Button>
          </Card>
        </div>
      ),
    },
    {
      key: 'export',
      label: t('export_excel'),
      children: (
        <div className="space-y-4">
          <Card title={t('export_production')}>
            <Space direction="vertical" className="w-full">
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
              />
              <p className="text-gray-500">
                {t('selected_period')}: {dateRange[0].format('YYYY-MM-DD')} ~ {dateRange[1].format('YYYY-MM-DD')}
                ({productionData.length} {t('unit_records')})
              </p>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportProduction}
                disabled={productionData.length === 0}
              >
                {t('download_production_excel')}
              </Button>
            </Space>
          </Card>

          <Card title={t('export_master_data')}>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleExportWorkers}>
                {t('download_workers_excel')}
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExportModels}>
                {t('download_models_excel')}
              </Button>
            </Space>
          </Card>

          <Card title={t('data_preview')}>
            <Table
              dataSource={productionData}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
              }}
              scroll={{ x: 900 }}
              size="small"
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'import',
      label: t('data_import'),
      children: (
        <div className="space-y-4">
          <Alert
            message={t('caution')}
            description={t('import_caution_desc')}
            type="warning"
            showIcon
          />

          <Card title={t('import_production')}>
            <Space direction="vertical">
              <p className="text-gray-600">
                {t('excel_format_desc')}
              </p>
              <Upload
                accept=".xlsx,.xls"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleImportProduction(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {t('select_excel_file')}
                </Button>
              </Upload>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: 'cleanup',
      label: t('data_cleanup'),
      children: (
        <div className="space-y-4">
          <Alert
            message={t('warning')}
            description={t('delete_warning_desc')}
            type="error"
            showIcon
          />

          <Card title={t('delete_old_data')}>
            <Space>
              <Popconfirm
                title={t('confirm_delete_6months')}
                onConfirm={() => handleDeleteOldData(6)}
              >
                <Button danger icon={<DeleteOutlined />}>
                  {t('delete_6months_data')}
                </Button>
              </Popconfirm>
              <Popconfirm
                title={t('confirm_delete_1year')}
                onConfirm={() => handleDeleteOldData(12)}
              >
                <Button danger icon={<DeleteOutlined />}>
                  {t('delete_1year_data')}
                </Button>
              </Popconfirm>
            </Space>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('data_management')}</h1>
      <Tabs items={tabItems} />
    </div>
  );
}
