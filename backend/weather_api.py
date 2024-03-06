from flask import request, jsonify
from flasgger.utils import swag_from
from weather_api_service import (get_all_weather_service,
                                 get_weather_by_id_service,
                                 create_weather_service,
                                 delete_weather_service,
                                 get_weather_by_filter_service,
                                 update_weather_service)
from flask_jwt_extended import jwt_required

def init_routes(app, socketio):
    @app.route('/weather', methods=['GET'])
    @swag_from({
        'parameters': [
            {
                'in': 'header',
                'name': 'Authorization',
                'required': True,
                'description': 'Bearer token for authentication',
                'type': 'string',
                'format': 'JWT',
                'default': 'Bearer YOUR_TOKEN',
            },
        ],
        'responses': {
            200: {
                'description': 'Successful response',
                'content': {
                    'application/json': {
                        'example': [
                            {
                                'id': 1,
                                'city_name': 'Paris',
                                'latitude': 48.8566,
                                'longitude': 2.3522,
                                'temperature': 20.5,
                                'feels_like': 22.3,
                                'humidity': 60,
                                'pressure': 1015,
                                'description': 'Partly Cloudy',
                                'timestamp': '2024-03-06 12:30:00',
                            },
                        ],
                    },
                },
            },
        },
    })
    @jwt_required()
    async def get_all_weather():
        weather_data = await get_all_weather_service()
        return jsonify(weather_data)

    @app.route('/weather/city/<string:city>', methods=['GET'])
    @swag_from({
        'parameters': [
            {
                'in': 'header',
                'name': 'Authorization',
                'required': True,
                'description': 'Bearer token for authentication',
                'type': 'string',
                'format': 'JWT',
            },
            {
                'in': 'path',
                'name': 'city',
                'required': True,
                'description': 'City name for weather data',
                'type': 'string',
            },
            {
                'in': 'query',
                'name': 'start_time',
                'required': False,
                'description': 'Start time for filtering',
                'type': 'string',
                'format': 'datetime',
            },
            {
                'in': 'query',
                'name': 'end_time',
                'required': False,
                'description': 'End time for filtering',
                'type': 'string',
                'format': 'datetime',
            },
        ],
        'responses': {
            200: {
                'description': 'Successful response',
                'content': {
                    'application/json': {
                        'example': [
                            {
                                'id': 1,
                                'city_name': 'Paris',
                                'latitude': 48.8566,
                                'longitude': 2.3522,
                                'temperature': 20.5,
                                'feels_like': 22.3,
                                'humidity': 60,
                                'pressure': 1015,
                                'description': 'Partly Cloudy',
                                'timestamp': '2024-03-06 12:30:00',
                            },
                        ],
                    },
                },
            },
        },
    })
    @jwt_required()
    async def get_weather_by_city(city):
        start_time = request.args.get('start_time', None)
        end_time = request.args.get('end_time', None)
        weather_data = await get_weather_by_filter_service(city, start_time, end_time)
        return jsonify(weather_data)

    @app.route('/weather/<int:id>', methods=['GET'])
    @swag_from({
        'parameters': [
            {
                'in': 'header',
                'name': 'Authorization',
                'required': True,
                'description': 'Bearer token for authentication',
                'type': 'string',
                'format': 'JWT',
            },
            {
                'in': 'path',
                'name': 'id',
                'required': True,
                'description': 'Weather data ID',
                'type': 'integer',
            },
        ],
        'responses': {
            200: {
                'description': 'Successful response',
                'content': {
                    'application/json': {
                        'example': {
                            'id': 1,
                            'city_name': 'Paris',
                            'latitude': 48.8566,
                            'longitude': 2.3522,
                            'temperature': 20.5,
                            'feels_like': 22.3,
                            'humidity': 60,
                            'pressure': 1015,
                            'description': 'Partly Cloudy',
                            'timestamp': '2024-03-06 12:30:00',
                        },
                    },
                },
            },
        },
    })
    @jwt_required()
    async def get_weather_by_id(id):
        weather_data = await get_weather_by_id_service(id)
        return jsonify(weather_data)

    @app.route('/weather', methods=['POST'])
    @swag_from({
        'parameters': [
            {
                'in': 'header',
                'name': 'Authorization',
                'required': True,
                'description': 'Bearer token for authentication',
                'type': 'string',
                'format': 'JWT',
            },
            {
                'in': 'body',
                'name': 'weather_params',
                'required': True,
                'description': 'Weather data parameters for creation',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'city_name': {'type': 'string'},
                        'latitude': {'type': 'number'},
                        'longitude': {'type': 'number'},
                        'temperature': {'type': 'number'},
                        'feels_like': {'type': 'number'},
                        'humidity': {'type': 'integer'},
                        'pressure': {'type': 'integer'},
                        'description': {'type': 'string'},
                    },
                },
            },
        ],
        'responses': {
            200: {
                'description': 'Successful response',
                'content': {
                    'application/json': {
                        'example': {
                            'id': 1,
                            'city_name': 'Paris',
                            'latitude': 48.8566,
                            'longitude': 2.3522,
                            'temperature': 20.5,
                            'feels_like': 22.3,
                            'humidity': 60,
                            'pressure': 1015,
                            'description': 'Partly Cloudy',
                            'timestamp': '2024-03-06 12:30:00',
                        },
                    },
                },
            },
        },
    })
    @jwt_required()
    async def create_weather():
        weather_params = request.json
        print(weather_params)
        created_weather = await create_weather_service(weather_params)
        socketio.emit('send_newdata', created_weather, namespace='/data')
        return jsonify(created_weather)

    @app.route('/weather', methods=['PATCH'])
    @swag_from({
        'parameters': [
    {
        'in': 'header',
        'name': 'Authorization',
        'required': True,
        'description': 'Bearer token for authentication',
        'type': 'string',
        'format': 'JWT',
    },
    {
        'in': 'body',
        'name': 'weather_params',
        'required': True,
        'description': 'Weather data parameters for update',
        'schema': {
            'type': 'object',
            'properties': {
                'id': {'type': 'integer'},
                'city_name': {'type': 'string'},
                'latitude': {'type': 'number'},
                'longitude': {'type': 'number'},
                'temperature': {'type': 'number'},
                'feels_like': {'type': 'number'},
                'humidity': {'type': 'integer'},
                'pressure': {'type': 'integer'},
                'description': {'type': 'string'},
            },
        },
    },
    ],
    'responses': {
        200: {
            'description': 'Successful response',
            'content': {
                'application/json': {
                    'example': {
                        'id': 1,
                        'city_name': 'Paris',
                        'latitude': 48.8566,
                        'longitude': 2.3522,
                        'temperature': 20.5,
                        'feels_like': 22.3,
                        'humidity': 60,
                        'pressure': 1015,
                        'description': 'Partly Cloudy',
                        'timestamp': '2024-03-06 12:30:00',
                    },
                },
            },
        },
    },
    })
    @jwt_required()
    async def update_weather():
        weather_params = request.json
        updated_weather = await update_weather_service(weather_params)
        socketio.emit('edit_data', updated_weather, namespace='/data')
        return jsonify(updated_weather)

    @app.route('/weather/<int:id>', methods=['DELETE'])
    @swag_from({
        'parameters': [
            {
                'in': 'header',
                'name': 'Authorization',
                'required': True,
                'description': 'Bearer token for authentication',
                'type': 'string',
                'format': 'JWT',
            },
            {
                'in': 'path',
                'name': 'id',
                'required': True,
                'description': 'Weather data ID',
                'type': 'integer',
            },
        ],
        'responses': {
            200: {
                'description': 'Successful response',
                'content': {
                    'application/json': {
                        'example': {
                            'id': 1,
                            'city_name': 'Paris',
                            'latitude': 48.8566,
                            'longitude': 2.3522,
                            'temperature': 20.5,
                            'feels_like': 22.3,
                            'humidity': 60,
                            'pressure': 1015,
                            'description': 'Partly Cloudy',
                            'timestamp': '2024-03-06 12:30:00',
                        },
                    },
                },
            },
        },
    })
    @jwt_required()
    async def delete_weather(id):
        weather_data = await delete_weather_service(id)
        socketio.emit('delete_data', id, namespace='/data')
        return jsonify(weather_data)

