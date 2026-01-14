import React, { useMemo, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface BlockEditorProps {
  content: string;
  isEditing: boolean;
  onUpdate: (content: string) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ 
  content, isEditing, onUpdate 
}) => {
  // 1. 创建一个 ref 来引用查看模式下的容器
  const viewContainerRef = useRef<HTMLDivElement>(null);

  // 2. 核心修复：当进入查看模式时，手动触发代码高亮
  useEffect(() => {
    if (!isEditing && viewContainerRef.current) {
      // 查找所有由 Quill 生成的代码块 (类名为 .ql-syntax)
      const codeBlocks = viewContainerRef.current.querySelectorAll('.ql-syntax');
      
      codeBlocks.forEach((block) => {
        // 确保 window.hljs 存在 (因为我们是通过 CDN index.html 引入的)
        if ((window as any).hljs) {
          // 强制 Highlight.js 对该元素进行高亮渲染
          (window as any).hljs.highlightElement(block as HTMLElement);
        }
      });
    }
  }, [content, isEditing]); // 依赖项：当内容变化或切换模式时重新执行

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
    // 编辑模式下，Quill 会自动处理，这里保持开启
    syntax: true, 
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 
    'link', 'image', 'code-block'
  ];

  if (!isEditing) {
    return (
      <div className="ql-snow">
        {/* 3. 绑定 ref 到容器 */}
        <div 
          ref={viewContainerRef}
          className="ql-editor" 
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
       <ReactQuill 
         theme="snow"
         value={content}
         onChange={onUpdate}
         modules={modules}
         formats={formats}
         className="h-[500px]" 
       />
    </div>
  );
};