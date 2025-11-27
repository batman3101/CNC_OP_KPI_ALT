'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        message.success(t('login') + ' ' + t('complete'));
        router.push('/');
      } else {
        message.error(t('invalid_credentials'));
      }
    } catch {
      message.error(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card
        className="w-full max-w-md shadow-lg"
        title={
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary-500 mb-2">
              CNC KPI System
            </h1>
            <p className="text-gray-500 text-sm">{t('app_title')}</p>
          </div>
        }
      >
        {/* 언어 및 테마 선택 */}
        <div className="flex justify-center gap-2 mb-6">
          <Space>
            <Button
              type={language === 'ko' ? 'primary' : 'default'}
              size="small"
              onClick={() => setLanguage('ko')}
            >
              한국어
            </Button>
            <Button
              type={language === 'vi' ? 'primary' : 'default'}
              size="small"
              onClick={() => setLanguage('vi')}
            >
              Tiếng Việt
            </Button>
            <Button
              size="small"
              onClick={toggleTheme}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
          </Space>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('fill_all_fields') },
              { type: 'email', message: t('invalid_credentials') },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('email')}
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('fill_all_fields') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('password')}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-primary-500 hover:bg-primary-600"
            >
              {t('login')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
