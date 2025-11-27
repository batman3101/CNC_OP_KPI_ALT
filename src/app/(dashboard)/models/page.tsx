'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  InputRef,
} from 'antd';
import type { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';
import { PlusOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Model } from '@/types';

export default function ModelsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<Model[]>([]);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const fetchModels = useCallback(async () => {
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
  }, [t]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

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

  const getColumnSearchProps = (dataIndex: keyof Model, title: string): ColumnType<Model> => ({
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
  const processFilters = Array.from(new Set(models.map((m) => m.process).filter(Boolean))).map((proc) => ({
    text: proc,
    value: proc,
  }));

  const columns: ColumnType<Model>[] = [
    {
      title: t('model_name'),
      dataIndex: 'model',
      key: 'model',
      sorter: (a, b) => (a.model || '').localeCompare(b.model || ''),
      ...getColumnSearchProps('model', t('model_name')),
    },
    {
      title: t('process'),
      dataIndex: 'process',
      key: 'process',
      sorter: (a, b) => (a.process || '').localeCompare(b.process || ''),
      filters: processFilters,
      onFilter: (value, record) => record.process === value,
    },
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
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
              }}
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
                <Input placeholder={t('enter_model_name')} />
              </Form.Item>
              <Form.Item
                name="process"
                label={t('process')}
                rules={[{ required: true }]}
              >
                <Input placeholder={t('enter_process')} />
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
