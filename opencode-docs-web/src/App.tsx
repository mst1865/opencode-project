import { useState, useEffect } from 'react';
import { Edit3, Save, Loader2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { BlockEditor } from './components/BlockEditor';
import type { MenuItem, DocPage } from './types';
import { docsApi } from './services/api';

// 辅助函数：将扁平列表转换为树形结构
const buildTree = (items: any[]): MenuItem[] => {
  const itemMap = new Map();
  const tree: MenuItem[] = [];

  // 1. 初始化 Map，并为每个项创建一个副本（避免修改原始数据）
  items.forEach(item => {
    // 确保每个项都有 children 数组，且 isOpen 默认为 false (或者根据需求)
    itemMap.set(item.id, { ...item, children: [], isOpen: item.type === 'folder' });
  });

  // 2. 组装树
  items.forEach(item => {
    const node = itemMap.get(item.id);
    
    if (item.parentId && itemMap.has(item.parentId)) {
      // 如果有父级，就把当前节点 push 到父级的 children 中
      const parent = itemMap.get(item.parentId);
      parent.children.push(node);
    } else {
      // 如果没有父级（parentId 为 null），或者父级找不到，则视为根节点
      tree.push(node);
    }
  });

  // 3. 对每层的 children 进行排序 (可选，按 SortOrder)
  const sortItems = (nodes: MenuItem[]) => {
    nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortItems(node.children);
      }
    });
  };
  sortItems(tree);

  return tree;
};

function App() {
  const [activeId, setActiveId] = useState<string>('');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [currentPage, setCurrentPage] = useState<DocPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化加载菜单
  // 2. 初始化加载菜单
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const flatMenuData = await docsApi.getMenu(); // 获取的是扁平数据
        
        // --- 关键修改：转换成树形结构 ---
        const treeData = buildTree(flatMenuData); 
        // -----------------------------
        
        setMenu(treeData);

        // 默认选中逻辑...
        if (treeData.length > 0 && !activeId) {
             // 这里可能需要递归查找第一个可点击的文件，暂时简单取第一个
             setActiveId(treeData[0].id);
        }
      } catch (error) {
        console.error("Failed to load menu:", error);
      }
    };
    loadMenu();
  }, []);

  // 加载页面详情
  useEffect(() => {
    if (!activeId) return;

    const loadPage = async () => {
      setIsLoading(true);
      try {
        const pageData = await docsApi.getPage(activeId);
        setCurrentPage(pageData);
      } catch (error) {
        console.error("Failed to load page:", error);
        setCurrentPage({
            id: activeId,
            title: '加载失败或页面不存在',
            content: '',
            lastUpdated: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [activeId]);

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

  // 关键修改 1: 更新本地标题状态
  const updateTitle = (newTitle: string) => {
    if (currentPage) {
        setCurrentPage({ ...currentPage, title: newTitle });
    }
  };

  // 更新内容
  const updateContent = (newContent: string) => {
    if (currentPage) {
        setCurrentPage({ ...currentPage, content: newContent });
    }
  };

  // 关键修改 2: 保存时同步更新菜单标题
  const handleSave = async () => {
    if (!currentPage) return;
    
    try {
        // 1. 发送 API 请求保存到后端
        await docsApi.updatePage(currentPage.id, {
            title: currentPage.title,
            content: currentPage.content
        });

        // 2. 更新左侧菜单的显示标题（递归查找并更新）
        setMenu(prevMenu => {
            const updateItem = (items: MenuItem[]): MenuItem[] => {
                return items.map(item => {
                    // 找到当前项，更新标题
                    if (item.id === currentPage.id) {
                        return { ...item, title: currentPage.title };
                    }
                    // 如果有子项，递归更新
                    if (item.children) {
                        return { ...item, children: updateItem(item.children) };
                    }
                    return item;
                });
            };
            return updateItem(prevMenu);
        });

        setIsEditing(false);
    } catch (error) {
        console.error("Failed to save:", error);
        alert("保存失败，请检查网络");
    }
  };

  const addCase = async () => {
    const title = "新案例 " + new Date().toLocaleTimeString();
    try {
        const newMenuItem = await docsApi.createCase(title);
        
        // 更新菜单
        setMenu(prev => prev.map(item => {
            if (item.id === 'cases') {
                return {
                    ...item,
                    isOpen: true,
                    children: [...(item.children || []), newMenuItem]
                };
            }
            return item;
        }));

        setActiveId(newMenuItem.id);
        setIsEditing(true); // 自动进入编辑模式，此时标题框可编辑
    } catch (error) {
        console.error("Create case failed:", error);
    }
  };

  // --- Render ---

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900">
      <Sidebar 
        menu={menu}
        activeId={activeId}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
        onSelect={handleSelect}
        onToggleFolder={toggleFolder}
        onAddCase={addCase}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden mt-16 lg:mt-0 w-full">
        {currentPage ? (
            <>
                <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm">
                   
                   {/* 关键修改 3: 编辑模式下显示输入框，否则显示 H1 */}
                   <div className="flex-1 mr-4">
                     {isEditing ? (
                       <input 
                         type="text" 
                         value={currentPage.title}
                         onChange={(e) => updateTitle(e.target.value)}
                         className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none bg-transparent w-full placeholder-gray-300"
                         placeholder="请输入文档标题"
                         autoFocus
                       />
                     ) : (
                       <h1 className="text-2xl font-bold truncate" title={currentPage.title}>
                         {currentPage.title}
                       </h1>
                     )}
                   </div>

                   <button 
                     onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                     className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shrink-0"
                     disabled={isLoading}
                   >
                     {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                     {isEditing ? '保存' : '编辑'}
                   </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mr-2"/> 加载中...
                    </div>
                ) : (
                    <BlockEditor 
                        content={currentPage.content}
                        isEditing={isEditing}
                        onUpdate={updateContent}
                    />
                )}
                </div>
            </>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
                请在左侧选择一个文档
            </div>
        )}
      </main>
    </div>
  );
}

export default App;