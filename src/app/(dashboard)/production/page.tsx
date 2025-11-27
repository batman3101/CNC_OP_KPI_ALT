'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  DatePicker,
  Select,
  InputNumber,
  Input,
  Button,
  Table,
  Popconfirm,
  message,
  Space,
  Spin,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Production, Worker, Model } from '@/types';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function ProductionPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Production[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [editingRecord, setEditingRecord] = useState<Production | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      const [productionRes, workersRes, modelsRes] = await Promise.all([
        supabase
          .from('Production')
          .select('*')
          .gte('날짜', startDate)
          .lte('날짜', endDate)
          .order('날짜', { ascending: false }),
        supabase.from('Workers').select('*').order('이름'),
        supabase.from('Model').select('*').order('model'),
      ]);

      setData(productionRes.data || []);
      setWorkers(workersRes.data || []);
      setModels(modelsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      message.error(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const payload = {
        date: (values.date as Dayjs).format('YYYY-MM-DD'),
        worker: values.worker,
        lineNumber: values.line,
        model: values.model,
        targetQuantity: values.targetQuantity,
        productionQuantity: values.productionQuantity,
        defectQuantity: values.defectQuantity,
        note: values.note || '',
      };

      const response = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success(t('production_saved'));
        form.resetFields();
        fetchData();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      message.error(t('production_save_error'));
    }
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editingRecord) return;

    try {
      const payload = {
        date: (values.date as Dayjs).format('YYYY-MM-DD'),
        worker: values.worker,
        lineNumber: values.line,
        model: values.model,
        targetQuantity: values.targetQuantity,
        productionQuantity: values.productionQuantity,
        defectQuantity: values.defectQuantity,
        note: values.note || '',
      };

      const response = await fetch(`/api/production/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success(t('data_updated'));
        setEditingRecord(null);
        fetchData();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      message.error(t('data_update_error'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/production/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success(t('data_deleted'));
        fetchData();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      message.error(t('data_delete_error'));
    }
  };

  const lines = [...new Set(workers.map((w) => w.라인번호))].sort();

  const columns = [
    { title: t('date'), dataIndex: '날짜', key: 'date', width: 120 },
    { title: t('worker'), dataIndex: '작업자', key: 'worker', width: 150 },
    { title: t('line'), dataIndex: '라인번호', key: 'line', width: 100 },
    { title: t('model'), dataIndex: '모델차수', key: 'model', width: 150 },
    { title: t('target_quantity'), dataIndex: '목표수량', key: 'target', width: 100 },
    { title: t('production_quantity'), dataIndex: '생산수량', key: 'production', width: 100 },
    { title: t('defect_quantity'), dataIndex: '불량수량', key: 'defect', width: 100 },
    {
      title: t('achievement_rate'),
      key: 'achievement',
      width: 100,
      render: (_: unknown, record: Production) =>
        record.목표수량 > 0
          ? `${((record.생산수량 / record.목표수량) * 100).toFixed(1)}%`
          : '0%',
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: Production) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => setEditingRecord(record)}
          />
          <Popconfirm
            title={t('confirm_delete_data')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'register',
      label: t('register_result'),
      children: (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              date: dayjs(),
              targetQuantity: 0,
              productionQuantity: 0,
              defectQuantity: 0,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Form.Item
                name="date"
                label={t('production_date')}
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item
                name="worker"
                label={t('worker')}
                rules={[{ required: true, message: t('select_worker') }]}
              >
                <Select
                  showSearch
                  placeholder={t('select_worker')}
                  optionFilterProp="children"
                >
                  {workers.map((w) => (
                    <Select.Option key={w.이름} value={w.이름}>
                      {w.이름}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="line"
                label={t('line')}
                rules={[{ required: true, message: t('select_line') }]}
              >
                <Select placeholder={t('select_line')}>
                  {lines.map((line) => (
                    <Select.Option key={line} value={line}>
                      {line}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="model"
                label={t('model')}
                rules={[{ required: true, message: t('select_model') }]}
              >
                <Select showSearch placeholder={t('select_model')} optionFilterProp="children">
                  {models.map((m) => (
                    <Select.Option key={m.model} value={m.model}>
                      {m.model}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="targetQuantity"
                label={t('target_quantity')}
                rules={[{ required: true }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item
                name="productionQuantity"
                label={t('production_quantity')}
                rules={[{ required: true }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item
                name="defectQuantity"
                label={t('defect_quantity')}
                rules={[{ required: true }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </div>
            <Form.Item name="note" label={t('note')}>
              <TextArea rows={2} />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              {t('save_result')}
            </Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'list',
      label: t('view_result'),
      children: (
        <div className="space-y-4">
          <Card>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
              />
              <Button icon={<SearchOutlined />} onClick={fetchData}>
                {t('search')}
              </Button>
            </Space>
          </Card>
          <Card>
            <Table
              dataSource={data}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('production_management')}</h1>
      <Tabs items={tabItems} />

      {/* 수정 모달은 간단히 드로어로 처리 가능 - 여기서는 기본 폼 재사용 */}
      {editingRecord && (
        <Card
          title={t('edit_result')}
          extra={
            <Button onClick={() => setEditingRecord(null)}>{t('cancel')}</Button>
          }
        >
          <Form
            layout="vertical"
            onFinish={handleUpdate}
            initialValues={{
              date: dayjs(editingRecord.날짜),
              worker: editingRecord.작업자,
              line: editingRecord.라인번호,
              model: editingRecord.모델차수,
              targetQuantity: editingRecord.목표수량,
              productionQuantity: editingRecord.생산수량,
              defectQuantity: editingRecord.불량수량,
              note: editingRecord.특이사항,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item name="date" label={t('date')}>
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item name="worker" label={t('worker')}>
                <Select>
                  {workers.map((w) => (
                    <Select.Option key={w.이름} value={w.이름}>
                      {w.이름}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="line" label={t('line')}>
                <Select>
                  {lines.map((line) => (
                    <Select.Option key={line} value={line}>
                      {line}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="model" label={t('model')}>
                <Select>
                  {models.map((m) => (
                    <Select.Option key={m.model} value={m.model}>
                      {m.model}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="targetQuantity" label={t('target_quantity')}>
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item name="productionQuantity" label={t('production_quantity')}>
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item name="defectQuantity" label={t('defect_quantity')}>
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </div>
            <Form.Item name="note" label={t('note')}>
              <TextArea rows={2} />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              {t('edit_complete')}
            </Button>
          </Form>
        </Card>
      )}
    </div>
  );
}
