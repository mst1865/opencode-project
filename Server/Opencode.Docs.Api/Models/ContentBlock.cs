using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;

namespace Opencode.Docs.Api.Models
{
    public class ContentBlock
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string PageId { get; set; } // 外键关联 DocMenuItem
        
        // "text", "image", "code"
        [Required]
        public string Type { get; set; }
        
        public string Content { get; set; }
        
        public string Language { get; set; } // 仅用于 code 类型
        
        public int OrderIndex { get; set; }
    }
}
