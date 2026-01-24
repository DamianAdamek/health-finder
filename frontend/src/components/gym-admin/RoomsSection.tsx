import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Users2 } from 'lucide-react';
import type {
  Room,
  CreateRoomPayload,
  UpdateRoomPayload,
} from '@/lib/facilitiesService';
import { createRoom, updateRoom, removeRoom } from '@/lib/facilitiesService';
import { useAuth } from '@/context/AuthContext';

interface RoomFormData {
  name: string;
  capacity: string;
}

const initialRoomFormData: RoomFormData = {
  name: '',
  capacity: '',
};

interface RoomsSectionProps {
  gymId: number;
  rooms: Room[];
  onUpdated: () => void;
}

export function RoomsSection({ gymId, rooms, onUpdated }: RoomsSectionProps) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>(initialRoomFormData);

  // Check if user can manage rooms (GYM_ADMIN or ADMIN)
  const canManageRooms = user?.role === 'admin' || user?.role === 'gym_admin';

  const openCreateDialog = () => {
    setEditingRoom(null);
    setFormData(initialRoomFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (room: Room) => {
    setDeletingRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Room name is required');
      return;
    }

    try {
      setIsSaving(true);

      if (editingRoom) {
        // Update room
        const payload: UpdateRoomPayload = {
          name: formData.name.trim(),
          capacity: formData.capacity
            ? parseInt(formData.capacity, 10)
            : undefined,
        };
        await updateRoom(editingRoom.roomId, payload);
        toast.success('Room updated successfully');
      } else {
        // Create room
        const payload: CreateRoomPayload = {
          name: formData.name.trim(),
          capacity: formData.capacity
            ? parseInt(formData.capacity, 10)
            : undefined,
          gymId,
        };
        await createRoom(payload);
        toast.success('Room created successfully');
      }

      setIsDialogOpen(false);
      setEditingRoom(null);
      setFormData(initialRoomFormData);
      onUpdated();
    } catch (error: any) {
      console.error('Failed to save room:', error);
      toast.error(error.response?.data?.message || 'Failed to save room');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRoom) return;

    try {
      setIsSaving(true);
      await removeRoom(deletingRoom.roomId);
      toast.success('Room deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingRoom(null);
      onUpdated();
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof RoomFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="pl-6">
        {canManageRooms && (
          <div className="mb-3">
            <Button variant="outline" size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add Room
            </Button>
          </div>
        )}

        {rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rooms in this gym</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  {canManageRooms && (
                    <TableHead className="w-24">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.roomId}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>
                      {room.capacity ? (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 w-fit"
                        >
                          <Users2 className="h-3 w-3" />
                          {room.capacity}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Not set
                        </span>
                      )}
                    </TableCell>
                    {canManageRooms && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(room)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(room)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Room Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </DialogTitle>
            <DialogDescription>
              {editingRoom
                ? 'Update room information'
                : 'Add a new room to this gym'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomName">Room Name *</Label>
              <Input
                id="roomName"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Yoga Room"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roomCapacity">Capacity</Label>
              <Input
                id="roomCapacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => updateField('capacity', e.target.value)}
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of people in the room
              </p>
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
              {isSaving ? 'Saving...' : editingRoom ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingRoom?.name}"? This
              action cannot be undone.
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
