# 1. 构建阶段
FROM mcr.microsoft.com/dotnet/sdk:3.1 AS build
WORKDIR /src

# 复制 csproj 并还原依赖
COPY ["Opencode.Docs.Api.csproj", "./"]
RUN dotnet restore "Opencode.Docs.Api.csproj"

# 复制其余源码并构建
COPY . .
RUN dotnet publish "Opencode.Docs.Api.csproj" -c Release -o /app/publish

# 2. 运行阶段
FROM mcr.microsoft.com/dotnet/aspnet:3.1
WORKDIR /app
COPY --from=build /app/publish .

# 暴露端口
EXPOSE 80

# 启动命令
ENTRYPOINT ["dotnet", "Opencode.Docs.Api.dll"]