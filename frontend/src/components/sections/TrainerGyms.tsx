import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Building,
  MapPin,
  DoorOpen,
  Users,
  Plus,
  Calendar,
  Clock,
  Dumbbell,
  Edit,
  Trash2,
} from 'lucide-react';
import type { TrainerGym, GymRoom } from '@/lib/authService';
import schedulingService, {
  type Training,
  DayOfWeek,
  TrainingStatus,
  TrainingType,
} from '@/lib/schedulingService';
import enumsService from '@/lib/enumsService';

interface TrainerGymsProps {
  gyms: TrainerGym[] | undefined;
  trainerId: number | undefined;
  onTrainingCreated?: () => void;
}

// Fallback labels
const FALLBACK_DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Monday',
  [DayOfWeek.TUESDAY]: 'Tuesday',
  [DayOfWeek.WEDNESDAY]: 'Wednesday',
  [DayOfWeek.THURSDAY]: 'Thursday',
  [DayOfWeek.FRIDAY]: 'Friday',
  [DayOfWeek.SATURDAY]: 'Saturday',
  [DayOfWeek.SUNDAY]: 'Sunday',
};

const FALLBACK_TRAINING_TYPE_LABELS: Record<string, string> = {
  [TrainingType.FUNCTIONAL]: 'Functional',
  [TrainingType.HEALTHY_BACK]: 'Healthy Back',
  [TrainingType.CARDIO]: 'Cardio',
  [TrainingType.YOGA]: 'Yoga',
  [TrainingType.CALISTHENICS]: 'Calisthenics',
  [TrainingType.PILATES]: 'Pilates',
  [TrainingType.ZUMBA]: 'Zumba',
  [TrainingType.BODYBUILDING]: 'Bodybuilding',
  [TrainingType.POWERLIFTING]: 'Powerlifting',
};

const DAYS_ORDER = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

interface TrainingFormState {
  roomId: string;
  price: string;
  type: TrainingType;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export function TrainerGyms({
  gyms,
  trainerId,
  onTrainingCreated,
}: TrainerGymsProps) {
  const [isAddTrainingOpen, setIsAddTrainingOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState<number | null>(
    null
  );
  const [selectedGym, setSelectedGym] = useState<TrainerGym | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<GymRoom | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [, setIsLoadingTrainings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<TrainingFormState>({
    roomId: '',
    price: '100',
    type: TrainingType.FUNCTIONAL,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '10:00',
  });

  const [dayLabels, setDayLabels] =
    useState<Record<DayOfWeek, string>>(FALLBACK_DAY_LABELS);
  const [trainingTypeLabels, setTrainingTypeLabels] = useState<
    Record<string, string>
  >(FALLBACK_TRAINING_TYPE_LABELS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [days, types] = await Promise.all([
          enumsService.getDaysOfWeek(),
          enumsService.getTrainingTypes(),
        ]);

        if (
          mounted &&
          Array.isArray(days) &&
          days.length === DAYS_ORDER.length
        ) {
          const map: Record<DayOfWeek, string> = { ...FALLBACK_DAY_LABELS };
          DAYS_ORDER.forEach((d, i) => {
            map[d] = days[i] || FALLBACK_DAY_LABELS[d];
          });
          setDayLabels(map);
        }

        if (mounted && Array.isArray(types) && types.length > 0) {
          const map: Record<string, string> = {
            ...FALLBACK_TRAINING_TYPE_LABELS,
          };
          // Try to map by enum key names
          const enumValues = Object.values(TrainingType).filter(
            (v) => typeof v === 'string'
          ) as string[];
          enumValues.forEach((ev) => {
            const found = types.find(
              (t) =>
                t.toLowerCase() === ev.toLowerCase() ||
                t.toLowerCase().includes(ev.toLowerCase())
            );
            map[ev] = found || map[ev] || ev;
          });
          setTrainingTypeLabels(map);
        }
      } catch (e) {
        // keep fallbacks
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (trainerId) {
      loadTrainings();
    }
  }, [trainerId]);

  const loadTrainings = async () => {
    try {
      setIsLoadingTrainings(true);
      const allTrainings = await schedulingService.getAllTrainings();
      // Filter trainings for this trainer
      const trainerTrainings = allTrainings.filter(
        (t) => t.trainer?.trainerId === trainerId
      );
      setTrainings(trainerTrainings);
    } catch (error) {
      console.error('Failed to load trainings:', error);
    } finally {
      setIsLoadingTrainings(false);
    }
  };

  const openAddTrainingDialog = (gym: TrainerGym) => {
    setIsEditMode(false);
    setEditingTrainingId(null);
    setSelectedGym(gym);
    setSelectedRoom(null);
    setForm({
      roomId: '',
      price: '100',
      type: TrainingType.FUNCTIONAL,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '09:00',
      endTime: '10:00',
    });
    setIsAddTrainingOpen(true);
  };

  const openEditTrainingDialog = (training: Training, gym: TrainerGym) => {
    setIsEditMode(true);
    setEditingTrainingId(training.trainingId);
    setSelectedGym(gym);
    const room = gym.rooms?.find((r) => r.roomId === training.room?.roomId);
    setSelectedRoom(room || null);
    setForm({
      roomId: String(training.room?.roomId || ''),
      price: String(training.price),
      type: training.type,
      dayOfWeek: training.window?.dayOfWeek || DayOfWeek.MONDAY,
      startTime: training.window?.startTime || '09:00',
      endTime: training.window?.endTime || '10:00',
    });
    setIsAddTrainingOpen(true);
  };

  const handleRoomChange = (roomId: string) => {
    setForm((prev) => ({ ...prev, roomId }));
    const room = selectedGym?.rooms?.find((r) => r.roomId === Number(roomId));
    setSelectedRoom(room || null);
  };

  const handleCreateTraining = async () => {
    if (!trainerId || !form.roomId) {
      toast.error('Please select a room');
      return;
    }

    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    const price = Number(form.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsSaving(true);

      if (isEditMode && editingTrainingId) {
        // Update existing training
        await schedulingService.updateTraining(editingTrainingId, {
          roomId: Number(form.roomId),
          price,
          type: form.type,
        });

        // Update the window if it exists
        const training = trainings.find(
          (t) => t.trainingId === editingTrainingId
        );
        if (training?.window) {
          await schedulingService.updateWindow(training.window.windowId, {
            dayOfWeek: form.dayOfWeek,
            startTime: form.startTime,
            endTime: form.endTime,
          });
        }

        toast.success('Training updated successfully');
      } else {
        // Create new training
        const training = await schedulingService.createTraining({
          roomId: Number(form.roomId),
          price,
          trainerId,
          status: TrainingStatus.PLANNED,
          type: form.type,
          clientIds: [], // No clients initially
        });

        // Then create a window for this training
        await schedulingService.createWindow({
          trainingId: training.trainingId,
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        });

        toast.success('Training created successfully');
      }

      setIsAddTrainingOpen(false);
      await loadTrainings();
      onTrainingCreated?.();
    } catch (error: any) {
      console.error('Failed to save training:', error);
      const message =
        error?.response?.data?.message || 'Failed to save training';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTraining = async (trainingId: number) => {
    if (!confirm('Are you sure you want to delete this training?')) return;

    try {
      await schedulingService.deleteTraining(trainingId);
      toast.success('Training deleted successfully');
      await loadTrainings();
      onTrainingCreated?.();
    } catch (error: any) {
      console.error('Failed to delete training:', error);
      const message =
        error?.response?.data?.message || 'Failed to delete training';
      toast.error(message);
    }
  };

  const formatAddress = (gym: TrainerGym) => {
    const loc = gym.location;
    if (!loc) return 'No address';
    return `${loc.street} ${loc.buildingNumber}${loc.apartmentNumber ? '/' + loc.apartmentNumber : ''}, ${loc.zipCode} ${loc.city}`;
  };

  const hasGyms = gyms && gyms.length > 0;

  // Group trainings by gym
  const trainingsByGym =
    gyms?.reduce(
      (acc, gym) => {
        acc[gym.gymId] = trainings.filter((t) =>
          gym.rooms?.some((r) => r.roomId === t.room?.roomId)
        );
        return acc;
      },
      {} as Record<number, Training[]>
    ) || {};

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            My Gyms
          </CardTitle>
          <CardDescription>Gyms where you conduct trainings</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasGyms ? (
            <div className="py-8 text-center text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You are not assigned to any gym.</p>
              <p className="text-sm mt-1">
                Contact a gym administrator to be added.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {gyms.map((gym) => (
                <div
                  key={gym.gymId}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{gym.name}</h3>
                      {gym.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {gym.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{formatAddress(gym)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openAddTrainingDialog(gym)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add training
                    </Button>
                  </div>

                  {/* Rooms */}
                  {gym.rooms && gym.rooms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <DoorOpen className="h-4 w-4" />
                        Rooms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {gym.rooms.map((room) => (
                          <Badge key={room.roomId} variant="secondary">
                            {room.name}
                            {room.capacity && (
                              <span className="ml-1 text-muted-foreground">
                                <Users className="h-3 w-3 inline mr-1" />
                                {room.capacity}
                              </span>
                            )}
                            {!room.capacity && (
                              <span className="ml-1 text-muted-foreground">
                                (no limit)
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trainings in this gym */}
                  {trainingsByGym[gym.gymId]?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Dumbbell className="h-4 w-4" />
                        Your trainings
                      </h4>
                      <div className="space-y-2">
                        {trainingsByGym[gym.gymId].map((training) => (
                          <div
                            key={training.trainingId}
                            className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">
                                {trainingTypeLabels[String(training.type)] ||
                                  String(training.type)}
                              </Badge>
                              <span className="text-sm">
                                {training.room?.name}
                              </span>
                              {training.window && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {dayLabels[training.window.dayOfWeek] ||
                                    FALLBACK_DAY_LABELS[
                                      training.window.dayOfWeek
                                    ]}
                                  <Clock className="h-3 w-3 ml-2" />
                                  {training.window.startTime} -{' '}
                                  {training.window.endTime}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  training.status === TrainingStatus.PLANNED
                                    ? 'default'
                                    : training.status ===
                                        TrainingStatus.COMPLETED
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {training.status}
                              </Badge>
                              <span className="text-sm font-medium">
                                {training.price} zł
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  openEditTrainingDialog(training, gym)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteTraining(training.trainingId)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Training Dialog */}
      <Dialog open={isAddTrainingOpen} onOpenChange={setIsAddTrainingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit training' : 'Add new training'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? `Update training at ${selectedGym?.name}`
                : `Create a new training at ${selectedGym?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="room">Room *</Label>
              <Select value={form.roomId} onValueChange={handleRoomChange}>
                <SelectTrigger id="room">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {selectedGym?.rooms?.map((room) => (
                    <SelectItem key={room.roomId} value={String(room.roomId)}>
                      {room.name}
                      {room.capacity
                        ? ` (max ${room.capacity} people)`
                        : ' (no limit)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRoom && !selectedRoom.capacity && (
                <p className="text-xs text-muted-foreground">
                  This room has no capacity limit - you can conduct multiple
                  trainings simultaneously.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Training type *</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, type: value as TrainingType }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TrainingType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {trainingTypeLabels[String(type)] || String(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dayOfWeek">Day of week *</Label>
              <Select
                value={form.dayOfWeek}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    dayOfWeek: value as DayOfWeek,
                  }))
                }
              >
                <SelectTrigger id="dayOfWeek">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_ORDER.map((day) => (
                    <SelectItem key={day} value={day}>
                      {dayLabels[day] || FALLBACK_DAY_LABELS[day]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">From *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">To *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddTrainingOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTraining} disabled={isSaving}>
              {isSaving
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update training'
                  : 'Create training'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
