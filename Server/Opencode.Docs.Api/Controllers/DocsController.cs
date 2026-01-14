using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Opencode.Docs.Api.Data;
using Opencode.Docs.Api.Dto;
using Opencode.Docs.Api.Models;

namespace Opencode.Docs.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DocsController : ControllerBase
    {
        private readonly DocsContext _context;

        public DocsController(DocsContext context)
        {
            _context = context;
        }

        // 1. 获取左侧菜单结构
        [HttpGet("menu")]
        public async Task<IActionResult> GetMenu()
        {
            var items = await _context.MenuItems
                .OrderBy(x => x.SortOrder)
                .ToListAsync();

            // 在真实场景中，这里需要将扁平列表转换为树形结构
            // 为了演示，直接返回列表，前端处理树形转换或此处递归处理
            return Ok(items);
        }

        // 2. 获取具体页面内容
        [HttpGet("page/{id}")]
        public async Task<IActionResult> GetPage(string id)
        {
            var page = await _context.MenuItems.FindAsync(id);
            if (page == null) return NotFound("Page not found");

            var blocks = await _context.ContentBlocks
                .Where(b => b.PageId == id)
                .OrderBy(b => b.OrderIndex)
                .ToListAsync();

            var result = new PageDetailDto
            {
                Id = page.Id,
                Title = page.Title,
                LastUpdated = DateTime.Now, // 实际应从数据库获取更新时间
                Blocks = blocks.Select(b => new ContentBlockDto 
                {
                    Id = b.Id,
                    Type = b.Type,
                    Content = b.Content,
                    Language = b.Language
                }).ToList()
            };

            return Ok(result);
        }

        // 3. 创建新案例 (二级目录)
        [HttpPost("cases")]
        public async Task<IActionResult> CreateCase([FromBody] DocMenuItem newItem)
        {
            if (string.IsNullOrEmpty(newItem.Title))
                return BadRequest("Title is required");

            newItem.Id = Guid.NewGuid().ToString();
            newItem.Type = "file";
            newItem.ParentId = "cases"; // 硬编码父ID，实际应动态传入
            
            // 简单设置排序
            var maxOrder = await _context.MenuItems
                .Where(x => x.ParentId == "cases")
                .MaxAsync(x => (int?)x.SortOrder) ?? 0;
            newItem.SortOrder = maxOrder + 1;

            _context.MenuItems.Add(newItem);
            
            // 创建一个默认的初始块
            _context.ContentBlocks.Add(new ContentBlock
            {
                PageId = newItem.Id,
                Type = "text",
                Content = "请在此处开始编写您的案例...",
                OrderIndex = 0
            });

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPage), new { id = newItem.Id }, newItem);
        }

        // 4. 更新页面内容
        [HttpPut("page/{id}")]
        public async Task<IActionResult> UpdatePage(string id, [FromBody] PageDetailDto updateDto)
        {
            var page = await _context.MenuItems.FindAsync(id);
            if (page == null) return NotFound();

            // 更新标题
            page.Title = updateDto.Title;

            // 更新块逻辑：简单起见，这里采用先删后加的策略 (Full Replace)
            // 生产环境建议使用 Diff 更新或更细粒度的 API
            var oldBlocks = _context.ContentBlocks.Where(b => b.PageId == id);
            _context.ContentBlocks.RemoveRange(oldBlocks);

            if (updateDto.Blocks != null)
            {
                for (int i = 0; i < updateDto.Blocks.Count; i++)
                {
                    var dto = updateDto.Blocks[i];
                    _context.ContentBlocks.Add(new ContentBlock
                    {
                        Id = Guid.NewGuid().ToString(), // 重新生成ID或沿用前端ID
                        PageId = id,
                        Type = dto.Type,
                        Content = dto.Content,
                        Language = dto.Language,
                        OrderIndex = i
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
        
        // 5. 删除案例
        [HttpDelete("cases/{id}")]
        public async Task<IActionResult> DeleteCase(string id)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return NotFound();
            
            // 保护机制：不允许删除根节点
            if (item.Type == "folder" || item.Id == "install" || item.Id == "usage")
                return BadRequest("Cannot delete system items");

            _context.MenuItems.Remove(item);
            // 级联删除块 (EF Core 如配置了级联删除可自动处理)
            var blocks = _context.ContentBlocks.Where(b => b.PageId == id);
            _context.ContentBlocks.RemoveRange(blocks);

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
