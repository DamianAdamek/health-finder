import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Users, MapPin, Phone, Mail } from 'lucide-react';
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from '@/lib/adminService';
import {
  fetchAllClients,
  createClient,
  updateClient,
  deleteUser,
} from '@/lib/adminService';

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  city: string;
  zipCode: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
}

const initialFormData: ClientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  contactNumber: '',
  city: '',
  zipCode: '',
  street: '',
  buildingNumber: '',
  apartmentNumber: '',
};

export function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingClient(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      firstName: client.user?.firstName || '',
      lastName: client.user?.lastName || '',
      email: client.user?.email || '',
      password: '',
      contactNumber: client.user?.contactNumber || '',
      city: client.location?.city || '',
      zipCode: client.location?.zipCode || '',
      street: client.location?.street || '',
      buildingNumber: client.location?.buildingNumber || '',
      apartmentNumber: client.location?.apartmentNumber || '',
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {
      toast.error('First name, last name, and email are required');
      return;
    }

    if (!editingClient && !formData.password) {
      toast.error('Password is required for new clients');
      return;
    }

    if (
      !editingClient &&
      (!formData.city ||
        !formData.zipCode ||
        !formData.street ||
        !formData.buildingNumber)
    ) {
      toast.error('Address fields are required for new clients');
      return;
    }

    try {
      setIsSaving(true);
      if (editingClient) {
        const payload: UpdateClientPayload = {};
        if (formData.firstName.trim())
          payload.firstName = formData.firstName.trim();
        if (formData.lastName.trim())
          payload.lastName = formData.lastName.trim();
        if (formData.contactNumber.trim())
          payload.contactNumber = formData.contactNumber.trim();
        if (formData.password) payload.password = formData.password;
        if (formData.city.trim()) payload.city = formData.city.trim();
        if (formData.zipCode.trim()) payload.zipCode = formData.zipCode.trim();
        if (formData.street.trim()) payload.street = formData.street.trim();
        if (formData.buildingNumber.trim())
          payload.buildingNumber = formData.buildingNumber.trim();
        if (formData.apartmentNumber.trim())
          payload.apartmentNumber = formData.apartmentNumber.trim();

        await updateClient(editingClient.clientId, payload);
        toast.success('Client updated successfully');
      } else {
        const payload: CreateClientPayload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          contactNumber: formData.contactNumber.trim() || undefined,
          city: formData.city.trim(),
          zipCode: formData.zipCode.trim(),
          street: formData.street.trim(),
          buildingNumber: formData.buildingNumber.trim(),
          apartmentNumber: formData.apartmentNumber.trim() || undefined,
        };
        await createClient(payload);
        toast.success('Client created successfully');
      }
      setIsDialogOpen(false);
      loadClients();
    } catch (error: any) {
      console.error('Failed to save client:', error);
      toast.error(error.response?.data?.message || 'Failed to save client');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClient?.user?.id) return;

    try {
      setIsSaving(true);
      await deleteUser(deletingClient.user.id);
      toast.success('Client deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingClient(null);
      loadClients();
    } catch (error: any) {
      console.error('Failed to delete client:', error);
      toast.error(error.response?.data?.message || 'Failed to delete client');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients
          </CardTitle>
          <CardDescription>
            Manage client accounts ({clients.length} total)
          </CardDescription>
          <CardAction>
            <Button onClick={openCreateDialog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No clients found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <div
                  key={client.clientId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {client.user?.firstName} {client.user?.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.user?.email}
                      </span>
                      {client.user?.contactNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.user.contactNumber}
                        </span>
                      )}
                      {client.location?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {client.location.city}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(client)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? 'Update client information'
                : 'Create a new client account'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john@example.com"
                disabled={!!editingClient}
              />
              {editingClient && (
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password {editingClient ? '(leave empty to keep current)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactNumber">Phone Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => updateField('contactNumber', e.target.value)}
                placeholder="+1 555 555 5555"
              />
            </div>

            <div className="border-t pt-4 mt-2">
              <Label className="text-base font-medium">Address</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City {!editingClient && '*'}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Warsaw"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zipCode">
                  Postal Code {!editingClient && '*'}
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => updateField('zipCode', e.target.value)}
                  placeholder="00-001"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="street">Street {!editingClient && '*'}</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => updateField('street', e.target.value)}
                placeholder="Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buildingNumber">
                  Building {!editingClient && '*'}
                </Label>
                <Input
                  id="buildingNumber"
                  value={formData.buildingNumber}
                  onChange={(e) =>
                    updateField('buildingNumber', e.target.value)
                  }
                  placeholder="12A"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apartmentNumber">Apartment</Label>
                <Input
                  id="apartmentNumber"
                  value={formData.apartmentNumber}
                  onChange={(e) =>
                    updateField('apartmentNumber', e.target.value)
                  }
                  placeholder="5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingClient?.user?.firstName}{' '}
              {deletingClient?.user?.lastName}? This action cannot be undone and
              will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
