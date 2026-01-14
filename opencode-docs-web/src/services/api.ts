import axios from 'axios';
import type { MenuItem, DocPage } from '../types';

// 根据你的 .NET Core 启动配置调整端口，通常是 5000 或 5001
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const docsApi = {
  // 获取左侧菜单
  getMenu: async () => {
    const response = await api.get<MenuItem[]>('/docs/menu');
    return response.data;
  },

  // 获取页面详情
  getPage: async (id: string) => {
    const response = await api.get<DocPage>(`/docs/page/${id}`);
    return response.data;
  },

  // 创建新案例
  createCase: async (title: string) => {
    const response = await api.post<MenuItem>('/docs/cases', { title, type: 'file' });
    return response.data;
  },

  // 更新页面内容
  updatePage: async (id: string, page: Partial<DocPage>) => {
    const response = await api.put(`/docs/page/${id}`, page);
    return response.data;
  },

  // 删除案例
  deleteCase: async (id: string) => {
    await api.delete(`/docs/cases/${id}`);
  }
};
