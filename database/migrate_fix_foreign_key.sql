-- 修复 order_items 表的外键约束，添加 ON DELETE CASCADE
-- 用于更新现有数据库

-- 删除旧的外键约束
ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_2;

-- 重新添加外键约束，包含 ON DELETE CASCADE
ALTER TABLE order_items 
ADD CONSTRAINT order_items_ibfk_2 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
