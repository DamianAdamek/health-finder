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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Building,
  MapPin,
  DoorOpen,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Gym } from '@/lib/facilitiesService';
import { fetchAllGyms, removeGym } from '@/lib/facilitiesService';
import { GymForm } from './GymForm';
import { GymDetails } from './GymDetails';
import { useAuth } from '@/context/AuthContext';

export function GymsSection() {
  const { user } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [deletingGym, setDeletingGym] = useState<Gym | null>(null);
  const [expandedGymId, setExpandedGymId] = useState<number | null>(null);

  // Check if user can manage gyms (GYM_ADMIN or ADMIN)
  const canManageGyms = user?.role === 'admin' || user?.role === 'gym_admin';

  useEffect(() => {
    loadGyms();
  }, []);

  const loadGyms = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllGyms();
      setGyms(data);
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
      toast.error('Failed to load gyms');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (gym: Gym) => {
    setEditingGym(gym);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (gym: Gym) => {
    setDeletingGym(gym);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingGym) return;

    try {
      setIsDeleting(true);
      await removeGym(deletingGym.gymId);
      toast.success('Gym deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingGym(null);
      if (expandedGymId === deletingGym.gymId) {
        setExpandedGymId(null);
      }
      loadGyms();
    } catch (error: any) {
      console.error('Failed to delete gym:', error);
      toast.error(error.response?.data?.message || 'Failed to delete gym');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    loadGyms();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingGym(null);
    loadGyms();
  };

  const toggleExpanded = (gymId: number) => {
    setExpandedGymId(expandedGymId === gymId ? null : gymId);
  };

  const formatAddress = (gym: Gym) => {
    const loc = gym.location;
    if (!loc) return 'No address';
    return `${loc.street} ${loc.buildingNumber}${loc.apartmentNumber ? '/' + loc.apartmentNumber : ''}, ${loc.zipCode} ${loc.city}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Gyms
          </CardTitle>
          <CardDescription>
            Manage gym facilities ({gyms.length} total)
          </CardDescription>
          {canManageGyms && (
            <CardAction>
              <Button onClick={openCreateDialog} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Gym
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          {gyms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No gyms found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gyms.map((gym) => (
                <div key={gym.gymId}>
                  <div
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => toggleExpanded(gym.gymId)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{gym.name}</p>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <DoorOpen className="h-3 w-3" />
                          {gym.rooms?.length || 0} rooms
                        </Badge>
                        {gym.trainers && gym.trainers.length > 0 && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            {gym.trainers.length} trainers
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {formatAddress(gym)}
                        </span>
                      </div>
                      {gym.trainers && gym.trainers.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            Trainers:
                          </span>
                          {gym.trainers.slice(0, 3).map((trainer) => (
                            <Badge
                              key={trainer.trainerId}
                              variant="outline"
                              className="text-xs"
                            >
                              {trainer.user?.firstName} {trainer.user?.lastName}
                            </Badge>
                          ))}
                          {gym.trainers.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{gym.trainers.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {formatDate(gym.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {canManageGyms && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(gym);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(gym);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(gym.gymId);
                        }}
                      >
                        {expandedGymId === gym.gymId ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded details section */}
                  {expandedGymId === gym.gymId && (
                    <div className="mt-2 ml-4 border-l-2 border-muted pl-4">
                      <GymDetails gym={gym} onRoomsUpdated={loadGyms} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Gym Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Gym</DialogTitle>
            <DialogDescription>
              Create a new gym facility with location and initial rooms
            </DialogDescription>
          </DialogHeader>
          <GymForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Gym Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gym</DialogTitle>
            <DialogDescription>
              Update gym information and manage trainers
            </DialogDescription>
          </DialogHeader>
          {editingGym && (
            <GymForm
              gym={editingGym}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingGym(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gym</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingGym?.name}"? This action
              cannot be undone and will remove all associated rooms and data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
