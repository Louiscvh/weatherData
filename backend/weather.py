from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from prisma import Prisma, Client
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from weather_api import init_routes
from weather_auth import init_auth_routes
from weather_api_service import weather_data_to_dict
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from importWeatherData import importWeatherData
from flask_cors import CORS
from dotenv import load_dotenv
import asyncio
import os


def create_app():
    app = Flask(__name__)
    app.config["DEBUG"] = True
    app.config['SECRET_KEY'] = 'secret'
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')  # Change this to a secure secret key
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
    app.config['SWAGGER'] = {
        'title': 'Weather API',
        'uiversion': 3,
        'openapi': '3.0.2',
        'description': 'API for weather data management',
        'termsOfService': 'https://example.com/terms',
        'contact': {
            'name': 'Your Name',
            'url': 'https://example.com/contact',
            'email': 'your.email@example.com',
        },
        'license': {
            'name': 'Your License',
            'url': 'https://example.com/license',
        },
    }
    return app

prisma = Client()
app = create_app()
load_dotenv()
cors = CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

init_routes(app, socketio)
init_auth_routes(app)
jwt = JWTManager(app)
swagger = Swagger(app)

async def get_latest_data_from_db():
    try:
        await prisma.connect()

        current_datetime = datetime.utcnow()

        five_minutes_ago = current_datetime - timedelta(minutes=1)
        latest_data = await prisma.weatherdata.find_many(
            where={
                'timestamp': {
                    'gte': five_minutes_ago,
                    'lte': current_datetime
                }
            }
        )

        serialized_data = [weather_data_to_dict(data) for data in latest_data]
        return serialized_data

    except Exception as e:
        print(f"Error retrieving latest data from database: {e}")
        return None

    finally:
        await prisma.disconnect()

async def emit_latest_data_to_clients():
    try:
        latest_data = await get_latest_data_from_db()
        if latest_data is not None:
            print("Emitting latest data to clients")
            socketio.emit('latest_data', latest_data, namespace='/data')
    except Exception as e:
        print(f"Error emitting latest data to clients: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        lambda: asyncio.run(emit_latest_data_to_clients()),
        trigger='interval',
        minutes=1
    )
    scheduler.start()


@socketio.on('connect', namespace='/data')
def handle_connect():
    print("Client connected")

@socketio.on('disconnect', namespace='/data')
def handle_disconnect():
    print("Client disconnected")

if __name__ == '__main__':
    start_scheduler()
    socketio.run(app, port=8080, debug=True)