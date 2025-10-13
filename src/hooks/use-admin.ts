'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

type AdminRole = {
  // We can add more fields here later, e.g. 'role: "superadmin"'
  name: string;
};

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `roles_admin/${user.uid}`);
  }, [firestore, user]);

  const { data: adminData, isLoading: isAdminLoading } = useDoc<AdminRole>(adminDocRef);
  
  const isLoading = isUserLoading || (user && isAdminLoading);
  const isAdmin = !!adminData;

  return { isAdmin, isLoading };
}
