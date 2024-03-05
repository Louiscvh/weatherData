import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {cities} from "@/data/cities.data.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {useState} from "react";

const formSchema = z.object({
    city_name: z.string(),
    temperature: z.string(),
    feels_like: z.string(),
    humidity: z.string(),
    pressure: z.string(),
    description: z.string(),
})


export const AddNewWeather = () => {

    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            city_name: "Paris",
        },
    })

    const onSubmit = async(values: z.infer<typeof formSchema>) => {
        try {
            const city = cities.find((c) => c.name === values.city_name);

            const request = await fetch("http://localhost:8080/weather", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('user')}`,
                },
                body: JSON.stringify({
                    ...values,
                    latitude: city?.latitude,
                    longitude: city?.longitude,
                }),
            })
            const response = await request.json();
            if(!request.ok) {
                throw new Error(response.message);
            }
            toast("Weather data added successfully");
            setIsOpen(false);
        }
        catch (error) {
            toast((error as Error).message);
        }
    }

    return (
        <Dialog onOpenChange={setIsOpen} open={isOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">+</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add new weather data</DialogTitle>
                    <DialogDescription>
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
                                                <Input {...field} type="number" placeholder="Temparature"/>
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
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}