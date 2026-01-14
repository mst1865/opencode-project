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
    [Route("api/[controller]")]
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
            if (string.IsNullOrEmpty(newItem.Title))
                return BadRequest("Title is required");

            newItem.Id = Guid.NewGuid().ToString();
            newItem.Type = "file";
            newItem.ParentId = "cases";

            // ...省略排序逻辑...
            var maxOrder = await _context.MenuItems
                .Where(x => x.ParentId == "cases")
                .MaxAsync(x => (int?)x.SortOrder) ?? 0;
            newItem.SortOrder = maxOrder + 1;

            // --- 修复开始 ---

            // 步骤 A: 先添加菜单项并立即保存
            // 这样该 ID 就真实存在于数据库中了
            _context.MenuItems.Add(newItem);
            await _context.SaveChangesAsync();

            // 步骤 B: 再添加依赖该 ID 的内容块
            _context.ContentBlocks.Add(new ContentBlock
            {
                PageId = newItem.Id, // 现在数据库里肯定有这个 ID 了，不会报错
                Type = "html",
                Content = "<p>请在此处开始编写您的案例...</p>",
                OrderIndex = 0
            });

            // 步骤 C: 保存内容块
            await _context.SaveChangesAsync();

            // --- 修复结束 ---

            return CreatedAtAction(nameof(GetPage), new { id = newItem.Id }, newItem);
        }



    }
}
