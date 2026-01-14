using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore; // 必须引入
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Opencode.Docs.Api.Data; // 引入你的 Data 命名空间

namespace Opencode.Docs.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // 1. 配置 CORS (允许前端跨域访问)
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    // 假设你的前端运行在 http://localhost:5173，如果端口不同请修改
                    policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            // 2. 注册数据库上下文 (连接 PostgreSQL)
            services.AddDbContext<DocsContext>(options =>
                options
                .UseNpgsql(Configuration.GetConnectionString("DefaultConnection"))
                .UseSnakeCaseNamingConvention());

            services.AddControllers();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            // app.UseHttpsRedirection(); // 开发环境可以先注释掉，避免证书问题

            app.UseRouting();

            // 3. 启用 CORS (必须在 UseRouting 之后，UseAuthorization 之前)
            app.UseCors("AllowFrontend");

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}