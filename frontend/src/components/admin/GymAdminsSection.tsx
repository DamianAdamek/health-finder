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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Building2, Mail, Phone } from 'lucide-react';
import type {
  GymAdmin,
  CreateGymAdminPayload,
  UpdateGymAdminPayload,
} from '@/lib/adminService';
import {
  fetchAllGymAdmins,
  createGymAdmin,
  updateGymAdmin,
  deleteUser,
} from '@/lib/adminService';

interface GymAdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
}

const initialFormData: GymAdminFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  contactNumber: '',
};

export function GymAdminsSection() {
  const [gymAdmins, setGymAdmins] = useState<GymAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingGymAdmin, setEditingGymAdmin] = useState<GymAdmin | null>(null);
  const [deletingGymAdmin, setDeletingGymAdmin] = useState<GymAdmin | null>(
    null
  );
  const [formData, setFormData] = useState<GymAdminFormData>(initialFormData);

  useEffect(() => {
    loadGymAdmins();
  }, []);

  const loadGymAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllGymAdmins();
      setGymAdmins(data);
    } catch (error) {
      console.error('Failed to fetch gym admins:', error);
      toast.error('Failed to load gym admins');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingGymAdmin(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (gymAdmin: GymAdmin) => {
    setEditingGymAdmin(gymAdmin);
    setFormData({
      firstName: gymAdmin.user?.firstName || '',
      lastName: gymAdmin.user?.lastName || '',
      email: gymAdmin.user?.email || '',
      password: '',
      contactNumber: gymAdmin.user?.contactNumber || '',
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (gymAdmin: GymAdmin) => {
    setDeletingGymAdmin(gymAdmin);
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

    if (!editingGymAdmin && !formData.password) {
      toast.error('Password is required for new gym admins');
      return;
    }

    try {
      setIsSaving(true);
      if (editingGymAdmin) {
        const payload: UpdateGymAdminPayload = {};
        if (formData.firstName.trim())
          payload.firstName = formData.firstName.trim();
        if (formData.lastName.trim())
          payload.lastName = formData.lastName.trim();
        if (formData.contactNumber.trim())
          payload.contactNumber = formData.contactNumber.trim();
        if (formData.password) payload.password = formData.password;

        await updateGymAdmin(editingGymAdmin.gymAdminId, payload);
        toast.success('Gym admin updated successfully');
      } else {
        const payload: CreateGymAdminPayload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          contactNumber: formData.contactNumber.trim() || undefined,
        };
        await createGymAdmin(payload);
        toast.success('Gym admin created successfully');
      }
      setIsDialogOpen(false);
      loadGymAdmins();
    } catch (error: any) {
      console.error('Failed to save gym admin:', error);
      toast.error(error.response?.data?.message || 'Failed to save gym admin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingGymAdmin?.user?.id) return;

    try {
      setIsSaving(true);
      await deleteUser(deletingGymAdmin.user.id);
      toast.success('Gym admin deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingGymAdmin(null);
      loadGymAdmins();
    } catch (error: any) {
      console.error('Failed to delete gym admin:', error);
      toast.error(
        error.response?.data?.message || 'Failed to delete gym admin'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof GymAdminFormData, value: string) => {
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
            <Building2 className="h-5 w-5" />
            Gym Admins
          </CardTitle>
          <CardDescription>
            Manage gym administrator accounts ({gymAdmins.length} total)
          </CardDescription>
          <CardAction>
            <Button onClick={openCreateDialog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Gym Admin
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {gymAdmins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No gym admins found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gymAdmins.map((gymAdmin) => (
                <div
                  key={gymAdmin.gymAdminId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {gymAdmin.user?.firstName} {gymAdmin.user?.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {gymAdmin.user?.email}
                      </span>
                      {gymAdmin.user?.contactNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {gymAdmin.user.contactNumber}
                        </span>
                      )}
                    </div>
                    {gymAdmin.gyms && gymAdmin.gyms.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Managing:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {gymAdmin.gyms.map((gym) => (
                            <Badge
                              key={gym.gymId}
                              variant="outline"
                              className="text-xs"
                            >
                              {gym.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(gymAdmin)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(gymAdmin)}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingGymAdmin ? 'Edit Gym Admin' : 'Add New Gym Admin'}
            </DialogTitle>
            <DialogDescription>
              {editingGymAdmin
                ? 'Update gym admin information'
                : 'Create a new gym administrator account'}
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
                disabled={!!editingGymAdmin}
              />
              {editingGymAdmin && (
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password{' '}
                {editingGymAdmin ? '(leave empty to keep current)' : '*'}
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
            <DialogTitle>Delete Gym Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              {deletingGymAdmin?.user?.firstName}{' '}
              {deletingGymAdmin?.user?.lastName}? This action cannot be undone
              and will remove all associated data.
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
