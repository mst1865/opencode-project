using Microsoft.EntityFrameworkCore;
using Opencode.Docs.Api.Models;

namespace Opencode.Docs.Api.Data
{
    public class DocsContext : DbContext
    {
        public DocsContext(DbContextOptions<DocsContext> options) : base(options) { }
        public DbSet<DocMenuItem> MenuItems { get; set; }
        public DbSet<ContentBlock> ContentBlocks { get; set; }
    }
}
