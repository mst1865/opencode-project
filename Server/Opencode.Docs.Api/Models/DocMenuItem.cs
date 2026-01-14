using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;

namespace Opencode.Docs.Api.Models
{
    // 菜单项/页面元数据
    public class DocMenuItem
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(100)]
        public string Title { get; set; }
        
        // "static", "folder", "file"
        public string Type { get; set; }
        
        public string ParentId { get; set; } // 用于构建层级结构
        
        public int SortOrder { get; set; }
    }
}
