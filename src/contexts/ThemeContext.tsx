'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ConfigProvider, theme as antdTheme, ThemeConfig } from 'antd';
import { ThemeMode } from '@/types';

// Navy Blue 브랜드 컬러 기반 MUI 스타일 테마
const brandColors = {
  light: {
    primary: '#000080',      // Navy Blue
    primaryLight: '#3333a3',
    primaryDark: '#000066',
  },
  dark: {
    primary: '#6b6bff',      // Navy Blue (밝은 버전)
    primaryLight: '#9999ff',
    primaryDark: '#4040cc',
  },
};

// MUI Dashboard 스타일 테마 설정
const getMuiThemeConfig = (mode: ThemeMode): ThemeConfig => {
  const isDark = mode === 'dark';
  const colors = isDark ? brandColors.dark : brandColors.light;

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      // Primary Colors (Navy Blue)
      colorPrimary: colors.primary,
      colorPrimaryHover: colors.primaryLight,
      colorPrimaryActive: colors.primaryDark,
      colorPrimaryBg: isDark ? 'rgba(107, 107, 255, 0.12)' : '#e8e8ff',
      colorPrimaryBgHover: isDark ? 'rgba(107, 107, 255, 0.2)' : '#d0d0ff',

      // Success Colors
      colorSuccess: isDark ? '#66bb6a' : '#2e7d32',
      colorSuccessHover: isDark ? '#81c784' : '#4caf50',
      colorSuccessActive: isDark ? '#388e3c' : '#1b5e20',
      colorSuccessBg: isDark ? 'rgba(46, 125, 50, 0.12)' : '#edf7ed',

      // Warning Colors
      colorWarning: isDark ? '#ffa726' : '#ed6c02',
      colorWarningHover: isDark ? '#ffb74d' : '#ff9800',
      colorWarningActive: isDark ? '#f57c00' : '#e65100',
      colorWarningBg: isDark ? 'rgba(237, 108, 2, 0.12)' : '#fff4e5',

      // Error Colors
      colorError: isDark ? '#f44336' : '#d32f2f',
      colorErrorHover: isDark ? '#e57373' : '#ef5350',
      colorErrorActive: isDark ? '#d32f2f' : '#c62828',
      colorErrorBg: isDark ? 'rgba(211, 47, 47, 0.12)' : '#fdeded',

      // Info Colors
      colorInfo: isDark ? '#29b6f6' : '#0288d1',
      colorInfoHover: isDark ? '#4fc3f7' : '#03a9f4',
      colorInfoActive: isDark ? '#0288d1' : '#01579b',
      colorInfoBg: isDark ? 'rgba(2, 136, 209, 0.12)' : '#e5f6fd',

      // Background Colors
      colorBgContainer: isDark ? '#1e1e1e' : '#ffffff',
      colorBgElevated: isDark ? '#242424' : '#ffffff',
      colorBgLayout: isDark ? '#121212' : '#f5f5f5',
      colorBgSpotlight: isDark ? '#2d2d2d' : '#fafafa',

      // Text Colors
      colorText: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
      colorTextSecondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      colorTextTertiary: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)',
      colorTextQuaternary: isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.26)',

      // Border & Divider
      colorBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      colorBorderSecondary: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      colorSplit: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',

      // Typography
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontSize: 14,
      fontSizeHeading1: 40,
      fontSizeHeading2: 32,
      fontSizeHeading3: 28,
      fontSizeHeading4: 24,
      fontSizeHeading5: 20,
      fontSizeSM: 12,
      fontSizeLG: 16,
      fontSizeXL: 20,

      // Border Radius (MUI style)
      borderRadius: 8,
      borderRadiusSM: 4,
      borderRadiusLG: 12,
      borderRadiusXS: 2,

      // Spacing
      marginXS: 4,
      marginSM: 8,
      marginMD: 16,
      marginLG: 24,
      marginXL: 32,
      paddingXS: 4,
      paddingSM: 8,
      paddingMD: 16,
      paddingLG: 24,
      paddingXL: 32,

      // Line Heights
      lineHeight: 1.5,
      lineHeightHeading1: 1.2,
      lineHeightHeading2: 1.3,
      lineHeightHeading3: 1.4,
      lineHeightHeading4: 1.4,
      lineHeightHeading5: 1.5,

      // Shadows
      boxShadow: isDark
        ? '0px 4px 6px -1px rgba(0, 0, 0, 0.3), 0px 2px 4px -1px rgba(0, 0, 0, 0.2)'
        : '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
      boxShadowSecondary: isDark
        ? '0px 10px 15px -3px rgba(0, 0, 0, 0.4), 0px 4px 6px -2px rgba(0, 0, 0, 0.2)'
        : '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',

      // Motion
      motionDurationFast: '200ms',
      motionDurationMid: '300ms',
      motionDurationSlow: '375ms',
      motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      motionEaseOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',

      // Control
      controlHeight: 40,
      controlHeightSM: 32,
      controlHeightLG: 48,
    },
    components: {
      Button: {
        borderRadius: 8,
        controlHeight: 40,
        controlHeightSM: 32,
        controlHeightLG: 48,
        paddingInline: 16,
        paddingInlineSM: 10,
        paddingInlineLG: 22,
        fontWeight: 500,
      },
      Card: {
        borderRadiusLG: 12,
        paddingLG: 24,
        boxShadowTertiary: isDark
          ? '0px 2px 1px -1px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.28), 0px 1px 3px 0px rgba(0,0,0,0.24)'
          : '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
      },
      Input: {
        borderRadius: 8,
        paddingBlock: 8,
        paddingInline: 14,
        activeBorderColor: colors.primary,
        hoverBorderColor: colors.primaryLight,
      },
      Select: {
        borderRadius: 8,
      },
      Table: {
        headerBg: isDark ? '#2d2d2d' : '#f5f5f5',
        rowHoverBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        rowSelectedBg: isDark ? 'rgba(107, 107, 255, 0.16)' : 'rgba(0, 0, 128, 0.08)',
        rowSelectedHoverBg: isDark ? 'rgba(107, 107, 255, 0.24)' : 'rgba(0, 0, 128, 0.12)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        cellPaddingBlock: 16,
        cellPaddingInline: 16,
      },
      Menu: {
        itemBorderRadius: 8,
        itemMarginInline: 8,
        itemPaddingInline: 16,
        subMenuItemBg: 'transparent',
        itemSelectedBg: isDark ? 'rgba(107, 107, 255, 0.16)' : 'rgba(0, 0, 128, 0.08)',
        itemSelectedColor: colors.primary,
        itemHoverBg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        darkItemBg: '#001529',
        darkSubMenuItemBg: '#000c17',
        darkItemSelectedBg: colors.primary,
      },
      Layout: {
        headerBg: isDark ? '#1e1e1e' : '#ffffff',
        headerHeight: 64,
        siderBg: isDark ? '#1e1e1e' : '#001529',
        bodyBg: isDark ? '#121212' : '#f5f5f5',
      },
      Tabs: {
        itemSelectedColor: colors.primary,
        inkBarColor: colors.primary,
        itemColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        itemHoverColor: colors.primaryLight,
      },
      Alert: {
        borderRadiusLG: 8,
      },
      Modal: {
        borderRadiusLG: 16,
        paddingContentHorizontalLG: 24,
      },
      Tooltip: {
        borderRadius: 4,
      },
      Tag: {
        borderRadiusSM: 16,
      },
      Badge: {
        textFontSize: 12,
      },
      Progress: {
        defaultColor: colors.primary,
      },
      Pagination: {
        itemActiveBg: isDark ? 'rgba(107, 107, 255, 0.16)' : 'rgba(0, 0, 128, 0.08)',
        borderRadius: 8,
      },
      Statistic: {
        titleFontSize: 14,
        contentFontSize: 24,
      },
      DatePicker: {
        borderRadius: 8,
      },
      Spin: {
        colorPrimary: colors.primary,
      },
      Switch: {
        colorPrimary: colors.primary,
        colorPrimaryHover: colors.primaryLight,
      },
      Checkbox: {
        colorPrimary: colors.primary,
        colorPrimaryHover: colors.primaryLight,
      },
      Radio: {
        colorPrimary: colors.primary,
        colorPrimaryHover: colors.primaryLight,
      },
      Slider: {
        colorPrimary: colors.primary,
        colorPrimaryBorderHover: colors.primaryLight,
      },
    },
  };
};

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    // 로컬 스토리지에서 테마 복원
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // 메모이제이션으로 테마 설정 최적화
  const antdThemeConfig = useMemo(() => getMuiThemeConfig(theme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <ConfigProvider theme={antdThemeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
