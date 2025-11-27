'use client';

import { useState, useMemo, useRef } from 'react';
import { Input, Button, Space, InputRef } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnType, FilterConfirmProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';

// 검색 필터 props 타입
interface SearchFilterProps<T> {
  dataIndex: keyof T;
  searchText: string;
  setSearchText: (text: string) => void;
  searchedColumn: string;
  setSearchedColumn: (column: string) => void;
  placeholder?: string;
}

// 검색 필터 생성 함수
export function useTableSearch<T extends Record<string, unknown>>() {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

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

  const getColumnSearchProps = (
    dataIndex: keyof T,
    title: string,
  ): ColumnType<T> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`${title} 검색`}
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
            검색
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            초기화
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex as string);
            }}
          >
            필터
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            닫기
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      if (recordValue == null) return false;
      return recordValue
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase());
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

  return { getColumnSearchProps, searchText, searchedColumn };
}

// 정렬 함수
export function getSorter<T>(dataIndex: keyof T, type: 'string' | 'number' | 'date' = 'string') {
  return (a: T, b: T) => {
    const aVal = a[dataIndex];
    const bVal = b[dataIndex];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return -1;
    if (bVal == null) return 1;

    if (type === 'number') {
      return (aVal as number) - (bVal as number);
    }
    if (type === 'date') {
      return new Date(aVal as string).getTime() - new Date(bVal as string).getTime();
    }
    return String(aVal).localeCompare(String(bVal));
  };
}

// 필터 옵션 생성 함수
export function getUniqueFilters<T>(data: T[], dataIndex: keyof T): { text: string; value: string }[] {
  const unique = [...new Set(data.map((item) => item[dataIndex]).filter(Boolean))];
  return unique.map((value) => ({
    text: String(value),
    value: String(value),
  }));
}

// 글로벌 검색 훅
export function useGlobalSearch<T extends Record<string, unknown>>(
  data: T[],
  searchableFields: (keyof T)[],
) {
  const [globalSearchText, setGlobalSearchText] = useState('');

  const filteredData = useMemo(() => {
    if (!globalSearchText.trim()) return data;

    const searchLower = globalSearchText.toLowerCase();
    return data.filter((item) =>
      searchableFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      }),
    );
  }, [data, globalSearchText, searchableFields]);

  return { globalSearchText, setGlobalSearchText, filteredData };
}

// 글로벌 검색 입력 컴포넌트
interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function GlobalSearch({ value, onChange, placeholder = '전체 검색...' }: GlobalSearchProps) {
  return (
    <Input
      prefix={<SearchOutlined />}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 300 }}
      allowClear
    />
  );
}
