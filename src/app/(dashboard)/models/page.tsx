'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Table,
  Popconfirm,
  message,
  Space,
  Spin,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Model } from '@/types';

export default function ModelsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<Model[]>([]);
  const [form] = Form.useForm();

  const fetchModels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Model')
        .select('*')
        .order('model');

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error:', error);
      message.error(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: values.modelName,
          process: values.process,
        }),
      });

      if (response.ok) {
        message.success(t('model_registered'));
        form.resetFields();
        fetchModels();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      message.error(t('model_register_error'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success(t('model_deleted'));
        fetchModels();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      message.error(t('model_delete_error'));
    }
  };

  const columns = [
    { title: t('model_name'), dataIndex: 'model', key: 'model' },
    { title: t('process'), dataIndex: 'process', key: 'process' },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: Model) => (
        <Popconfirm
          title={t('confirm_delete_data')}
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
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
      label: t('model_list'),
      children: (
        <Card
          extra={
            <Button icon={<ReloadOutlined />} onClick={fetchModels}>
              {t('refresh')}
            </Button>
          }
        >
          {models.length === 0 ? (
            <p className="text-center text-gray-500">{t('no_models')}</p>
          ) : (
            <Table
              dataSource={models}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      ),
    },
    {
      key: 'register',
      label: t('model_register_delete'),
      children: (
        <Card title={t('new_model_registration')}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="modelName"
                label={t('model_name')}
                rules={[{ required: true }]}
              >
                <Input placeholder="모델명을 입력하세요" />
              </Form.Item>
              <Form.Item
                name="process"
                label={t('process')}
                rules={[{ required: true }]}
              >
                <Input placeholder="공정을 입력하세요" />
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
      <h1 className="text-2xl font-bold">{t('model_management')}</h1>
      <Tabs items={tabItems} />
    </div>
  );
}
