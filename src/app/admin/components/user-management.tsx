import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const users = [
  { id: 'USR001', name: 'Ramesh Kumar', location: 'Pune, MH', crop: 'Sugarcane', status: 'Active', avatarId: 'farmer-avatar-1' },
  { id: 'USR002', name: 'Sunita Devi', location: 'Ludhiana, PB', crop: 'Wheat', status: 'Active', avatarId: 'farmer-avatar-2' },
  { id: 'USR003', name: 'Arjun Singh', location: 'Mysuru, KA', crop: 'Ragi', status: 'Inactive', avatarId: '' },
  { id: 'USR004', name: 'Priya Patel', location: 'Anand, GJ', crop: 'Cotton', status: 'Active', avatarId: '' },
];

export default function UserManagement() {
  const avatarMap = new Map(PlaceHolderImages.map(p => [p.id, p.imageUrl]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Farmer Management</CardTitle>
        <CardDescription>View and manage farmer accounts and profile data.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farmer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Primary Crop</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={avatarMap.get(user.avatarId)} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.name}</div>
                  </div>
                </TableCell>
                <TableCell>{user.location}</TableCell>
                <TableCell>{user.crop}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={user.status === 'Active' ? 'default' : 'outline'} className={user.status === 'Active' ? 'bg-primary/80' : ''}>
                    {user.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
