'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  InputRef,
} from 'antd';
import type { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
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
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const fetchWorkers = useCallback(async () => {
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
  }, [t]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

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

      const data = await response.json();

      if (response.ok) {
        message.success(t('worker') + ' ' + t('registered'));
        form.resetFields();
        fetchWorkers();
      } else {
        console.error('Worker creation failed:', data);
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Worker submit error:', error);
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

  // A-01 ~ A-70, B-01 ~ B-70 라인 생성
  const generateAllLines = () => {
    const allLines: string[] = [];
    ['A', 'B'].forEach(prefix => {
      for (let i = 1; i <= 70; i++) {
        allLines.push(`${prefix}-${i.toString().padStart(2, '0')}`);
      }
    });
    return allLines;
  };

  const allLines = generateAllLines();
  const existingLines = Array.from(new Set(workers.map((w) => w.라인번호))).sort();

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

  const getColumnSearchProps = (dataIndex: keyof Worker, title: string): ColumnType<Worker> => ({
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

  // 필터 옵션 (테이블에서는 기존 라인만 필터로 표시)
  const lineFilters = existingLines.map((line) => ({ text: line, value: line }));
  const departmentFilters = Array.from(new Set(workers.map((w) => w.부서).filter(Boolean))).map((dept) => ({
    text: dept,
    value: dept,
  }));

  const columns: ColumnType<Worker>[] = [
    {
      title: t('employee_id'),
      dataIndex: '사번',
      key: 'employeeId',
      width: 120,
      sorter: (a, b) => (a.사번 || '').localeCompare(b.사번 || ''),
      ...getColumnSearchProps('사번', t('employee_id')),
    },
    {
      title: t('name'),
      dataIndex: '이름',
      key: 'name',
      width: 150,
      sorter: (a, b) => (a.이름 || '').localeCompare(b.이름 || ''),
      ...getColumnSearchProps('이름', t('name')),
    },
    {
      title: t('department'),
      dataIndex: '부서',
      key: 'department',
      width: 100,
      sorter: (a, b) => (a.부서 || '').localeCompare(b.부서 || ''),
      filters: departmentFilters,
      onFilter: (value, record) => record.부서 === value,
    },
    {
      title: t('line_number'),
      dataIndex: '라인번호',
      key: 'lineNumber',
      width: 100,
      sorter: (a, b) => (a.라인번호 || '').localeCompare(b.라인번호 || ''),
      filters: lineFilters,
      onFilter: (value, record) => record.라인번호 === value,
    },
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
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            }}
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
                <Select
                  placeholder={t('select_line')}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {allLines.map((line) => (
                    <Select.Option key={line} value={line}>
                      {line}
                    </Select.Option>
                  ))}
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
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {allLines.map((line) => (
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
