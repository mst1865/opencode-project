import React from 'react';
import { Trash2, Type, Code, Image as ImageIcon } from 'lucide-react';
import type { ContentBlock, BlockType } from '../types';

interface BlockEditorProps {
  blocks: ContentBlock[];
  isEditing: boolean;
  onUpdateBlock: (id: string, content: string) => void;
  onAddBlock: (type: BlockType) => void;
  onRemoveBlock: (id: string) => void;
}

const Button = ({ children, onClick, variant = 'secondary', icon: Icon }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center justify-center px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm
      ${variant === 'secondary' ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' : ''}`}
  >
    {Icon && <Icon className="w-4 h-4 mr-2" />}
    {children}
  </button>
);

export const BlockEditor: React.FC<BlockEditorProps> = ({ 
  blocks, isEditing, onUpdateBlock, onAddBlock, onRemoveBlock 
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-8">
      {blocks.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          本文档暂无内容，点击上方“编辑文档”开始编写。
        </div>
      )}

      {blocks.map((block) => (
        <div key={block.id} className="group relative mb-6">
          {isEditing && (
            <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onRemoveBlock(block.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded bg-white shadow border border-gray-200">
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {block.type === 'text' && (
            isEditing ? (
              <textarea 
                value={block.content}
                onChange={(e) => onUpdateBlock(block.id, e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none resize-none text-gray-700"
                rows={3}
              />
            ) : (
              <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{block.content}</div>
            )
          )}

          {block.type === 'code' && (
            <div className="relative">
              {isEditing ? (
                <textarea 
                  value={block.content}
                  onChange={(e) => onUpdateBlock(block.id, e.target.value)}
                  className="w-full p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg outline-none resize-none"
                  rows={5}
                />
              ) : (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  <code>{block.content}</code>
                </pre>
              )}
            </div>
          )}

          {block.type === 'image' && (
             <div className="flex flex-col items-center">
                {isEditing ? (
                  <input type="text" value={block.content} onChange={(e) => onUpdateBlock(block.id, e.target.value)} className="w-full p-2 border rounded" placeholder="Image URL"/>
                ) : (
                  <img src={block.content} alt="Content" className="rounded-lg shadow-md max-w-full h-auto" />
                )}
             </div>
          )}
        </div>
      ))}

      {isEditing && (
        <div className="mt-8 pt-8 border-t border-dashed border-gray-200">
          <p className="text-xs text-gray-400 font-semibold uppercase mb-3 tracking-wider text-center">添加内容块</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => onAddBlock('text')} icon={Type}>文本</Button>
            <Button onClick={() => onAddBlock('code')} icon={Code}>代码</Button>
            <Button onClick={() => onAddBlock('image')} icon={ImageIcon}>图片</Button>
          </div>
        </div>
      )}
    </div>
  );
};