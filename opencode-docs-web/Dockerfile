# 1. 构建 React
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
# 你的项目中使用了 legacy-peer-deps，这里保持一致
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# 2. 使用 Nginx 托管
FROM nginx:alpine
# 复制构建产物到 Nginx 目录
COPY --from=build /app/dist /usr/share/nginx/html
# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]