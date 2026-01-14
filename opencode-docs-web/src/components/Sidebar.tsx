import React from 'react';
import { ChevronRight, ChevronDown, Settings, BookOpen, Monitor, Plus, X, Menu as MenuIcon } from 'lucide-react';
import type { MenuItem } from '../types';

interface SidebarProps {
  menu: MenuItem[];
  activeId: string;
  mobileMenuOpen: boolean;
  onToggleMobile: () => void;
  onSelect: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onAddCase: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  menu, activeId, mobileMenuOpen, onToggleMobile, onSelect, onToggleFolder, onAddCase 
}) => {
  
  const renderMenu = (items: MenuItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id} className="select-none">
        <div 
          className={`
            flex items-center px-4 py-3 cursor-pointer transition-colors duration-150
            ${item.id === activeId ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}
            ${level > 0 ? 'pl-8' : ''}
          `}
          onClick={() => item.type === 'folder' ? onToggleFolder(item.id) : onSelect(item.id)}
        >
          {item.type === 'folder' && (
            <span className="mr-2 text-gray-400">
              {item.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          {item.type !== 'folder' && (
            <span className="mr-2 text-gray-400">
              {item.id === 'install' ? <Settings size={16} /> : item.id === 'usage' ? <BookOpen size={16} /> : <Monitor size={16} />}
            </span>
          )}
          <span className="font-medium text-sm">{item.title}</span>
          
          {item.id === 'cases' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onAddCase(); }}
              className="ml-auto p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-blue-600"
              title="添加新案例"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
        {item.type === 'folder' && item.isOpen && item.children && (
          <div className="bg-gray-50/50">
            {renderMenu(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-20 flex items-center justify-between px-4 h-16">
        <span className="font-bold text-xl text-blue-900 tracking-tight">Opencode Docs</span>
        <button onClick={onToggleMobile} className="p-2">
          {mobileMenuOpen ? <X /> : <MenuIcon />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-10 w-72 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 hidden lg:flex">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">O</div>
          <span className="font-bold text-xl text-gray-800 tracking-tight">Opencode</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Documentation</div>
          {renderMenu(menu)}
        </div>
      </aside>
    </>
  );
};
