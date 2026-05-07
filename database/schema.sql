
CREATE DATABASE IF NOT EXISTS solestore_db;
USE solestore_db;


CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('admin','client') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (username, password, role)
VALUES ('admin', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';



CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    image_url   TEXT NOT NULL
);
