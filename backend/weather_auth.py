from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

# Dummy user data for demonstration purposes
users = {
    'user1': {
        'username': 'user1',
        'password': generate_password_hash('password1')
    },
    'user2': {
        'username': 'user2',
        'password': generate_password_hash('password2')
    }
}

def init_auth_routes(app):
    @app.route('/signup', methods=['POST'])
    def signup():
        data = request.json
        username = data.get('username', None)
        password = data.get('password', None)

        if username in users:
            return jsonify({'message': 'Username already taken'}), 400

        # Hash the password before storing it
        hashed_password = generate_password_hash(password, method='sha256')

        # Add the new user to the users dictionary with hashed password
        users[username] = {'username': username, 'password': hashed_password}

        # Create a JWT token for the new user
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 201

    @app.route('/login', methods=['POST'])
    def login():
        username = request.json.get('username', None)
        password = request.json.get('password', None)

        if username not in users:
            return jsonify({'message': 'Invalid credentials'}), 401

        user = users[username]

        # Check the hashed password
        if check_password_hash(user['password'], password):
            # Create a JWT token
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401

    # Protected route that requires a valid JWT token
    @app.route('/protected', methods=['GET'])
    @jwt_required()
    def protected():
        current_user = get_jwt_identity()
        return jsonify(logged_in_as=current_user), 200
