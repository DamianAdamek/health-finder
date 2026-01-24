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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Dumbbell, Mail, Phone, Star } from 'lucide-react';
import type {
  Trainer,
  CreateTrainerPayload,
  UpdateTrainerPayload,
} from '@/lib/adminService';
import {
  fetchAllTrainers,
  createTrainer,
  updateTrainer,
  deleteUser,
} from '@/lib/adminService';
import enumsService from '@/lib/enumsService';

interface TrainerFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  specialization: string;
  description: string;
}

const initialFormData: TrainerFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  contactNumber: '',
  specialization: '',
  description: '',
};

export function TrainersSection() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [deletingTrainer, setDeletingTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState<TrainerFormData>(initialFormData);
  const [trainingTypes, setTrainingTypes] = useState<string[]>([]);

  useEffect(() => {
    loadTrainers();
    loadTrainingTypes();
  }, []);

  const loadTrainers = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllTrainers();
      setTrainers(data);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrainingTypes = async () => {
    try {
      const types = await enumsService.getTrainingTypes();
      setTrainingTypes(types);
    } catch (error) {
      console.error('Failed to load training types:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingTrainer(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      firstName: trainer.user?.firstName || '',
      lastName: trainer.user?.lastName || '',
      email: trainer.user?.email || '',
      password: '',
      contactNumber: trainer.user?.contactNumber || '',
      specialization: trainer.specialization || '',
      description: trainer.description || '',
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (trainer: Trainer) => {
    setDeletingTrainer(trainer);
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

    if (!editingTrainer && !formData.password) {
      toast.error('Password is required for new trainers');
      return;
    }

    try {
      setIsSaving(true);
      if (editingTrainer) {
        const payload: UpdateTrainerPayload = {};
        if (formData.firstName.trim())
          payload.firstName = formData.firstName.trim();
        if (formData.lastName.trim())
          payload.lastName = formData.lastName.trim();
        if (formData.contactNumber.trim())
          payload.contactNumber = formData.contactNumber.trim();
        if (formData.password) payload.password = formData.password;
        if (formData.specialization)
          payload.specialization = formData.specialization;
        if (formData.description.trim())
          payload.description = formData.description.trim();

        await updateTrainer(editingTrainer.trainerId, payload);
        toast.success('Trainer updated successfully');
      } else {
        const payload: CreateTrainerPayload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          contactNumber: formData.contactNumber.trim() || undefined,
          specialization: formData.specialization || undefined,
          description: formData.description.trim() || undefined,
        };
        await createTrainer(payload);
        toast.success('Trainer created successfully');
      }
      setIsDialogOpen(false);
      loadTrainers();
    } catch (error: any) {
      console.error('Failed to save trainer:', error);
      toast.error(error.response?.data?.message || 'Failed to save trainer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTrainer?.user?.id) return;

    try {
      setIsSaving(true);
      await deleteUser(deletingTrainer.user.id);
      toast.success('Trainer deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingTrainer(null);
      loadTrainers();
    } catch (error: any) {
      console.error('Failed to delete trainer:', error);
      toast.error(error.response?.data?.message || 'Failed to delete trainer');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof TrainerFormData, value: string) => {
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
            <Dumbbell className="h-5 w-5" />
            Trainers
          </CardTitle>
          <CardDescription>
            Manage trainer accounts ({trainers.length} total)
          </CardDescription>
          <CardAction>
            <Button onClick={openCreateDialog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Trainer
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {trainers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trainers found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trainers.map((trainer) => (
                <div
                  key={trainer.trainerId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {trainer.user?.firstName} {trainer.user?.lastName}
                      </p>
                      {trainer.specialization && (
                        <Badge variant="secondary">
                          {trainer.specialization}
                        </Badge>
                      )}
                      {trainer.rating != null ? (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Star className="h-3 w-3 text-yellow-400" />
                          {trainer.rating.toFixed(1)}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Star className="h-3 w-3 text-yellow-400" />
                          No ratings
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {trainer.user?.email}
                      </span>
                      {trainer.user?.contactNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {trainer.user.contactNumber}
                        </span>
                      )}
                    </div>
                    {trainer.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">
                        {trainer.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(trainer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(trainer)}
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
              {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
            </DialogTitle>
            <DialogDescription>
              {editingTrainer
                ? 'Update trainer information'
                : 'Create a new trainer account'}
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
                disabled={!!editingTrainer}
              />
              {editingTrainer && (
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password{' '}
                {editingTrainer ? '(leave empty to keep current)' : '*'}
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
              <Label className="text-base font-medium">Trainer Details</Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => updateField('specialization', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {trainingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Experience, certifications, teaching style..."
                rows={3}
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
            <DialogTitle>Delete Trainer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingTrainer?.user?.firstName}{' '}
              {deletingTrainer?.user?.lastName}? This action cannot be undone
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
