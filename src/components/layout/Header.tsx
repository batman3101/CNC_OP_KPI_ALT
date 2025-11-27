'use client';

import { Layout, Button, Space, Dropdown, Avatar } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const languageItems: MenuProps['items'] = [
    {
      key: 'ko',
      label: '한국어',
      onClick: () => setLanguage('ko'),
    },
    {
      key: 'vi',
      label: 'Tiếng Việt',
      onClick: () => setLanguage('vi'),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.이름 || 'User',
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="bg-white dark:bg-gray-800 px-4 flex items-center justify-between shadow-sm">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        className="text-lg"
      />

      <Space size="middle">
        {/* 테마 토글 */}
        <Button
          type="text"
          icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
          onClick={toggleTheme}
          title={theme === 'light' ? t('dark_mode') : t('light_mode')}
        />

        {/* 언어 선택 */}
        <Dropdown menu={{ items: languageItems, selectedKeys: [language] }}>
          <Button type="text" icon={<GlobalOutlined />}>
            {language === 'ko' ? '한국어' : 'Tiếng Việt'}
          </Button>
        </Dropdown>

        {/* 사용자 메뉴 */}
        <Dropdown menu={{ items: userMenuItems }}>
          <Space className="cursor-pointer">
            <Avatar icon={<UserOutlined />} className="bg-primary-500" />
            <span className="hidden md:inline">{user?.이름}</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
