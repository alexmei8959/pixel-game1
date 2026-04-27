# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製所有原始碼
COPY . .

# 執行打包
RUN npm run build

# Production stage (使用 Nginx 伺服器)
FROM nginx:alpine

# 替換 Nginx 預設設定檔 (為了處理 SPA 路由與 base path)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 將打包好的靜態檔案複製到 Nginx 的服務目錄
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
