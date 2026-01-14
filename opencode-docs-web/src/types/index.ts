export interface DocPage {
  id: string;
  title: string;
  content: string; // 以前是 blocks: ContentBlock[]
  lastUpdated: string;
}

export interface MenuItem {
  id: string;
  title: string;
  type: 'folder' | 'file' | 'static';
  parentId?: string | null; // 新增
  sortOrder?: number;       // 新增
  isOpen?: boolean;
  children?: MenuItem[];
}