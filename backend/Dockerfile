FROM php:8.2-fpm

# 安装依赖
RUN apt-get update && apt-get install -y \
  nginx \
  libpng-dev \
  libjpeg-dev \
  libfreetype6-dev \
  zip \
  unzip \
  git \
  curl \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install gd pdo pdo_mysql \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# 安装Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 配置Nginx
COPY nginx.conf /etc/nginx/sites-available/default

# 设置工作目录
WORKDIR /var/www/html

# 复制项目文件
COPY . .

# 设置权限
RUN chown -R www-data:www-data /var/www/html

# 入口脚本（启动时执行 composer install）
# 注意：docker-compose 会挂载本地代码到 /var/www/html，可能覆盖可执行位，因此使用 sh 直接执行。
ENTRYPOINT ["sh", "/var/www/html/entrypoint.sh"]
