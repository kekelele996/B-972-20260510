SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'guest') DEFAULT 'user',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) NULL,
    sale_start_time DATETIME NULL,
    sale_end_time DATETIME NULL,
    image_url VARCHAR(255),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    username VARCHAR(50), 
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NULL,
    product_name VARCHAR(100) NULL,
    image_url VARCHAR(255) NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Default Admin (password: root123)
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@example.com', '$2y$10$Zyj/v7iPVTM6/APYOBjblO/BZf7h106hAeCbPFJ9bIrjtlv78V48O', 'admin', 1);

-- Default User (password: 123456)
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('testuser', 'test@example.com', '$2y$10$/Sv3FlwATv89TMSxgt0H/.4Q5xusS1COSt3Sh7jDfmh6clcxZX2HO', 'user', 1);

-- 示例商品数据
INSERT INTO products (name, description, price, image_url, stock) VALUES
('鲜肉包', '鲜美多汁的肉包', 2.50, '/images/meat_bun.png', 100),
('素菜包', '健康营养的素菜包', 2.00, '/images/veggie_bun.png', 100),
('豆沙包', '香甜可口的豆沙包', 1.50, '/images/bean_bun.png', 50);
