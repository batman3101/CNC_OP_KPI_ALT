'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Form, Input, Button, message } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <Image
            src="/ALMUS TECH BLUE.png"
            alt="ALMUS TECH"
            width={320}
            height={40}
            className="mx-auto object-contain"
            style={{ width: 'auto', height: 'auto', maxWidth: '320px' }}
            priority
          />
        </div>

        {/* Subtitle */}
        <h1 className="text-center text-2xl font-bold text-[#1e3a8a] mb-10">
          CNC OP KPI 관리 시스템
        </h1>

        {/* Login Form */}
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
              placeholder={t('email')}
              autoComplete="email"
              className="h-12 rounded-lg border-gray-300"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('fill_all_fields') }]}
          >
            <Input.Password
              placeholder={t('password')}
              autoComplete="current-password"
              className="h-12 rounded-lg border-gray-300"
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-base font-medium"
            >
              {t('login')}
            </Button>
          </Form.Item>
        </Form>

        {/* Links */}
        <div className="text-center space-y-3">
          <div>
            <Link href="#" className="text-[#3b82f6] hover:underline">
              {t('forgot_password')}
            </Link>
          </div>
          <div className="text-gray-500 text-sm">
            {t('no_account')}
          </div>
          <div>
            <Link href="/" className="text-[#3b82f6] hover:underline">
              ← {t('back_to_main')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
