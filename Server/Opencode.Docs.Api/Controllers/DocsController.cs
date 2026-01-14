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

    // 获取该页面的内容块。
    // 由于改用 ReactQuill，我们假设现在只存一个类型为 "html" 的大块
    var contentBlock = await _context.ContentBlocks
        .FirstOrDefaultAsync(b => b.PageId == id);

    var result = new PageDetailDto
    {
        Id = page.Id,
        Title = page.Title,
        LastUpdated = DateTime.Now,
        // 如果数据库里没有记录，返回空字符串
        Content = contentBlock?.Content ?? "" 
    };

    return Ok(result);
}

// 4. 更新页面内容
[HttpPut("page/{id}")]
public async Task<IActionResult> UpdatePage(string id, [FromBody] PageDetailDto updateDto)
{
    var page = await _context.MenuItems.FindAsync(id);
    if (page == null) return NotFound();

    page.Title = updateDto.Title;

    // 策略：删除旧的所有块，保存一个新的大块
    // 这样既兼容了旧表结构，又能存入新的 HTML 数据
    var oldBlocks = _context.ContentBlocks.Where(b => b.PageId == id);
    _context.ContentBlocks.RemoveRange(oldBlocks);

    // 添加新的 HTML 块
    _context.ContentBlocks.Add(new ContentBlock
    {
        Id = Guid.NewGuid().ToString(),
        PageId = id,
        Type = "html", // 标记为 html
        Content = updateDto.Content, // 这里包含 ReactQuill 生成的 HTML（含 Base64 图片）
        OrderIndex = 0
    });

    await _context.SaveChangesAsync();
    return Ok(new { success = true });
}

// CreateCase 也需要微调初始化逻辑
[HttpPost("cases")]
public async Task<IActionResult> CreateCase([FromBody] DocMenuItem newItem)
{
    // ... 前面的逻辑不变 ...
    
    // 创建一个默认的初始 HTML 块
    _context.ContentBlocks.Add(new ContentBlock
    {
        PageId = newItem.Id,
        Type = "html",
        Content = "<p>请在此处开始编写您的案例...</p>", // 默认 HTML
        OrderIndex = 0
    });

    await _context.SaveChangesAsync();
    return CreatedAtAction(nameof(GetPage), new { id = newItem.Id }, newItem);
}



    }
}
