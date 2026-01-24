import { useState, useEffect } from 'react';
import {
  Card,
  CardAction,
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
  Search,
  MapPin,
  Clock,
  User,
  Dumbbell,
  Building,
  Calendar,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import schedulingService, {
  type Training,
  type RecommendedTraining,
  TrainingStatus,
  DayOfWeek,
} from '@/lib/schedulingService';
import enumsService from '@/lib/enumsService';

interface ClientTrainingsProps {
  onTrainingChange?: () => void;
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

export function ClientTrainings({ onTrainingChange }: ClientTrainingsProps) {
  const [myTrainings, setMyTrainings] = useState<Training[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedTraining[]>(
    []
  );
  const [isLoadingTrainings, setIsLoadingTrainings] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendedTraining | null>(null);
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [dayLabels, setDayLabels] =
    useState<Record<DayOfWeek, string>>(FALLBACK_DAY_LABELS);
  const [trainingTypeLabels, setTrainingTypeLabels] = useState<
    Record<string, string>
  >(FALLBACK_TRAINING_TYPE_LABELS);

  useEffect(() => {
    loadEnumLabels();
    loadMyTrainings();
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
    } catch (e) {
      // keep fallbacks
    }
  };

  const loadMyTrainings = async () => {
    try {
      setIsLoadingTrainings(true);
      const trainings = await schedulingService.getMyTrainings();
      setMyTrainings(trainings);
    } catch (error: any) {
      console.error('Failed to load trainings:', error);
      toast.error('Failed to load your trainings');
    } finally {
      setIsLoadingTrainings(false);
    }
  };

  const searchRecommendations = async () => {
    try {
      setIsLoadingRecommendations(true);
      setShowRecommendations(true);
      const recs = await schedulingService.getMyRecommendations();
      setRecommendations(recs);
    } catch (error: any) {
      console.error('Failed to load recommendations:', error);
      const message =
        error?.response?.data?.message ||
        'Failed to load recommendations. Make sure your location is set.';
      toast.error(message);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleSignUp = async () => {
    if (!selectedRecommendation) return;

    try {
      setIsProcessing(true);
      await schedulingService.signUpForTraining(
        selectedRecommendation.training.trainingId
      );
      toast.success('Successfully signed up for training!');
      setIsSignUpDialogOpen(false);
      setSelectedRecommendation(null);

      // Refresh data
      await loadMyTrainings();
      await searchRecommendations();
      onTrainingChange?.();
    } catch (error: any) {
      console.error('Failed to sign up:', error);
      const message =
        error?.response?.data?.message || 'Failed to sign up for training';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedTraining) return;

    try {
      setIsProcessing(true);
      await schedulingService.cancelTrainingReservation(
        selectedTraining.trainingId
      );
      toast.success('Successfully cancelled reservation');
      setIsCancelDialogOpen(false);
      setSelectedTraining(null);

      // Refresh data
      await loadMyTrainings();
      onTrainingChange?.();
    } catch (error: any) {
      console.error('Failed to cancel:', error);
      const message =
        error?.response?.data?.message || 'Failed to cancel reservation';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openSignUpDialog = (rec: RecommendedTraining) => {
    setSelectedRecommendation(rec);
    setIsSignUpDialogOpen(true);
  };

  const openCancelDialog = (training: Training) => {
    setSelectedTraining(training);
    setIsCancelDialogOpen(true);
  };

  // Categorize trainings
  const plannedTrainings = myTrainings.filter(
    (t) => t.status === TrainingStatus.PLANNED
  );
  const completedTrainings = myTrainings.filter(
    (t) => t.status === TrainingStatus.COMPLETED
  );
  const cancelledTrainings = myTrainings.filter(
    (t) => t.status === TrainingStatus.CANCELLED
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
    showCancel: boolean = false
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
        {training.trainer && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>
              {training.trainer.user?.firstName}{' '}
              {training.trainer.user?.lastName}
              {training.trainer.specialization &&
                ` (${training.trainer.specialization})`}
            </span>
          </div>
        )}
        {training.room?.gym && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{training.room.gym.name}</span>
          </div>
        )}
      </div>

      {showCancel && training.status === TrainingStatus.PLANNED && (
        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => openCancelDialog(training)}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel reservation
          </Button>
        </div>
      )}
    </div>
  );

  const renderRecommendationCard = (rec: RecommendedTraining) => {
    const training = rec.training;
    const isAlreadySignedUp = myTrainings.some(
      (t) => t.trainingId === training.trainingId
    );

    return (
      <div
        key={training.trainingId}
        className="border rounded-lg p-4 space-y-3"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {trainingTypeLabels[training.type] || training.type}
              </span>
            </div>
            {training.window && (
              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTrainingSchedule(training)}
              </p>
            )}
          </div>
          <span className="text-lg font-semibold text-primary">
            {training.price} zł
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {rec.distance.toFixed(1)} km away
          </p>
          {training.trainer && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>
                {training.trainer.user?.firstName}{' '}
                {training.trainer.user?.lastName}
                {training.trainer.specialization &&
                  ` (${training.trainer.specialization})`}
              </span>
            </div>
          )}
          {training.room?.gym && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>
                {training.room.gym.name}
                {training.room.name && ` - ${training.room.name}`}
              </span>
            </div>
          )}
          {typeof training.room?.capacity === 'number' && (
            <p className="text-sm text-muted-foreground">
              Spots: {training.clients?.length || 0} / {training.room.capacity}
            </p>
          )}
        </div>

        <div className="pt-2 border-t">
          {isAlreadySignedUp ? (
            <Badge variant="secondary">Already signed up</Badge>
          ) : (
            <Button
              size="sm"
              onClick={() => openSignUpDialog(rec)}
              disabled={
                typeof training.room?.capacity === 'number' &&
                (training.clients?.length || 0) >= training.room.capacity
              }
            >
              Sign up
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Search Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Trainings
          </CardTitle>
          <CardDescription>
            Search for trainings near you based on your preferences
          </CardDescription>
          <CardAction>
            <Button
              onClick={searchRecommendations}
              disabled={isLoadingRecommendations}
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoadingRecommendations ? 'Searching...' : 'Search Trainings'}
            </Button>
          </CardAction>
        </CardHeader>
        {showRecommendations && (
          <CardContent>
            {isLoadingRecommendations ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trainings found matching your preferences.</p>
                <p className="text-sm mt-1">
                  Try updating your training preferences in your profile.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.map(renderRecommendationCard)}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* My Trainings Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Trainings
          </CardTitle>
          <CardDescription>Your scheduled and past trainings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTrainings ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : myTrainings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You don't have any trainings yet.</p>
              <p className="text-sm mt-1">
                Search for trainings above and sign up!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Planned Trainings */}
              {plannedTrainings.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Upcoming Trainings ({plannedTrainings.length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {plannedTrainings.map((t) => renderTrainingCard(t, true))}
                  </div>
                </div>
              )}

              {/* Completed Trainings */}
              {completedTrainings.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Completed Trainings ({completedTrainings.length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {completedTrainings.map((t) =>
                      renderTrainingCard(t, false)
                    )}
                  </div>
                </div>
              )}

              {/* Cancelled Trainings */}
              {cancelledTrainings.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Cancelled Trainings ({cancelledTrainings.length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {cancelledTrainings.map((t) =>
                      renderTrainingCard(t, false)
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Up Dialog */}
      <Dialog open={isSignUpDialogOpen} onOpenChange={setIsSignUpDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign up for training</DialogTitle>
            <DialogDescription>
              Confirm your registration for this training session.
            </DialogDescription>
          </DialogHeader>
          {selectedRecommendation && (
            <div className="py-4 space-y-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {trainingTypeLabels[selectedRecommendation.training.type] ||
                    selectedRecommendation.training.type}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatTrainingSchedule(selectedRecommendation.training)}
                </p>
                {selectedRecommendation.training.room?.gym && (
                  <p className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {selectedRecommendation.training.room.gym.name}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {selectedRecommendation.distance.toFixed(1)} km from you
                </p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-lg font-semibold">
                  Price: {selectedRecommendation.training.price} zł
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSignUpDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleSignUp} disabled={isProcessing}>
              {isProcessing ? 'Signing up...' : 'Confirm Sign Up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Reservation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this training reservation?
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
              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Cancellation is only possible more than 24 hours before the
                  training.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isProcessing}
            >
              Keep reservation
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              {isProcessing ? 'Cancelling...' : 'Cancel Reservation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
