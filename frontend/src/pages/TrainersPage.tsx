import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Star, MessageSquare, Search, Dumbbell } from 'lucide-react';
import trainerService, {
  type Trainer,
  type Opinion,
  type CreateOpinionDto,
} from '@/lib/trainerService';
import { useAuth } from '@/context/AuthContext';

const FALLBACK_SPECIALIZATION_LABELS: Record<string, string> = {
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

function TrainersPage() {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isViewReviewsDialogOpen, setIsViewReviewsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const role = user?.role?.toLowerCase();
  const isClient = role === 'client';

  useEffect(() => {
    loadTrainers();
    loadOpinions();
  }, []);

  const loadTrainers = async () => {
    try {
      setIsLoading(true);
      const data = await trainerService.getAllTrainers();
      setTrainers(data);
    } catch (error) {
      console.error('Failed to load trainers:', error);
      toast.error('Failed to load trainers');
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

  const getTrainerOpinions = (trainerId: number) => {
    return opinions.filter((o) => o.trainerId === trainerId);
  };

  const openReviewDialog = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    const existingReview = getTrainerReview(trainer.trainerId);
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
    setIsReviewDialogOpen(true);
  };

  const openViewReviewsDialog = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsViewReviewsDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedTrainer || !user?.client?.clientId) return;

    try {
      setIsProcessing(true);
      const trainerId = selectedTrainer.trainerId;
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
      setSelectedTrainer(null);
      await loadOpinions();
      await loadTrainers(); // Reload to get updated ratings
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
    onChange?: (rating: number) => void,
    interactive: boolean = true,
    size: 'sm' | 'md' = 'md'
  ) => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`${sizeClass} ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const filteredTrainers = trainers.filter((trainer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName =
      `${trainer.user?.firstName || ''} ${trainer.user?.lastName || ''}`.toLowerCase();
    const specialization = (trainer.specialization || '').toLowerCase();
    return fullName.includes(query) || specialization.includes(query);
  });

  const renderTrainerCard = (trainer: Trainer) => {
    const trainerOpinions = getTrainerOpinions(trainer.trainerId);
    const hasReviewed = hasReviewedTrainer(trainer.trainerId);

    return (
      <Card key={trainer.trainerId} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {trainer.user?.firstName} {trainer.user?.lastName}
                </CardTitle>
                {trainer.specialization && (
                  <Badge variant="secondary" className="mt-1">
                    <Dumbbell className="h-3 w-3 mr-1" />
                    {FALLBACK_SPECIALIZATION_LABELS[trainer.specialization] ||
                      trainer.specialization}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">
                {trainer.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trainer.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {trainer.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openViewReviewsDialog(trainer)}
              className="text-muted-foreground"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              {trainerOpinions.length} reviews
            </Button>

            {isClient && (
              <Button
                variant={hasReviewed ? 'outline' : 'default'}
                size="sm"
                onClick={() => openReviewDialog(trainer)}
              >
                <Star className="h-4 w-4 mr-1" />
                {hasReviewed ? 'Edit Review' : 'Leave Review'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SidebarProvider>
        {/* Mobile header */}
        <div className="sm:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 px-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span className="font-semibold">Menu</span>
          </div>
          <div className="text-sm text-muted-foreground">Trainers</div>
        </div>

        <div className="flex flex-1">
          <DashboardSidebar />

          <main className="flex-1 px-4 pt-16 pb-8 sm:px-8 sm:pt-8 md:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Trainers</h1>
                <p className="text-muted-foreground mt-1">
                  Browse our trainers and leave reviews
                </p>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Trainers Grid */}
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : filteredTrainers.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No trainers found</p>
                  {searchQuery && (
                    <p className="text-sm mt-1">Try adjusting your search</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTrainers.map(renderTrainerCard)}
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {getTrainerReview(selectedTrainer?.trainerId || 0)
                ? 'Edit Your Review'
                : 'Leave a Review'}
            </DialogTitle>
            <DialogDescription>
              Share your experience with {selectedTrainer?.user?.firstName}{' '}
              {selectedTrainer?.user?.lastName}
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
                : getTrainerReview(selectedTrainer?.trainerId || 0)
                  ? 'Update Review'
                  : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Reviews Dialog */}
      <Dialog
        open={isViewReviewsDialogOpen}
        onOpenChange={setIsViewReviewsDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Reviews for {selectedTrainer?.user?.firstName}{' '}
              {selectedTrainer?.user?.lastName}
            </DialogTitle>
            <DialogDescription>
              {getTrainerOpinions(selectedTrainer?.trainerId || 0).length}{' '}
              reviews
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {getTrainerOpinions(selectedTrainer?.trainerId || 0).length ===
            0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reviews yet</p>
              </div>
            ) : (
              getTrainerOpinions(selectedTrainer?.trainerId || 0).map(
                (opinion) => (
                  <div
                    key={opinion.opinionId}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">
                          {opinion.client?.user?.firstName}{' '}
                          {opinion.client?.user?.lastName}
                        </span>
                      </div>
                      {renderStarRating(opinion.rating, undefined, false, 'sm')}
                    </div>
                    {opinion.comment && (
                      <p className="text-sm text-muted-foreground italic">
                        "{opinion.comment}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(opinion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )
              )
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewReviewsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TrainersPage;
