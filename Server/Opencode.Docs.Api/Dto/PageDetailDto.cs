using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Opencode.Docs.Api.Dto
{
    public class PageDetailDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public DateTime LastUpdated { get; set; }
        // 移除 public List<ContentBlockDto> Blocks { get; set; }
        // 新增：
        public string Content { get; set; }
    }
}
