'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Table,
  Popconfirm,
  message,
  Space,
  Spin,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Worker } from '@/types';

export default function WorkersPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Workers')
        .select('*')
        .order('이름');

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error:', error);
      message.error(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: values.employeeId,
          name: values.name,
          department: values.department || 'CNC',
          lineNumber: values.lineNumber,
        }),
      });

      if (response.ok) {
        message.success(t('worker') + ' ' + t('registered'));
        form.resetFields();
        fetchWorkers();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      message.error(t('worker_data_save_error'));
    }
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editingWorker) return;

    try {
      const response = await fetch(`/api/workers/${editingWorker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: values.employeeId,
          name: values.name,
          department: values.department,
          lineNumber: values.lineNumber,
        }),
      });

      if (response.ok) {
        message.success(t('info_updated'));
        setEditingWorker(null);
        fetchWorkers();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      message.error(t('update_failed'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/workers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success(t('deleted'));
        fetchWorkers();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      message.error(t('delete_failed'));
    }
  };

  const lines = [...new Set(workers.map((w) => w.라인번호))].sort();

  const columns = [
    { title: t('employee_id'), dataIndex: '사번', key: 'employeeId', width: 120 },
    { title: t('name'), dataIndex: '이름', key: 'name', width: 150 },
    { title: t('department'), dataIndex: '부서', key: 'department', width: 100 },
    { title: t('line_number'), dataIndex: '라인번호', key: 'lineNumber', width: 100 },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: Worker) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingWorker(record);
              editForm.setFieldsValue({
                employeeId: record.사번,
                name: record.이름,
                department: record.부서,
                lineNumber: record.라인번호,
              });
            }}
          />
          <Popconfirm
            title={t('confirm_delete_worker')}
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
      key: 'list',
      label: t('worker_list'),
      children: (
        <Card
          extra={
            <Button icon={<ReloadOutlined />} onClick={fetchWorkers}>
              {t('refresh')}
            </Button>
          }
        >
          <Table
            dataSource={workers}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
    {
      key: 'register',
      label: t('new_registration'),
      children: (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ department: 'CNC' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="employeeId"
                label={t('employee_id')}
                rules={[{ required: true }]}
              >
                <Input placeholder="예: 21020147" />
              </Form.Item>
              <Form.Item
                name="name"
                label={t('name')}
                rules={[{ required: true }]}
              >
                <Input placeholder="예: DƯƠNG THỊ BỒNG" />
              </Form.Item>
              <Form.Item name="department" label={t('department')}>
                <Input placeholder="CNC" />
              </Form.Item>
              <Form.Item
                name="lineNumber"
                label={t('line_number')}
                rules={[{ required: true }]}
              >
                <Select placeholder={t('select_line')}>
                  {lines.length > 0 ? (
                    lines.map((line) => (
                      <Select.Option key={line} value={line}>
                        {line}
                      </Select.Option>
                    ))
                  ) : (
                    <>
                      <Select.Option value="B-01">B-01</Select.Option>
                      <Select.Option value="B-02">B-02</Select.Option>
                      <Select.Option value="B-03">B-03</Select.Option>
                      <Select.Option value="B-04">B-04</Select.Option>
                      <Select.Option value="B-05">B-05</Select.Option>
                      <Select.Option value="B-06">B-06</Select.Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              {t('register')}
            </Button>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('worker_management')}</h1>
      <Tabs items={tabItems} />

      {/* 수정 폼 */}
      {editingWorker && (
        <Card
          title={t('edit_worker_info')}
          extra={
            <Button onClick={() => setEditingWorker(null)}>{t('cancel')}</Button>
          }
        >
          <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="employeeId" label={t('employee_id')}>
                <Input />
              </Form.Item>
              <Form.Item name="name" label={t('name')}>
                <Input />
              </Form.Item>
              <Form.Item name="department" label={t('department')}>
                <Input />
              </Form.Item>
              <Form.Item name="lineNumber" label={t('line_number')}>
                <Select>
                  {lines.map((line) => (
                    <Select.Option key={line} value={line}>
                      {line}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit">
              {t('edit_complete')}
            </Button>
          </Form>
        </Card>
      )}
    </div>
  );
}
