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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  User,
  Dumbbell,
  Building,
  Calendar,
  CheckCircle,
  Star,
  MessageSquare,
} from 'lucide-react';
import schedulingService, {
  type CompletedTraining,
} from '@/lib/schedulingService';
import trainerService, {
  type Opinion,
  type CreateOpinionDto,
} from '@/lib/trainerService';
import { useAuth } from '@/context/AuthContext';
import enumsService from '@/lib/enumsService';

interface ClientCompletedTrainingsProps {
  onTrainingChange?: () => void;
}

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

export function ClientCompletedTrainings({
  onTrainingChange,
}: ClientCompletedTrainingsProps) {
  const { user } = useAuth();
  const [completedTrainings, setCompletedTrainings] = useState<
    CompletedTraining[]
  >([]);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTraining, setSelectedTraining] =
    useState<CompletedTraining | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [trainingTypeLabels, setTrainingTypeLabels] = useState<
    Record<string, string>
  >(FALLBACK_TRAINING_TYPE_LABELS);

  useEffect(() => {
    loadEnumLabels();
    loadCompletedTrainings();
    loadOpinions();
  }, []);

  const loadEnumLabels = async () => {
    try {
      const types = await enumsService.getTrainingTypes();
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

  const loadCompletedTrainings = async () => {
    try {
      setIsLoading(true);
      const data = await schedulingService.getMyCompletedTrainings();
      setCompletedTrainings(data);
    } catch (error) {
      console.error('Failed to load completed trainings:', error);
      toast.error('Failed to load completed trainings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOpinions = async () => {
    try {
      const data = await trainerService.getAllOpinions();
      setOpinions(data);
    } catch (error) {
      console.error('Failed to load opinions:', error);
    }
  };

  const hasReviewedTrainer = (trainerId: number) => {
    const clientId = user?.client?.clientId;
    if (!clientId) return false;
    return opinions.some(
      (o) => o.clientId === clientId && o.trainerId === trainerId
    );
  };

  const getTrainerReview = (trainerId: number) => {
    const clientId = user?.client?.clientId;
    if (!clientId) return null;
    return opinions.find(
      (o) => o.clientId === clientId && o.trainerId === trainerId
    );
  };

  const openReviewDialog = (training: CompletedTraining) => {
    setSelectedTraining(training);
    const existingReview = getTrainerReview(training.trainer?.trainerId);
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedTraining || !user?.client?.clientId) return;

    try {
      setIsProcessing(true);
      const trainerId = selectedTraining.trainer?.trainerId;
      const existingReview = getTrainerReview(trainerId);

      const data: CreateOpinionDto = {
        rating,
        comment: comment || undefined,
        clientId: user.client.clientId,
        trainerId,
      };

      if (existingReview) {
        await trainerService.updateOpinion(existingReview.opinionId, {
          rating,
          comment: comment || undefined,
        });
        toast.success('Review updated successfully!');
      } else {
        await trainerService.createOpinion(data);
        toast.success('Review submitted successfully!');
      }

      setIsReviewDialogOpen(false);
      setSelectedTraining(null);
      await loadOpinions();
      await loadCompletedTrainings(); // Refresh trainings to get updated trainer rating
      onTrainingChange?.();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      const message =
        error?.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStarRating = (
    currentRating: number,
    onChange: (rating: number) => void,
    interactive: boolean = true
  ) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange(star)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`h-6 w-6 ${
              star <= currentRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const renderCompletedTrainingCard = (ct: CompletedTraining) => {
    const trainerId = ct.trainer?.trainerId;
    const hasReviewed = hasReviewedTrainer(trainerId);
    const existingReview = getTrainerReview(trainerId);

    return (
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
            <div className="flex items-center gap-2">
              <span>
                {ct.trainer?.user?.firstName ?? ''}{' '}
                {ct.trainer?.user?.lastName ?? ''}
              </span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400" />
                {ct.trainer?.rating != null
                  ? ct.trainer.rating.toFixed(1)
                  : 'No ratings'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Existing Review Display */}
        {hasReviewed && existingReview && (
          <div className="pt-2 border-t bg-muted/50 -mx-4 -mb-4 px-4 pb-4 mt-3 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Your review:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= existingReview.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openReviewDialog(ct)}
              >
                Edit
              </Button>
            </div>
            {existingReview.comment && (
              <p className="text-sm text-muted-foreground mt-1 italic">
                "{existingReview.comment}"
              </p>
            )}
          </div>
        )}

        {/* Add Review Button */}
        {!hasReviewed && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openReviewDialog(ct)}
            >
              <Star className="h-4 w-4 mr-1" />
              Leave a Review
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Completed Trainings
          </CardTitle>
          <CardDescription>
            Your training history. Leave reviews for your trainers!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : completedTrainings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed trainings yet.</p>
              <p className="text-sm mt-1">
                When you complete trainings, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedTrainings.map(renderCompletedTrainingCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {getTrainerReview(selectedTraining?.trainer?.trainerId || 0)
                ? 'Edit Your Review'
                : 'Leave a Review'}
            </DialogTitle>
            <DialogDescription>
              Share your experience with{' '}
              {selectedTraining?.trainer?.user?.firstName}{' '}
              {selectedTraining?.trainer?.user?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              {renderStarRating(rating, setRating)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isProcessing}>
              {isProcessing
                ? 'Submitting...'
                : getTrainerReview(selectedTraining?.trainer?.trainerId || 0)
                  ? 'Update Review'
                  : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
