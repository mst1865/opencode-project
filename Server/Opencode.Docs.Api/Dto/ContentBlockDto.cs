using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Opencode.Docs.Api.Dto
{
    public class ContentBlockDto
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string Content { get; set; }
        public string Language { get; set; }
    }
}
