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
        public List<ContentBlockDto> Blocks { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
