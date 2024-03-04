import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {Input} from "@/components/ui/input.tsx";
import {useAuth} from "@/context/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(8).max(50),
})

export const Signup = () => {
    const {login} = useAuth()
    const navigate = useNavigate()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

  const onSubmit = async(values: z.infer<typeof formSchema>) => {
      try {
            const request = await fetch("http://127.0.0.1:8080/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })
          const response = await request.json()
          login(response.access_token)
          navigate("/dashboard")

      }
        catch (error) {
            console.error("An unexpected error happened", error)
        }
  }
  return (
      <main className="container">
        <Card className="w-[350px] mx-auto mt-24">
            <CardHeader>
                <CardTitle>Signup</CardTitle>
                <CardDescription>Create a account</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                  <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                <Input type="password" placeholder="********" {...field} />
                                </FormControl>
                                <FormDescription>
                                Must be at least 8 characters.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  <Button type="submit" className="w-full">Submit</Button>
                </form>
              </Form>
            </CardContent>
        </Card>
    </main>
  );
};