'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// This matches the structure in docs/backend.json for FarmerProfile
type FarmerProfile = {
  id: string;
  name?: string; // Name might not be present on all user objects
  location: string;
  cropType: string;
  // We can add a status if we track it, for now, we'll assume 'Active'
};

export default function UserManagement() {
  const { t } = useTranslation();
  const avatarMap = new Map(PlaceHolderImages.map(p => [p.id, p.imageUrl]));
  const firestore = useFirestore();

  const farmerProfilesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'farmer_profiles');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<FarmerProfile>(farmerProfilesCollection);

  const getInitials = (name: string | undefined) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{t('farmerManagement')}</CardTitle>
        <CardDescription>{t('farmerManagementDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('farmer')}</TableHead>
                <TableHead>{t('location')}</TableHead>
                <TableHead>{t('primaryCrop')}</TableHead>
                <TableHead className="text-right">{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {/* Using a generic avatar for now, can be customized later */}
                        <AvatarImage src={avatarMap.get('farmer-avatar-1')} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      {/* Using a placeholder name if not available */}
                      <div className="font-medium">{user.name || `${t('farmer')} ${user.id.substring(0, 5)}`}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.location || 'N/A'}</TableCell>
                  <TableCell>{user.cropType || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {/* Assuming all fetched users are active for now */}
                    <Badge variant='default' className='bg-primary/80'>
                      {t('active')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && (!users || users.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">
                <p>{t('noFarmerProfiles')}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
