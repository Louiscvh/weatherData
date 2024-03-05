from prisma import Prisma, Client
from datetime import datetime, timezone

prisma = Client()

def weather_data_to_dict(weather_data):
    return {
        "id": weather_data.id,
        "city_name": weather_data.city_name,
        "latitude": weather_data.latitude,
        "longitude": weather_data.longitude,
        "temperature": weather_data.temperature,
        "feels_like": weather_data.feels_like,
        "humidity": weather_data.humidity,
        "pressure": weather_data.pressure,
        "description": weather_data.description,
        "timestamp": weather_data.timestamp.strftime("%Y-%m-%d %H:%M:%S"),  # Convert datetime to string
    }

async def get_all_weather_service():
    try:
        await prisma.connect()
        weather_data = await prisma.weatherdata.find_many()
        formatted_data = [weather_data_to_dict(data) for data in weather_data]
        return formatted_data
    except Exception as e:
        print(f"Error retrieving weather data: {e}")
        return None
    finally:
        await prisma.disconnect()

from datetime import datetime, timedelta

async def get_weather_by_filter_service(city, start_time=None, end_time=None):
    try:
        await prisma.connect()

        where_conditions = {'city_name': city}

        if start_time is not None:
            start_datetime = datetime.fromisoformat(start_time).replace(hour=0, minute=0, second=0, microsecond=0)
            where_conditions['timestamp'] = {'gte': start_datetime}

        if end_time is not None:
            end_datetime = datetime.fromisoformat(end_time).replace(hour=23, minute=59, second=59, microsecond=999999)

            if start_time is not None:
                where_conditions.setdefault('timestamp', {})['lte'] = end_datetime
            else:
                where_conditions['timestamp'] = {'lte': datetime.now(timezone.utc).replace(hour=23, minute=59, second=59, microsecond=999999)}

        weather_data_list = await prisma.weatherdata.find_many(where=where_conditions)
        formatted_data_list = [weather_data_to_dict(data) for data in weather_data_list]
        return formatted_data_list
    except Exception as e:
        print(f"Error retrieving weather data: {e}")
        return None
    finally:
        await prisma.disconnect()


async def get_weather_by_id_service(id):
    try:
        await prisma.connect()
        weather_data = await prisma.weatherdata.find_first(where={'id': id})
        formatted_data = weather_data_to_dict(weather_data)
        return formatted_data
    except Exception as e:
        print(f"Error retrieving weather data: {e}")
        return None
    finally:
        await prisma.disconnect()

async def create_weather_service(weather_params):
    try:
        await prisma.connect()
        print(weather_params)

        created_weather = await prisma.weatherdata.create(
            data={
                'city_name': weather_params['city_name'],
                'latitude': weather_params['latitude'],
                'longitude': weather_params['longitude'],
                'temperature': float(weather_params['temperature']),
                'feels_like': float(weather_params['feels_like']),
                'humidity': float(weather_params['humidity']),
                'pressure': float(weather_params['pressure']),
                'description': weather_params['description'],
            }
        )

        return weather_data_to_dict(created_weather)

    except Exception as e:
        print(f"Error creating weather data: {e}")
        return None

    finally:
        await prisma.disconnect()

async def update_weather_service(weather_params):
    try:
        await prisma.connect()
        updated_weather = await prisma.weatherdata.update(
            where={'id': weather_params['id']},
            data={
                'city_name': weather_params['city_name'],
                'latitude': weather_params['latitude'],
                'longitude': weather_params['longitude'],
                'temperature': float(weather_params['temperature']),
                'feels_like': float(weather_params['feels_like']),
                'humidity': float(weather_params['humidity']),
                'pressure': float(weather_params['pressure']),
                'description': weather_params['description'],
            }
        )
        return weather_data_to_dict(updated_weather)
    except Exception as e:
        print(f"Error updating weather data: {e}")
        return None
    finally:
        await prisma.disconnect()

async def delete_weather_service(id):
    try:
        await prisma.connect()
        deleted_weather = await prisma.weatherdata.delete(where={'id': id})
        return weather_data_to_dict(deleted_weather)
    except Exception as e:
        print(f"Error deleting weather data: {e}")
        return None
    finally:
        await prisma.disconnect()
