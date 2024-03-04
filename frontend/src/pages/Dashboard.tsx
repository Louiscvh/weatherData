import { io } from 'socket.io-client'
import {useEffect, useState} from "react";
import { AreaChart } from '@tremor/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {cn} from "@/utils.ts";
import {toast} from "sonner";
import {useLocalStorage} from "@/hooks/useLocalStorage.ts";

type WeatherData = {
    id: number
    latitude: number
    longitude: number
    city_name: string
    temperature: number
    feels_like: number
    humidity: number
    pressure: number,
    timestamp: string
}

export const Dashboard = () => {
    const [weatherData, setWeatherData] = useState<WeatherData[]>([])
    const [selectedCity, setSelectedCity] = useState<string>('Paris');
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const socket = io('http://localhost:8080/data')

    const {getItem} = useLocalStorage();

    socket.on('connect', () => {
        console.log('connected')
    })

    socket.on('latest_data', (data) => {
        const filteredData = data.filter((d: WeatherData) => d.city_name === selectedCity);
        console.log(filteredData)
        setWeatherData((prevData) => [...prevData, filteredData]);
    });
    
    useEffect(() => {
        const fetchWeatherData = async () => {
            // Construire les paramètres de l'URL en fonction des dates
            let url = `http://localhost:8080/weather/city/${selectedCity}`;

            if (startDate) {
                url += `?start_time=${startDate.toISOString()}`;
            }

            if (endDate) {
                // Utiliser '&' si start_time est présent, sinon utiliser '?'
                url += `${startDate ? '&' : '?'}end_time=${endDate.toISOString()}`;
            }

            try {
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${getItem('user')}`
                    }
                });
                const data = await response.json();
                if(response.ok) {
                    setWeatherData(data);
                } else {
                    throw new Error(data.msg);
                }

            }
            catch (error) {
                toast((error as Error).message);
            }
        };

        fetchWeatherData();
    }, [selectedCity, startDate, endDate]);


    const formatData = (data: WeatherData[]) => {
        return data?.map((d) => {
            const timestamp = new Date(d.timestamp);
            const formattedTimestamp = format(timestamp || new Date().toString(), "MMMM do yyyy, h:mm a");
            return {
                Timestamp: formattedTimestamp,
                Latitude: d.latitude,
                Longitude: d.longitude,
                Temperature: d.temperature,
                Humidity: d.humidity,
                Pressure: d.pressure,
                FeelsLike: d.feels_like,
            }
        })
    }

    const temperatureFormatter = (degreesCelsius: number) =>
        `${Intl.NumberFormat('en-US').format(degreesCelsius)}°C`;


    return (
        <div className="container mt-12">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Weather Dashboard
                </h1>
                <section className="my-8 space-y-4">
                    <h2 className="text-2xl font-bold">Filters</h2>
                    <div className="flex flex-col md:flex-row justify-between gap-2">
                        <div className="flex flex-col md:flex-row gap-2">
                            <Select
                                value={selectedCity}
                                onValueChange={(value) => setSelectedCity(value)}
                            >
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Choose a city" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Paris">Paris</SelectItem>
                                    <SelectItem value="New York">New York</SelectItem>
                                    <SelectItem value="Tokyo">Tokyo</SelectItem>
                                    <SelectItem value="Sydney">Sydney</SelectItem>
                                    <SelectItem value="Cape Town">Cape Town</SelectItem>
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full md:w-[280px] justify-start text-left font-normal",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        disabled={!startDate}
                                        variant={"outline"}
                                        className={cn(
                                            "w-full md:w-[280px] justify-start text-left font-normal",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : <span>Pick a end date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full">+</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers.
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </section>
                <section className="grid md:grid-cols-2 gap-4">
                    <AreaChart
                        key={weatherData?.length}
                        className="h-80"
                        data={formatData(weatherData)}
                        index="Timestamp"
                        categories={['Temperature', 'FeelsLike']}
                        colors={['red', 'indigo']}
                        yAxisWidth={60}
                        valueFormatter={temperatureFormatter}
                    />
                    <AreaChart
                        key={weatherData?.length + 1}
                        className="h-80"
                        data={formatData(weatherData)}
                        index="Timestamp"
                        categories={['Pressure', 'Latitude', 'Longitude']}
                        colors={['red', 'blue', 'green']}
                        yAxisWidth={60}
                    />
                </section>
        </div>
    )
}
