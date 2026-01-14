export interface DocPage {
  id: string;
  title: string;
  content: string; // 以前是 blocks: ContentBlock[]
  lastUpdated: string;
}

export interface MenuItem {
  id: string;
  title: string;
  type: 'static' | 'folder' | 'file';
  children?: MenuItem[];
  isOpen?: boolean;
}