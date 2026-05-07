from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import config
import os

app = Flask(
    __name__,
    static_folder="../frontend",
    static_url_path=""
)

CORS(app)

# =============================
# DATABASE CONNECTION
# =============================

def get_db_connection():
    return mysql.connector.connect(
    host=config.MYSQL_HOST,
    user=config.MYSQL_USER,
    password=config.MYSQL_PASSWORD,
    database=config.MYSQL_DB,
    port=int(config.MYSQL_PORT)
    )

# =============================
# FRONTEND ROUTES
# =============================

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

# =============================
# AUTH ROUTES
# =============================

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO users (username, password, role) VALUES (%s, %s, 'client')",
            (username, password)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Account created successfully"}), 201

    except mysql.connector.IntegrityError:
        return jsonify({"error": "Username already taken"}), 409

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, username, role FROM users WHERE username=%s AND password=%s",
            (username, password)
        )

        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            return jsonify({"user": user}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =============================
# PRODUCT ROUTES
# =============================

@app.route('/add_product', methods=['POST'])
def add_product():
    data = request.json

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = "INSERT INTO products (name, description, price, image_url) VALUES (%s, %s, %s, %s)"

        cursor.execute(query, (
            data['name'],
            data['description'],
            float(data['price']),
            data['image_url']
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Product added successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/products', methods=['GET'])
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM products")

        products = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(products)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/search', methods=['GET'])
def search_products():
    q = request.args.get('q', '')

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM products WHERE name LIKE %s OR description LIKE %s",
            ('%' + q + '%', '%' + q + '%')
        )

        products = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(products)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update_product/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.json

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE products SET name=%s, description=%s, price=%s, image_url=%s WHERE id=%s",
            (
                data['name'],
                data['description'],
                float(data['price']),
                data['image_url'],
                id
            )
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Product updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete_product/<int:id>', methods=['DELETE'])
def delete_product(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM products WHERE id=%s", (id,))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Product deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
