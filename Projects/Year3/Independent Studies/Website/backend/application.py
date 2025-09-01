import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import pymysql

# Initialize Flask application
application = Flask(__name__)
CORS(application)  # Enable CORS for all routes

# ---- Aiven MySQL settings (hard-coded) ----
# CA cert is stored in the same folder as this file
CA_PATH = os.path.join(os.path.dirname(__file__), "ca.pem")

# MySQL database connection configuration
db_config = {
    "host": "maternitydb-dissertation.d.aivencloud.com",
    "port": 23067,
    "user": #REDACTED FOR SECURITY,
    "password": #REDACTED FOR SECURITY,
    "database": "maternity"  # or "defaultdb" if that's where you imported the dump
}

# Main Query Route
@application.route('/api/query', methods=['POST', 'OPTIONS'])
def run_query():
    if request.method == 'OPTIONS':
        # Handle preflight CORS request
        return 'OK', 200  # Return 200 OK response for OPTIONS method

    try:
        # Get the query from the request body
        data = request.json or {}
        query = (data.get('query') or "").strip()

        # Only allow SELECT queries for security purposes
        if not query.upper().startswith('SELECT'):
            return jsonify({"error": "Only SELECT queries are allowed"}), 400  # Return error for non-SELECT queries

        # Connect to the database (PyMySQL) with SSL
        conn = pymysql.connect(**db_config, ssl={"ca": CA_PATH})
        cursor = conn.cursor()

        # Execute the query
        cursor.execute(query)
        results = cursor.fetchall()

        # Get column names from the query result
        column_names = [desc[0] for desc in cursor.description]

        # Format results as a list of dictionaries
        formatted_results = [dict(zip(column_names, row)) for row in results]

        # Clean up and close the connection
        cursor.close()
        conn.close()

        # Return results as JSON
        return jsonify({"results": formatted_results})

    except Exception as e:
        # Handle and return errors
        return jsonify({"error": str(e)}), 500


# Health check route to verify the service is running
@application.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200


# Mother Route to fetch all data from the 'mother' table
@application.route('/api/motherv5', methods=['GET'])
def get_mother_data():
    """Fetch all data from the 'mother' table."""
    connection = None
    cursor = None
    try:
        # Connect to the database (mysql-connector) with SSL
        connection = mysql.connector.connect(
            **db_config,
            ssl_ca=CA_PATH,
            ssl_disabled=False
        )
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM motherv5")  # Query to fetch all rows from 'motherv5' table
        results = cursor.fetchall()
        return jsonify(results)  # Return results as JSON
    except mysql.connector.Error as err:
        # Handle database errors
        return jsonify({"error": str(err)}), 500
    finally:
        # Ensure the connection is closed
        try:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
        except Exception:
            pass


# Baby Route to fetch all data from the 'baby' table
@application.route('/api/baby', methods=['GET'])
def get_baby_data():
    """Fetch all data from the 'baby' table."""
    connection = None
    cursor = None
    try:
        # Connect to the database (mysql-connector) with SSL
        connection = mysql.connector.connect(
            **db_config,
            ssl_ca=CA_PATH,
            ssl_disabled=False
        )
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM babyv5")  # Query to fetch all rows from 'babyv5' table
        results = cursor.fetchall()
        return jsonify(results)  # Return results as JSON
    except mysql.connector.Error as err:
        # Handle database errors
        return jsonify({"error": str(err)}), 500
    finally:
        # Ensure the connection is closed
        try:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()
        except Exception:
            pass


# Run the application in debug mode
if __name__ == '__main__':
    application.run(debug=True)
