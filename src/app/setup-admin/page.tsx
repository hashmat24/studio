'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SetupAdminPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleMakeAdmin = () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    const adminRef = doc(firestore, `roles_admin/${user.uid}`);
    
    // The data can be simple, its existence is what matters for the rules.
    const adminData = {
      id: user.uid,
      name: user.displayName || user.email,
      email: user.email,
      role: 'superadmin',
    };

    setDocumentNonBlocking(adminRef, adminData);

    toast({
      title: 'Success!',
      description: 'You have been granted admin privileges. Redirecting to admin dashboard...',
    });

    setTimeout(() => router.push('/admin'), 2000);
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-12">
      <Card className="w-[450px]">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className='font-headline text-2xl pt-2'>Become an Admin</CardTitle>
          <CardDescription>
            Click the button below to grant your account administrative privileges.
            This is a one-time setup step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleMakeAdmin} className="w-full">
            Grant Admin Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
