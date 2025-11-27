'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SettingOutlined,
  DatabaseOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const adminMenuItems = isAdmin
    ? [
        {
          key: 'admin-group',
          icon: <SettingOutlined />,
          label: t('admin_menu'),
          children: [
            {
              key: '/admin',
              icon: <UserOutlined />,
              label: t('admin_user_management'),
            },
            {
              key: '/workers',
              icon: <TeamOutlined />,
              label: t('worker_management'),
            },
            {
              key: '/models',
              icon: <AppstoreOutlined />,
              label: t('model_management'),
            },
            {
              key: '/production',
              icon: <DatabaseOutlined />,
              label: t('production_management'),
            },
            {
              key: '/data-sync',
              icon: <DatabaseOutlined />,
              label: t('data_management'),
            },
          ],
        },
      ]
    : [];

  const reportMenuItems = [
    {
      key: 'report-group',
      icon: <FileTextOutlined />,
      label: t('report_menu'),
      children: [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: t('dashboard'),
        },
        {
          key: '/reports/daily',
          icon: <CalendarOutlined />,
          label: t('daily_report'),
        },
        {
          key: '/reports/weekly',
          icon: <CalendarOutlined />,
          label: t('weekly_report'),
        },
        {
          key: '/reports/monthly',
          icon: <CalendarOutlined />,
          label: t('monthly_report'),
        },
        {
          key: '/reports/yearly',
          icon: <CalendarOutlined />,
          label: t('yearly_report'),
        },
      ],
    },
  ];

  const menuItems = [...adminMenuItems, ...reportMenuItems];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (!key.includes('-group')) {
      router.push(key);
    }
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={320}
      className="min-h-screen"
      style={{ background: '#001529' }}
    >
      <div className="h-16 flex items-center justify-center gap-2 border-b border-gray-700 px-2">
        <Image
          src="/A symbol BLUE-02.png"
          alt="ALMUS"
          width={32}
          height={32}
          className="rounded-full"
        />
        {!collapsed && (
          <span className="text-white font-bold text-lg">CNC OP KPI</span>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={['admin-group', 'report-group']}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
}
