from flask import request, jsonify
from weather_api_service import get_all_weather_service, get_weather_by_id_service, create_weather_service, delete_weather_service, get_weather_by_filter_service
from flask_jwt_extended import jwt_required

def init_routes(app):
    @app.route('/weather', methods=['GET'])
    @jwt_required()
    async def get_all_weather():
        weather_data = await get_all_weather_service()
        return jsonify(weather_data)

    @app.route('/weather/city/<string:city>', methods=['GET'])
    @jwt_required()
    async def get_weather_by_city(city):
        start_time = request.args.get('start_time', None)
        end_time = request.args.get('end_time', None)
        weather_data = await get_weather_by_filter_service(city, start_time, end_time)
        return jsonify(weather_data)

    @app.route('/weather/<int:id>', methods=['GET'])
    @jwt_required()
    async def get_weather_by_id(id):
        weather_data = await get_weather_by_id_service(id)
        return jsonify(weather_data)

    @app.route('/weather', methods=['POST'])
    @jwt_required()
    async def create_weather():
        weather_params = request.json
        created_weather = await create_weather_service(weather_params)
        return jsonify(created_weather)

    @app.route('/weather/<int:id>', methods=['DELETE'])
    @jwt_required()
    async def delete_weather(id):
        weather_data = await delete_weather_service(id)
        return jsonify(weather_data)

