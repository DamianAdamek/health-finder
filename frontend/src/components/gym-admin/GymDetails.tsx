import type { Gym } from '@/lib/facilitiesService';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, FileText, DoorOpen, Users } from 'lucide-react';
import { RoomsSection } from './RoomsSection';

interface GymDetailsProps {
  gym: Gym;
  onRoomsUpdated: () => void;
}

export function GymDetails({ gym, onRoomsUpdated }: GymDetailsProps) {
  const formatAddress = () => {
    const loc = gym.location;
    if (!loc) return 'No address';
    return `${loc.street} ${loc.buildingNumber}${loc.apartmentNumber ? '/' + loc.apartmentNumber : ''}, ${loc.zipCode} ${loc.city}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 py-3">
      {/* Description */}
      {gym.description && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            Description
          </div>
          <p className="text-sm text-muted-foreground pl-6">
            {gym.description}
          </p>
        </div>
      )}

      {/* Rules */}
      {gym.rules && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            Rules
          </div>
          <p className="text-sm text-muted-foreground pl-6">{gym.rules}</p>
        </div>
      )}

      {/* Location Details */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4" />
          Location
        </div>
        <div className="text-sm text-muted-foreground pl-6 space-y-1">
          <p>{formatAddress()}</p>
          {gym.location && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                City: {gym.location.city}
              </Badge>
              <Badge variant="outline" className="text-xs">
                ZIP: {gym.location.zipCode}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Trainers */}
      {gym.trainers && gym.trainers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Assigned Trainers ({gym.trainers.length})
          </div>
          <div className="pl-6 flex flex-wrap gap-2">
            {gym.trainers.map((trainer) => (
              <Badge
                key={trainer.trainerId}
                variant="secondary"
                className="text-xs"
              >
                {trainer.user?.firstName} {trainer.user?.lastName}
                {trainer.specialization && ` (${trainer.specialization})`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          Timeline
        </div>
        <div className="text-xs text-muted-foreground pl-6 space-y-1">
          <p>Created: {formatDate(gym.createdAt)}</p>
          <p>Updated: {formatDate(gym.updatedAt)}</p>
        </div>
      </div>

      {/* Rooms Management */}
      <div className="pt-2">
        <div className="flex items-center gap-2 text-sm font-medium mb-3">
          <DoorOpen className="h-4 w-4" />
          Rooms ({gym.rooms?.length || 0})
        </div>
        <RoomsSection
          gymId={gym.gymId}
          rooms={gym.rooms || []}
          onUpdated={onRoomsUpdated}
        />
      </div>
    </div>
  );
}
