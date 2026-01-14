# 1. 构建 React (使用 Node 22)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# 你的项目中使用了 legacy-peer-deps
RUN npm install --legacy-peer-deps
COPY . .
# 增加内存限制防止在小内存服务器上 OOM (可选)
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# 2. 使用 Nginx 托管
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]