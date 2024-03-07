import asyncio
from datetime import datetime, timedelta
from prisma import Prisma
import requests
import schedule
import time

async def getWeatherAndSave(db, city_name, lat, lon, api_key):
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': 'metric'
    }

    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        weather_data = response.json()
        temperature = weather_data['main']['temp']
        feels_like = weather_data['main']['feels_like']
        humidity = weather_data['main']['humidity']
        pressure = weather_data['main']['pressure']
        description = weather_data['weather'][0]['description']

        await db.weatherdata.create(
            data={
                'city_name': city_name,
                'latitude': lat,
                'longitude': lon,
                'temperature': temperature,
                'feels_like': feels_like,
                'humidity': humidity,
                'pressure': pressure,
                'description': description,
                'timestamp': datetime.utcnow(),
            }
        )

async def scheduled_job(db, cities, api_key):
    for city in cities:
        await getWeatherAndSave(db, city['name'], city['lat'], city['lon'], api_key)
    print(f"Job executed at {datetime.utcnow()}")

async def importWeatherData():
    cities = [
        {'name': 'Paris', 'lat': 48.8566, 'lon': 2.3522},
        {'name': 'New York', 'lat': 40.7128, 'lon': -74.0060},
        {'name': 'Tokyo', 'lat': 35.6895, 'lon': 139.6917},
        {'name': 'Sydney', 'lat': -33.8688, 'lon': 151.2093},
        {'name': 'Cape Town', 'lat': -33.9249, 'lon': 18.4241},
    ]

    api_key = 'eaeef179453028c6512a947bb6851f2f'

    db = Prisma()

    try:
        await db.connect()
        print("Connected to the database")
        loop = asyncio.get_event_loop()
        schedule.every(1).minutes.do(lambda: loop.create_task(scheduled_job(db, cities, api_key)))
        while True:
            schedule.run_pending()
            await asyncio.sleep(1)

    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(importWeatherData())
