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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Clock,
  User,
  Dumbbell,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  CheckSquare,
} from 'lucide-react';
import schedulingService, {
  type Training,
  type CompletedTraining,
  TrainingStatus,
  DayOfWeek,
} from '@/lib/schedulingService';
import enumsService from '@/lib/enumsService';

interface TrainerTrainingsProps {
  onTrainingChange?: () => void;
}

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
  Functional: 'Functional',
  'Healthy Back': 'Healthy Back',
  Cardio: 'Cardio',
  Yoga: 'Yoga',
  Calisthenics: 'Calisthenics',
  Pilates: 'Pilates',
  Zumba: 'Zumba',
  Bodybuilding: 'Bodybuilding',
  Powerlifting: 'Powerlifting',
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

export function TrainerTrainings({ onTrainingChange }: TrainerTrainingsProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [completedTrainings, setCompletedTrainings] = useState<
    CompletedTraining[]
  >([]);
  const [isLoadingTrainings, setIsLoadingTrainings] = useState(true);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(true);

  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [dayLabels, setDayLabels] =
    useState<Record<DayOfWeek, string>>(FALLBACK_DAY_LABELS);
  const [trainingTypeLabels, setTrainingTypeLabels] = useState<
    Record<string, string>
  >(FALLBACK_TRAINING_TYPE_LABELS);

  useEffect(() => {
    loadEnumLabels();
    loadTrainings();
    loadCompletedTrainings();
  }, []);

  const loadEnumLabels = async () => {
    try {
      const [days, types] = await Promise.all([
        enumsService.getDaysOfWeek(),
        enumsService.getTrainingTypes(),
      ]);

      if (Array.isArray(days) && days.length === DAYS_ORDER.length) {
        const map: Record<DayOfWeek, string> = { ...FALLBACK_DAY_LABELS };
        DAYS_ORDER.forEach((d, i) => {
          map[d] = days[i] || FALLBACK_DAY_LABELS[d];
        });
        setDayLabels(map);
      }

      if (Array.isArray(types) && types.length > 0) {
        const map: Record<string, string> = {
          ...FALLBACK_TRAINING_TYPE_LABELS,
        };
        types.forEach((t) => {
          map[t] = t;
        });
        setTrainingTypeLabels(map);
      }
    } catch {
      // keep fallbacks
    }
  };

  const loadTrainings = async () => {
    try {
      setIsLoadingTrainings(true);
      const data = await schedulingService.getTrainerTrainings();
      setTrainings(data);
    } catch (error) {
      console.error('Failed to load trainings:', error);
      toast.error('Failed to load your trainings');
    } finally {
      setIsLoadingTrainings(false);
    }
  };

  const loadCompletedTrainings = async () => {
    try {
      setIsLoadingCompleted(true);
      const data = await schedulingService.getTrainerCompletedTrainings();
      setCompletedTrainings(data);
    } catch (error) {
      console.error('Failed to load completed trainings:', error);
      toast.error('Failed to load completed trainings');
    } finally {
      setIsLoadingCompleted(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!selectedTraining) return;

    try {
      setIsProcessing(true);
      const today = new Date().toISOString().split('T')[0];
      await schedulingService.createCompletedTraining({
        trainingId: selectedTraining.trainingId,
        trainingDate: today,
      });
      toast.success('Training marked as completed!');
      setIsCompleteDialogOpen(false);
      setSelectedTraining(null);

      await loadTrainings();
      await loadCompletedTrainings();
      onTrainingChange?.();
    } catch (error: any) {
      console.error('Failed to complete training:', error);
      const message =
        error?.response?.data?.message ||
        'Failed to mark training as completed';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openCompleteDialog = (training: Training) => {
    setSelectedTraining(training);
    setIsCompleteDialogOpen(true);
  };

  // Filter trainings
  const plannedTrainings = trainings.filter(
    (t) => t.status === TrainingStatus.PLANNED
  );
  const trainingsWithClients = plannedTrainings.filter(
    (t) => t.clients && t.clients.length > 0
  );
  const trainingsWithoutClients = plannedTrainings.filter(
    (t) => !t.clients || t.clients.length === 0
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case TrainingStatus.PLANNED:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Planned
          </Badge>
        );
      case TrainingStatus.COMPLETED:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case TrainingStatus.CANCELLED:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTrainingSchedule = (training: Training) => {
    if (!training.window) return 'Schedule not set';
    const day =
      dayLabels[training.window.dayOfWeek] || training.window.dayOfWeek;
    return `${day}, ${training.window.startTime} - ${training.window.endTime}`;
  };

  const renderTrainingCard = (
    training: Training,
    canComplete: boolean = false
  ) => (
    <div key={training.trainingId} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {trainingTypeLabels[training.type] || training.type}
            </span>
            {getStatusBadge(training.status)}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTrainingSchedule(training)}
          </p>
        </div>
        <span className="text-lg font-semibold text-primary">
          {training.price} zł
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {training.room?.gym && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{training.room.gym.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{training.clients?.length || 0} clients signed up</span>
        </div>
      </div>

      {training.clients && training.clients.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-sm font-medium mb-2">Signed up clients:</p>
          <div className="flex flex-wrap gap-2">
            {training.clients.map((client) => (
              <Badge key={client.clientId} variant="secondary">
                <User className="h-3 w-3 mr-1" />
                {client.user?.firstName} {client.user?.lastName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {canComplete && training.clients && training.clients.length > 0 && (
        <div className="pt-2 border-t">
          <Button
            size="sm"
            onClick={() => openCompleteDialog(training)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Mark as Completed
          </Button>
        </div>
      )}
    </div>
  );

  const renderCompletedTrainingCard = (ct: CompletedTraining) => (
    <div
      key={ct.completedTrainingId}
      className="border rounded-lg p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {trainingTypeLabels[ct.type] || ct.type}
            </span>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(ct.trainingDate).toLocaleDateString()}
          </p>
        </div>
        <span className="text-lg font-semibold text-primary">
          {ct.price} zł
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building className="h-4 w-4" />
          <span>{ct.gymName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span>
            {ct.client?.user?.firstName} {ct.client?.user?.lastName}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Trainings with Clients - Can be marked as completed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Trainings with Clients
          </CardTitle>
          <CardDescription>
            Trainings where clients have signed up. You can mark these as
            completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTrainings ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : trainingsWithClients.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trainings with clients yet.</p>
              <p className="text-sm mt-1">
                When clients sign up for your trainings, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {trainingsWithClients.map((t) => renderTrainingCard(t, true))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainings without Clients */}
      {trainingsWithoutClients.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Available Trainings
            </CardTitle>
            <CardDescription>
              Trainings awaiting client sign-ups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {trainingsWithoutClients.map((t) => renderTrainingCard(t, false))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Trainings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Completed Trainings
          </CardTitle>
          <CardDescription>
            History of trainings you've completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCompleted ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : completedTrainings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed trainings yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedTrainings.map(renderCompletedTrainingCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Training Dialog */}
      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Training as Completed</DialogTitle>
            <DialogDescription>
              This will archive the training and create completion records for
              all signed-up clients.
            </DialogDescription>
          </DialogHeader>
          {selectedTraining && (
            <div className="py-4 space-y-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {trainingTypeLabels[selectedTraining.type] ||
                    selectedTraining.type}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatTrainingSchedule(selectedTraining)}
                </p>
                {selectedTraining.room?.gym && (
                  <p className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {selectedTraining.room.gym.name}
                  </p>
                )}
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-2">
                  Clients to be marked as completed (
                  {selectedTraining.clients?.length || 0}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTraining.clients?.map((client) => (
                    <Badge key={client.clientId} variant="secondary">
                      <User className="h-3 w-3 mr-1" />
                      {client.user?.firstName} {client.user?.lastName}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsCompleted}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Processing...' : 'Confirm Completion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
