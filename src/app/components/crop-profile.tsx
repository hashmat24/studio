'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  cropType: z.string().min(1, { message: 'Crop type is required.' }),
  farmingMethods: z.string().min(1, { message: 'Farming methods are required.' }),
  area: z.coerce.number().min(0.1, { message: 'Area must be greater than 0.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CropProfile() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const farmerProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `farmer_profiles/${user.uid}`);
  }, [firestore, user]);

  const { data: profileData, isLoading } = useDoc<ProfileFormData>(farmerProfileRef);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      cropType: '',
      farmingMethods: '',
      area: 0,
      location: '',
    },
  });

  useEffect(() => {
    if (profileData) {
      form.reset(profileData);
    }
  }, [profileData, form]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }
    
    const profileRef = doc(firestore, `farmer_profiles/${user.uid}`);
    
    const fullProfileData = {
        ...data,
        id: user.uid,
        phoneNumber: user.phoneNumber || 'N/A', // Or get it from a form
        preferredLanguage: 'en', // Or get it from a form
    };

    setDocumentNonBlocking(profileRef, fullProfileData, { merge: true });

    toast({
      title: 'Profile Updated',
      description: 'Your farm profile has been successfully saved.',
    });
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">My Farm Profile</CardTitle>
        <CardDescription>Manage your farm and crop details here.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            ) : (
            <>
            <FormField
              control={form.control}
              name="cropType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Crop Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Grapes, Wheat, Cotton" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="farmingMethods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farming Methods</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Organic, Conventional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Area (in acres)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Nashik, Maharashtra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting || isLoading} className="w-full">
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Profile
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
