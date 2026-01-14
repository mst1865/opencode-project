export type BlockType = 'text' | 'image' | 'code';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  language?: string;
}

export interface DocPage {
  id: string;
  title: string;
  blocks: ContentBlock[];
  lastUpdated: string;
}

export interface MenuItem {
  id: string;
  title: string;
  type: 'static' | 'folder' | 'file';
  children?: MenuItem[];
  isOpen?: boolean;
}