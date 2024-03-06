import { io } from 'socket.io-client'
import {useEffect, useState} from "react";
import { AreaChart, EventProps } from '@tremor/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
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
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/context/AuthContext.tsx";
import {AddNewWeather} from "@/components/AddNewWeather.tsx";
import {cities} from "@/data/cities.data.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";

type WeatherData = {
    id: number
    latitude: number
    longitude: number
    city_name: string
    temperature: number
    feels_like: number
    humidity: number
    pressure: number
    description: string
    timestamp: string
}

const formSchema = z.object({
    city_name: z.string(),
    temperature: z.string(),
    feels_like: z.string(),
    humidity: z.string(),
    pressure: z.string(),
    description: z.string(),
})

export const Dashboard = () => {
    const [weatherData, setWeatherData] = useState<WeatherData[]>([])
    const [selectedCity, setSelectedCity] = useState<string>('Paris');
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const socket = io('http://localhost:8080/data')
    const navigate = useNavigate();
    const {logout} = useAuth();
    const {getItem} = useLocalStorage();

    const [sheetIsOpen, setSheetIsOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<EventProps | null>(null);

    socket.on('connect', () => {
        console.log('connected')
    })

    socket.on('latest_data', (data) => {
        //const filteredData = data.filter((d: WeatherData) => d.city_name === selectedCity);
        console.log(data)
        //setWeatherData((prevData) => [...prevData, filteredData]);
    });

    socket.on('send_newdata', (data) => {
        setWeatherData((prevData) => [...prevData, data]);
    })

    socket.on('edit_data', (updatedData) => {
        setWeatherData((prevData) => {
            const newData = prevData.map((data) => {
                if (data.id === updatedData.id) {
                    return updatedData;
                }
                return data;
            });
            return newData;
        });
    });

    socket.on('delete_data', (id) => {
        setWeatherData((prevData) => {
            const newData = prevData.filter((data) => data.id !== id);
            return newData;
        });
    });

    useEffect(() => {
        const fetchWeatherData = async () => {
            let url = `http://localhost:8080/weather/city/${selectedCity}`;

            if (startDate) {
                url += `?start_time=${startDate.toISOString()}`;
            }

            if (endDate) {
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
                    if(response.status === 401) {
                        navigate('/');
                        logout();
                    } else {
                        throw new Error(data.msg);
                    }
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
                Id: d.id,
                Timestamp: formattedTimestamp,
                Latitude: d.latitude,
                Longitude: d.longitude,
                Temperature: d.temperature,
                Humidity: d.humidity,
                Pressure: d.pressure,
                FeelsLike: d.feels_like,
                Description: d.description,
            }
        })
    }

    const temperatureFormatter = (degreesCelsius: number) =>
        `${Intl.NumberFormat('en-US').format(degreesCelsius)}°C`;

    const handleSheetOpen = (data: EventProps) => {
        setSelectedData(data);
        setSheetIsOpen(true);
        form.reset({
            city_name: selectedCity,
            temperature: data?.Temperature.toString(),
            feels_like: data?.FeelsLike.toString(),
            humidity: data?.Humidity.toString(),
            pressure: data?.Pressure.toString(),
            description: '',
        });
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            city_name: selectedCity?.toString(),
            temperature: selectedData?.Temperature.toString(),
            feels_like: selectedData?.FeelsLike.toString(),
            humidity: selectedData?.Humidity.toString(),
            pressure: selectedData?.Pressure.toString(),
            description: selectedData?.Description.toString(),
        },
    });

    const handleResetFilters = () => {
        setSelectedCity('Paris');
        setStartDate(undefined);
        setEndDate(undefined);
    }

    console.log(selectedData)

    const onSubmit = async(values: z.infer<typeof formSchema>) => {
       try {
              const city = cities.find((c) => c.name === values.city_name);
              const request = await fetch("http://localhost:8080/weather", {
                method: "PATCH",
                headers: {
                     "Content-Type": "application/json",
                     "Authorization": `Bearer ${getItem('user')}`,
                },
                body: JSON.stringify({
                     ...values,
                     latitude: city?.latitude,
                     longitude: city?.longitude,
                    id: selectedData?.Id,
                }),
              })
              const response = await request.json();
              if(!request.ok) {
                throw new Error(response.message);
              }
              toast("Weather data edited successfully");
              setSheetIsOpen(false);
       }
         catch (error) {
                  toast((error as Error).message);
         }
    }

    const handleDelete = async () => {
        try {
            const request = await fetch(`http://localhost:8080/weather/${selectedData?.Id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${getItem('user')}`,
                },
            });
            console.log(request)
            const response = await request.json();
            if(!request.ok) {
                throw new Error(response.message);
            }
            toast("Weather data deleted successfully");
            setSheetIsOpen(false);
        }
        catch (error) {
            toast((error as Error).message);
        }
    }

    console.log(selectedData)

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
                                    {cities.map((city, index) => (
                                        <SelectItem key={index} value={city.name}>
                                            {city.name}
                                        </SelectItem>
                                    ))}
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
                            <Button onClick={handleResetFilters} variant="link">
                                Reset
                            </Button>
                        </div>
                        <div>
                            <AddNewWeather />
                        </div>
                        <Sheet onOpenChange={setSheetIsOpen} open={sheetIsOpen}>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Edit this weather data</SheetTitle>
                                    <SheetDescription>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                                                <FormField
                                                    control={form.control}
                                                    name="city_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Choose a city" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {cities.map((city, index) => (
                                                                        <SelectItem key={index} value={city.name}>
                                                                            {city.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="temperature"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Temperature</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} type="number" step="0.1" placeholder="Temparature"/>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="feels_like"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Feels Like</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} type="number" placeholder="Feels Like"/>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="humidity"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Humidity</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} type="number" placeholder="Humidity"/>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="pressure"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Pressure</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} type="number" placeholder="Pressure"/>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="description"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Description</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Description"/>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button type="submit" className="w-full">Submit</Button>

                                            </form>
                                        </Form>
                                        <Button onClick={handleDelete} variant="destructive" className="w-full mt-2">
                                            Delete
                                        </Button>
                                    </SheetDescription>
                                </SheetHeader>
                            </SheetContent>
                        </Sheet>
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
                        onValueChange={(v) => handleSheetOpen(v)}
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
                        onValueChange={(v) => handleSheetOpen(v)}
                    />
                </section>
        </div>
    )
}
