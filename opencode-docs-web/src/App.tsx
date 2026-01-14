import { useState } from 'react';
import { Edit3, Save } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { BlockEditor } from './components/BlockEditor';
import type { MenuItem, DocPage, ContentBlock, BlockType } from './types';

const INITIAL_MENU: MenuItem[] = [
  { id: 'install', title: 'Opencode 安装说明', type: 'static' },
  { id: 'usage', title: 'Opencode 使用说明', type: 'static' },
  { 
    id: 'cases', 
    title: 'Opencode 使用案例', 
    type: 'folder',
    isOpen: true,
    children: [
      { id: 'case-1', title: '电商系统集成', type: 'file' },
      { id: 'case-2', title: '金融数据处理', type: 'file' },
    ]
  }
];

const MOCK_PAGES: Record<string, DocPage> = {
  'install': {
    id: 'install',
    title: '安装说明',
    lastUpdated: '2023-10-27',
    blocks: [
      { id: 'b1', type: 'text', content: '欢迎使用 Opencode。请按照以下步骤完成环境配置。' },
      { id: 'b2', type: 'code', content: 'npm install opencode-core --save\ndotnet add package Opencode.Net', language: 'bash' },
      { id: 'b3', type: 'text', content: '安装完成后，请确保您的 PostgreSQL 数据库连接正常。' }
    ]
  },
  'usage': {
    id: 'usage',
    title: '核心功能使用',
    lastUpdated: '2023-10-28',
    blocks: [
      { id: 'b1', type: 'text', content: 'Opencode 的核心在于其高效的中间件管道。' },
      { id: 'b2', type: 'image', content: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' },
      { id: 'b3', type: 'text', content: '如上图所示，数据流经处理节点。' }
    ]
  },
  'case-1': {
    id: 'case-1',
    title: '电商系统集成案例',
    lastUpdated: '2023-11-01',
    blocks: [
      { id: 'b1', type: 'text', content: '在高并发电商场景下，Opencode 能够处理每秒 10k+ 请求。' },
      { id: 'b2', type: 'code', content: 'public void ConfigureServices(IServiceCollection services)\n{\n    services.AddOpencode(options => \n    {\n        options.UseRedisCache();\n    });\n}', language: 'csharp' }
    ]
  }
};

function App() {
  const [activeId, setActiveId] = useState<string>('install');
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [pages, setPages] = useState<Record<string, DocPage>>(MOCK_PAGES);
  const [isEditing, setIsEditing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPage = pages[activeId] || { 
    id: activeId, title: '未命名文档', blocks: [], lastUpdated: new Date().toISOString() 
  };

  // --- Actions ---

  const handleSelect = (id: string) => {
    setActiveId(id);
    setIsEditing(false);
    setMobileMenuOpen(false);
  };

  const toggleFolder = (folderId: string) => {
    setMenu(prev => prev.map(item => {
      if (item.id === folderId) {
        return { ...item, isOpen: !item.isOpen };
      }
      return item;
    }));
  };

  const addCase = () => {
    const newId = `case-${Date.now()}`;
    const newTitle = "新案例";
    
    // Update Menu
    setMenu(prev => prev.map(item => {
      if (item.id === 'cases') {
        return {
          ...item,
          isOpen: true,
          children: [...(item.children || []), { id: newId, title: newTitle, type: 'file' }]
        };
      }
      return item;
    }));

    // Create Empty Page
    setPages(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        title: newTitle,
        lastUpdated: new Date().toISOString(),
        blocks: [{ id: 'init', type: 'text', content: '在此处开始编写您的案例...' }]
      }
    }));

    setActiveId(newId);
    setIsEditing(true);
  };

  const updateBlock = (blockId: string, content: string) => {
    const updatedBlocks = currentPage.blocks.map(b => 
      b.id === blockId ? { ...b, content } : b
    );
    setPages(prev => ({
      ...prev,
      [activeId]: { ...currentPage, blocks: updatedBlocks }
    }));
  };

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: `blk-${Date.now()}`,
      type,
      content: type === 'code' ? '// 代码写在这里' : (type === 'image' ? 'https://via.placeholder.com/600x300' : ''),
      language: 'javascript'
    };
    setPages(prev => ({
      ...prev,
      [activeId]: { ...currentPage, blocks: [...currentPage.blocks, newBlock] }
    }));
  };

  const removeBlock = (blockId: string) => {
    setPages(prev => ({
      ...prev,
      [activeId]: { ...currentPage, blocks: currentPage.blocks.filter(b => b.id !== blockId) }
    }));
  };

  const updateTitle = (newTitle: string) => {
     setPages(prev => ({
      ...prev,
      [activeId]: { ...currentPage, title: newTitle }
    }));
    
    // Sync with menu title if it's a dynamic case
    if (activeId.startsWith('case-')) {
      setMenu(prev => prev.map(item => {
        if (item.id === 'cases' && item.children) {
          return {
            ...item,
            children: item.children.map(child => 
              child.id === activeId ? { ...child, title: newTitle } : child
            )
          };
        }
        return item;
      }));
    }
  };

  // --- Renderers ---
  
  // ... 其他 handleToggleFolder, handleAddCase, handleUpdateBlock 等逻辑保持不变 ...
  // 将它们传递给子组件即可

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900">
      <Sidebar 
        menu={menu}
        activeId={activeId}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
        onSelect={handleSelect}
        onToggleFolder={toggleFolder} // 需实现
        onAddCase={addCase} // 需实现
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden mt-16 lg:mt-0 w-full">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm">
           {/* Header Logic */}
           <h1 className="text-2xl font-bold">{currentPage.title}</h1>
           <button 
             onClick={() => setIsEditing(!isEditing)}
             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
           >
             {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
             {isEditing ? '保存' : '编辑'}
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <BlockEditor 
            blocks={currentPage.blocks}
            isEditing={isEditing}
            onUpdateBlock={updateBlock} // 需实现
            onAddBlock={addBlock} // 需实现
            onRemoveBlock={removeBlock} // 需实现
          />
        </div>
      </main>
    </div>
  );
}

export default App;
