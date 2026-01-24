import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Trash2, Users } from 'lucide-react';
import type {
  Gym,
  CreateGymPayload,
  UpdateGymPayload,
  CreateLocationPayload,
} from '@/lib/facilitiesService';
import { createGym, updateGym } from '@/lib/facilitiesService';
import { fetchAllTrainers, type Trainer } from '@/lib/adminService';

interface RoomFormData {
  name: string;
  capacity: string;
}

interface GymFormData {
  name: string;
  description: string;
  rules: string;
  location: {
    city: string;
    zipCode: string;
    street: string;
    buildingNumber: string;
    apartmentNumber: string;
  };
  rooms: RoomFormData[];
  selectedTrainerIds: number[];
}

const initialFormData: GymFormData = {
  name: '',
  description: '',
  rules: '',
  location: {
    city: '',
    zipCode: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
  },
  rooms: [],
  selectedTrainerIds: [],
};

interface GymFormProps {
  gym?: Gym;
  onSuccess: () => void;
  onCancel: () => void;
}

export function GymForm({ gym, onSuccess, onCancel }: GymFormProps) {
  const isEditing = !!gym;
  const [formData, setFormData] = useState<GymFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTrainers, setAvailableTrainers] = useState<Trainer[]>([]);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(false);

  useEffect(() => {
    if (gym) {
      setFormData({
        name: gym.name || '',
        description: gym.description || '',
        rules: gym.rules || '',
        location: {
          city: gym.location?.city || '',
          zipCode: gym.location?.zipCode || '',
          street: gym.location?.street || '',
          buildingNumber: gym.location?.buildingNumber || '',
          apartmentNumber: gym.location?.apartmentNumber || '',
        },
        rooms: [], // Rooms are managed separately via RoomsSection
        selectedTrainerIds: gym.trainers?.map((t) => t.trainerId) || [],
      });
    }
  }, [gym]);

  useEffect(() => {
    if (isEditing) {
      loadTrainers();
    }
  }, [isEditing]);

  const loadTrainers = async () => {
    try {
      setIsLoadingTrainers(true);
      const trainers = await fetchAllTrainers();
      setAvailableTrainers(trainers);
    } catch (error) {
      console.error('Failed to load trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setIsLoadingTrainers(false);
    }
  };

  const updateField = (field: keyof GymFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateLocationField = (
    field: keyof GymFormData['location'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const addRoom = () => {
    setFormData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, { name: '', capacity: '' }],
    }));
  };

  const updateRoom = (
    index: number,
    field: keyof RoomFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      ),
    }));
  };

  const removeRoom = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index),
    }));
  };

  const toggleTrainer = (trainerId: number) => {
    setFormData((prev) => {
      const isSelected = prev.selectedTrainerIds.includes(trainerId);
      return {
        ...prev,
        selectedTrainerIds: isSelected
          ? prev.selectedTrainerIds.filter((id) => id !== trainerId)
          : [...prev.selectedTrainerIds, trainerId],
      };
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Gym name is required');
      return;
    }

    if (!isEditing) {
      // For creating, location is required
      const loc = formData.location;
      if (
        !loc.city.trim() ||
        !loc.zipCode.trim() ||
        !loc.street.trim() ||
        !loc.buildingNumber.trim()
      ) {
        toast.error('City, zip code, street, and building number are required');
        return;
      }
    }

    try {
      setIsSaving(true);

      if (isEditing && gym) {
        // Update gym
        const payload: UpdateGymPayload = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          rules: formData.rules.trim() || undefined,
        };

        // Only include location if any field changed
        const loc = formData.location;
        if (
          loc.city.trim() ||
          loc.zipCode.trim() ||
          loc.street.trim() ||
          loc.buildingNumber.trim()
        ) {
          payload.location = {
            city: loc.city.trim() || undefined,
            zipCode: loc.zipCode.trim() || undefined,
            street: loc.street.trim() || undefined,
            buildingNumber: loc.buildingNumber.trim() || undefined,
            apartmentNumber: loc.apartmentNumber.trim() || undefined,
          };
        }

        payload.trainers = formData.selectedTrainerIds;

        await updateGym(gym.gymId, payload);
        toast.success('Gym updated successfully');
      } else {
        // Create gym
        const location: CreateLocationPayload = {
          city: formData.location.city.trim(),
          zipCode: formData.location.zipCode.trim(),
          street: formData.location.street.trim(),
          buildingNumber: formData.location.buildingNumber.trim(),
          apartmentNumber:
            formData.location.apartmentNumber.trim() || undefined,
        };

        const payload: CreateGymPayload = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          rules: formData.rules.trim() || undefined,
          location,
          rooms:
            formData.rooms.length > 0
              ? formData.rooms
                  .filter((r) => r.name.trim())
                  .map((r) => ({
                    name: r.name.trim(),
                    capacity: r.capacity ? parseInt(r.capacity, 10) : undefined,
                  }))
              : undefined,
        };

        await createGym(payload);
        toast.success('Gym created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save gym:', error);
      const errorMessage =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.message)
          ? error.response.data.message.join(', ')
          : 'Failed to save gym');
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      {/* Basic Info */}
      <div className="grid gap-2">
        <Label htmlFor="name">Gym Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="FitCenter"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="24/7 open gym with modern equipment..."
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="rules">Rules</Label>
        <Textarea
          id="rules"
          value={formData.rules}
          onChange={(e) => updateField('rules', e.target.value)}
          placeholder="No smoking, No outside food..."
          rows={2}
        />
      </div>

      {/* Location */}
      <Separator className="my-2" />
      <Label className="text-base font-medium">Location</Label>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.location.city}
            onChange={(e) => updateLocationField('city', e.target.value)}
            placeholder="Warsaw"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="zipCode">Zip Code *</Label>
          <Input
            id="zipCode"
            value={formData.location.zipCode}
            onChange={(e) => updateLocationField('zipCode', e.target.value)}
            placeholder="00-001"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="street">Street *</Label>
        <Input
          id="street"
          value={formData.location.street}
          onChange={(e) => updateLocationField('street', e.target.value)}
          placeholder="Main Street"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="buildingNumber">Building Number *</Label>
          <Input
            id="buildingNumber"
            value={formData.location.buildingNumber}
            onChange={(e) =>
              updateLocationField('buildingNumber', e.target.value)
            }
            placeholder="12A"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="apartmentNumber">Apartment Number</Label>
          <Input
            id="apartmentNumber"
            value={formData.location.apartmentNumber}
            onChange={(e) =>
              updateLocationField('apartmentNumber', e.target.value)
            }
            placeholder="3"
          />
        </div>
      </div>

      {/* Rooms (only for creating) */}
      {!isEditing && (
        <>
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Initial Rooms</Label>
            <Button variant="outline" size="sm" onClick={addRoom}>
              <Plus className="h-4 w-4 mr-1" />
              Add Room
            </Button>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            You can add more rooms after creating the gym
          </p>

          {formData.rooms.length > 0 && (
            <div className="space-y-3">
              {formData.rooms.map((room, index) => (
                <div
                  key={index}
                  className="flex items-end gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-1 grid gap-2">
                    <Label>Room Name *</Label>
                    <Input
                      value={room.name}
                      onChange={(e) =>
                        updateRoom(index, 'name', e.target.value)
                      }
                      placeholder="Yoga Room"
                    />
                  </div>
                  <div className="w-24 grid gap-2">
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={room.capacity}
                      onChange={(e) =>
                        updateRoom(index, 'capacity', e.target.value)
                      }
                      placeholder="30"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeRoom(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Trainers (only for editing) */}
      {isEditing && (
        <>
          <Separator className="my-2" />
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Label className="text-base font-medium">Manage Trainers</Label>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Select trainers to assign to this gym
          </p>

          {isLoadingTrainers ? (
            <div className="text-sm text-muted-foreground">
              Loading trainers...
            </div>
          ) : availableTrainers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No trainers available
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {availableTrainers.map((trainer) => {
                const isSelected = formData.selectedTrainerIds.includes(
                  trainer.trainerId
                );
                return (
                  <div
                    key={trainer.trainerId}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-accent/50 cursor-pointer"
                    onClick={() => toggleTrainer(trainer.trainerId)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleTrainer(trainer.trainerId)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {trainer.user?.firstName} {trainer.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {trainer.user?.email}
                        {trainer.specialization &&
                          ` • ${trainer.specialization}`}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        Assigned
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {formData.selectedTrainerIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {formData.selectedTrainerIds.length} trainer(s) selected
            </p>
          )}
        </>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Saving...' : isEditing ? 'Update Gym' : 'Create Gym'}
        </Button>
      </div>
    </div>
  );
}
