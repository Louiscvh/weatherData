from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

# Dummy user data for demonstration purposes
user = {
    'username': 'test',
    'password': generate_password_hash('testtest', method='sha256')
}

def init_auth_routes(app):
    @app.route('/login', methods=['POST'])
    def login():
        username = request.json.get('username', None)
        password = request.json.get('password', None)

        if username is None or password is None:
            return jsonify({'message': 'Invalid credentials'}), 401

        if username != user['username']:
            return jsonify({'message': 'Invalid credentials'}), 401

        if check_password_hash(user['password'], password):
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
