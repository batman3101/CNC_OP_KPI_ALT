'use client';

import { useState, useEffect } from 'react';
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
} from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
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

  const fetchStats = async () => {
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
  };

  const fetchProductionData = async () => {
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
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchProductionData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchProductionData();
    }
  }, [dateRange]);

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

      message.success(`${successCount}개 데이터 추가 완료, ${errorCount}개 실패`);
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

      message.success(`${months}개월 이전 데이터가 삭제되었습니다.`);
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

  const columns = [
    { title: t('date'), dataIndex: '날짜', key: 'date', width: 120 },
    { title: t('worker'), dataIndex: '작업자', key: 'worker', width: 150 },
    { title: t('line'), dataIndex: '라인번호', key: 'line', width: 100 },
    { title: t('model'), dataIndex: '모델차수', key: 'model', width: 150 },
    { title: t('target_quantity'), dataIndex: '목표수량', key: 'target', width: 100 },
    { title: t('production_quantity'), dataIndex: '생산수량', key: 'production', width: 100 },
    { title: t('defect_quantity'), dataIndex: '불량수량', key: 'defect', width: 100 },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: '데이터베이스 현황',
      children: (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title={t('worker_management')}
                  value={stats.workers}
                  prefix={<DatabaseOutlined />}
                  suffix="명"
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title={t('model_management')}
                  value={stats.models}
                  prefix={<DatabaseOutlined />}
                  suffix="개"
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title={t('production_management')}
                  value={stats.production}
                  prefix={<DatabaseOutlined />}
                  suffix="건"
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title={t('user_management')}
                  value={stats.users}
                  prefix={<DatabaseOutlined />}
                  suffix="명"
                />
              </Card>
            </Col>
          </Row>

          <Card title="데이터 새로고침">
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
          <Card title="생산 실적 내보내기">
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
                선택된 기간: {dateRange[0].format('YYYY-MM-DD')} ~ {dateRange[1].format('YYYY-MM-DD')}
                ({productionData.length}건)
              </p>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportProduction}
                disabled={productionData.length === 0}
              >
                생산 실적 Excel 다운로드
              </Button>
            </Space>
          </Card>

          <Card title="마스터 데이터 내보내기">
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleExportWorkers}>
                작업자 목록 Excel
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExportModels}>
                모델 목록 Excel
              </Button>
            </Space>
          </Card>

          <Card title="데이터 미리보기">
            <Table
              dataSource={productionData.slice(0, 10)}
              columns={columns}
              rowKey="id"
              pagination={false}
              scroll={{ x: 900 }}
              size="small"
            />
            {productionData.length > 10 && (
              <p className="text-gray-500 mt-2">
                외 {productionData.length - 10}건...
              </p>
            )}
          </Card>
        </div>
      ),
    },
    {
      key: 'import',
      label: '데이터 가져오기',
      children: (
        <div className="space-y-4">
          <Alert
            message="주의"
            description="Excel 파일을 통해 데이터를 가져올 때 중복 데이터가 추가될 수 있습니다. 가져오기 전에 데이터를 확인해주세요."
            type="warning"
            showIcon
          />

          <Card title="생산 실적 가져오기">
            <Space direction="vertical">
              <p className="text-gray-600">
                Excel 파일 형식: 날짜, 작업자, 라인번호, 모델차수, 목표수량, 생산수량, 불량수량, 특이사항
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
                  Excel 파일 선택
                </Button>
              </Upload>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: 'cleanup',
      label: '데이터 정리',
      children: (
        <div className="space-y-4">
          <Alert
            message="경고"
            description="데이터 삭제는 되돌릴 수 없습니다. 삭제 전 반드시 백업을 진행해주세요."
            type="error"
            showIcon
          />

          <Card title="오래된 데이터 삭제">
            <Space>
              <Popconfirm
                title="정말로 6개월 이전 데이터를 삭제하시겠습니까?"
                onConfirm={() => handleDeleteOldData(6)}
              >
                <Button danger icon={<DeleteOutlined />}>
                  6개월 이전 데이터 삭제
                </Button>
              </Popconfirm>
              <Popconfirm
                title="정말로 1년 이전 데이터를 삭제하시겠습니까?"
                onConfirm={() => handleDeleteOldData(12)}
              >
                <Button danger icon={<DeleteOutlined />}>
                  1년 이전 데이터 삭제
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
