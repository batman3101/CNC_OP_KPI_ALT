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
  Alert,
  InputRef,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { User } from '@/types';

export default function AdminPage() {
  const { t } = useLanguage();
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .order('이름');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      message.error(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchUsers]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (values.password !== values.confirmPassword) {
      message.error(t('password_mismatch'));
      return;
    }

    try {
      const { error } = await supabase.from('Users').insert([
        {
          이메일: (values.email as string).toLowerCase(),
          비밀번호: values.password,
          이름: values.name,
          권한: values.role,
        },
      ]);

      if (error) {
        if (error.code === '23505') {
          message.error(t('id_exists'));
        } else {
          throw error;
        }
        return;
      }

      message.success(values.role === '관리자' ? t('admin_added') : t('user_added'));
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error(t('admin_add_error'));
    }
  };

  const handleDelete = async (email: string) => {
    if (email === user?.이메일) {
      message.error(t('cannot_delete_self'));
      return;
    }

    try {
      const { error } = await supabase.from('Users').delete().eq('이메일', email);

      if (error) throw error;

      message.success(t('user_deleted'));
      fetchUsers();
    } catch (error) {
      message.error(t('user_delete_error'));
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

  const getColumnSearchProps = (dataIndex: keyof User, title: string): ColumnType<User> => ({
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

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert
          message={t('admin_required')}
          type="warning"
          showIcon
        />
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

  const adminUsers = users.filter((u) => u.권한 === '관리자');
  const normalUsers = users.filter((u) => u.권한 === '사용자');

  // 필터 옵션
  const roleFilters = [
    { text: '관리자', value: '관리자' },
    { text: '사용자', value: '사용자' },
  ];

  const columns: ColumnType<User>[] = [
    {
      title: t('email'),
      dataIndex: '이메일',
      key: 'email',
      sorter: (a, b) => (a.이메일 || '').localeCompare(b.이메일 || ''),
      ...getColumnSearchProps('이메일', t('email')),
    },
    {
      title: t('name'),
      dataIndex: '이름',
      key: 'name',
      sorter: (a, b) => (a.이름 || '').localeCompare(b.이름 || ''),
      ...getColumnSearchProps('이름', t('name')),
    },
    {
      title: t('role'),
      dataIndex: '권한',
      key: 'role',
      sorter: (a, b) => (a.권한 || '').localeCompare(b.권한 || ''),
      filters: roleFilters,
      onFilter: (value, record) => record.권한 === value,
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: User) => (
        <Popconfirm
          title={t('confirm_delete_data')}
          onConfirm={() => handleDelete(record.이메일)}
          disabled={record.이메일 === user?.이메일}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={record.이메일 === user?.이메일}
          />
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'admins',
      label: t('admin_management'),
      children: (
        <Card
          title={t('admin_list')}
          extra={
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              {t('refresh')}
            </Button>
          }
        >
          {adminUsers.length === 0 ? (
            <p className="text-center text-gray-500">{t('no_admin')}</p>
          ) : (
            <Table
              dataSource={adminUsers}
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
      key: 'users',
      label: t('user_management'),
      children: (
        <Card
          title={t('user_management')}
          extra={
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              {t('refresh')}
            </Button>
          }
        >
          {normalUsers.length === 0 ? (
            <p className="text-center text-gray-500">{t('no_users')}</p>
          ) : (
            <Table
              dataSource={normalUsers}
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
      key: 'add',
      label: t('add_user'),
      children: (
        <Card title={t('add_user')}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ role: '사용자' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="email"
                label={t('email')}
                rules={[
                  { required: true, message: t('fill_all_fields') },
                  { type: 'email', message: t('invalid_credentials') },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
              <Form.Item
                name="name"
                label={t('name')}
                rules={[{ required: true, message: t('fill_all_fields') }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label={t('password')}
                rules={[{ required: true, message: t('fill_all_fields') }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label={t('confirm_password')}
                rules={[{ required: true, message: t('fill_all_fields') }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item name="role" label={t('role')}>
                <Select>
                  <Select.Option value="관리자">관리자</Select.Option>
                  <Select.Option value="사용자">사용자</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              {t('add')}
            </Button>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('admin_user_management')}</h1>
        <Space>
          <span className="text-gray-600">
            {t('current_account')} {user?.이름} ({user?.권한})
          </span>
        </Space>
      </div>
      <Tabs items={tabItems} />
    </div>
  );
}
