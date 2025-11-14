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
import { Loader2, MapPin, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const profileSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  cropType: z.string().min(1, { message: 'Crop type is required.' }),
  farmingMethods: z.string().min(1, { message: 'Farming methods are required.' }),
  area: z.coerce.number().min(0.1, { message: 'Area must be greater than 0.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CropProfile() {
  const { t } = useTranslation();
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
      name: '',
      cropType: '',
      farmingMethods: '',
      area: 0,
      location: '',
    },
  });

  useEffect(() => {
    // Set default name from user auth if profile is new
    if (!profileData && user) {
        form.setValue('name', user.displayName || user.email?.split('@')[0] || '');
    }
    if (profileData) {
      form.reset(profileData);
    }
  }, [profileData, form, user]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('mustBeLoggedIn'),
      });
      return;
    }
    
    const profileRef = doc(firestore, `farmer_profiles/${user.uid}`);
    
    const fullProfileData = {
        ...data,
        id: user.uid,
        phoneNumber: user.phoneNumber || 'N/A',
        preferredLanguage: i18n.language,
    };

    setDocumentNonBlocking(profileRef, fullProfileData);

    toast({
      title: t('profileUpdated'),
      description: t('profileUpdatedDesc'),
    });
  };
  
  const { i18n } = useTranslation();

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{t('myFarmProfile')}</CardTitle>
        <CardDescription>{t('myFarmProfileDesc')}</CardDescription>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                   <FormControl>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder={t('namePlaceholder')} className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cropType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('primaryCropType')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('cropTypePlaceholder')} {...field} />
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
                  <FormLabel>{t('farmingMethods')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('farmingMethodsPlaceholder')} {...field} />
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
                  <FormLabel>{t('landArea')}</FormLabel>
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
                  <FormLabel>{t('farmLocation')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder={t('locationPlaceholder')} className="pl-10" {...field} />
                    </div>
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
              {t('saveProfile')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
