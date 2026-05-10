#!/usr/bin/env sh
set -e

cd /var/www/html

# 首次启动：安装依赖到匿名卷 /var/www/html/vendor
if [ ! -f "vendor/autoload.php" ]; then
  echo "[bunshop-backend] vendor 缺失，执行 composer install..."
  composer install --no-dev --optimize-autoloader
fi

echo "[bunshop-backend] 启动 nginx + php-fpm"
nginx
exec php-fpm

