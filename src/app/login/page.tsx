'use client';
import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import {
  initiateAnonymousSignIn,
  initiateEmailSignIn,
  initiateEmailSignUp,
} from '@/firebase/non-blocking-login';
import { FirebaseError } from 'firebase/app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleAuthError = (error: FirebaseError) => {
    let description = 'An unexpected error occurred. Please try again.';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        description = 'Invalid email or password.';
        break;
      case 'auth/email-already-in-use':
        description = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        description = 'The password is too weak.';
        break;
      case 'auth/invalid-email':
          description = 'Please enter a valid email.';
          break;
    }
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description,
    });
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await initiateEmailSignIn(auth, data.email, data.password);
    } catch (error) {
      if (error instanceof FirebaseError) handleAuthError(error);
    }
  };

  const onSignUp: SubmitHandler<FormData> = async (data) => {
    try {
      await initiateEmailSignUp(auth, data.email, data.password);
    } catch (error) {
      if (error instanceof FirebaseError) handleAuthError(error);
    }
  };
  
  const handleAnonymousSignIn = async () => {
    try {
      await initiateAnonymousSignIn(auth);
    } catch (error) {
      if (error instanceof FirebaseError) handleAuthError(error);
    }
  };

  const memoizedForm = useMemo(() => (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="farmer@example.com" {...field} />
              </FormControl>
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
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  ), [form]);

  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-12">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your farm dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {memoizedForm}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button onClick={form.handleSubmit(onSubmit)} className="w-full">
                Sign In
              </Button>
              <Button onClick={handleAnonymousSignIn} variant="link" className="w-full">
                Continue as Guest
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>
                Join Krishi Mitra to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
             {memoizedForm}
            </CardContent>
            <CardFooter>
              <Button onClick={form.handleSubmit(onSignUp)} className="w-full">
                Create Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}