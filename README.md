# WeatherData - Real-time Weather Data Visualization Project

## Introduction

Welcome to the real-time weather data visualization project! This application provides an immersive user experience to visualize weather data that is updated every 5 minutes. The main goal is to showcase the effective use of real-time technologies with a large volume of data.

## Technologies Used

### Frontend

-   **React:** JavaScript library for building the user interface.
-   **TypeScript (TS):** Programming language for frontend development with static typing.
-   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
-   **Shadcn:** UI component library.
-   **Zod:** TypeScript schema validation library to ensure data reliability.

### Backend

-   **Flask:** Lightweight web framework for backend development in Python.
-   **WebSockets:** Bidirectional communication protocol for real-time data updates.
-   **JWT (JSON Web Token):** Secure authentication method for users.
-   **Swagger:** Documentation tool to specify and describe REST APIs.

### Database

-   **SQLite:** Integrated relational database management system.

## Getting Started

### User credentials

-   Username: `test`
-  Password: `testtest`

### Frontend

1.  Navigate to the `frontend` folder.
2.  Run `pnpm install` to install dependencies.
3.  Launch the application with `pnpm run dev`.

### Backend

1.  Navigate to the `backend` folder.
2.  Run `python weather.py` to start the backend server.
3.  Run `python importWeatherData.py` to import weather data into the database each 5 minutes.


## Project Highlights

1.  **Clarity and Design:** The user interface provides an intuitive visual experience for real-time weather data visualization.
2.  **Robustness with Large Data Sets:** The system's robustness is demonstrated by its ability to handle large volumes of data while maintaining optimal performance.

## Areas for Improvement

1.  **Integration of a Backend Queue:** To handle data in case of platform influence and ensure better resilience.
2.  **Deployment in Microservices:** Segment the system into microservices for more effective scalability and maintenance.