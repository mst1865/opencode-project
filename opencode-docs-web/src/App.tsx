import { useState, useEffect } from 'react';
import { Edit3, Save, Loader2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { BlockEditor } from './components/BlockEditor';
import type { MenuItem, DocPage } from './types';
import { docsApi } from './services/api';

function App() {
  const [activeId, setActiveId] = useState<string>('');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [currentPage, setCurrentPage] = useState<DocPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化加载菜单
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const menuData = await docsApi.getMenu();
        setMenu(menuData);
        if (menuData.length > 0 && !activeId) {
            // 默认选中第一个非文件夹节点（递归查找略，这里简单处理）
            // 实际逻辑中最好选第一个 type='file' 或 'static' 的节点
             setActiveId(menuData[0].id);
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