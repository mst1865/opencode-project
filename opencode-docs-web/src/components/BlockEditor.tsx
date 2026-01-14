import React, { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// 注意：这里不再需要 import hljs，也不需要 import 它的 css
// 因为我们在 index.html 中已经全局引入了

interface BlockEditorProps {
  content: string;
  isEditing: boolean;
  onUpdate: (content: string) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ 
  content, isEditing, onUpdate 
}) => {
  
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
    // 关键：直接开启即可。
    // 因为 index.html 里的 script 标签保证了 window.hljs 一定存在。
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
        <div className="ql-editor" dangerouslySetInnerHTML={{ __html: content }} />
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