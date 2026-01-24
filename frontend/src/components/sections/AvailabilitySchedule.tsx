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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Clock, Calendar, Trash2, Edit } from 'lucide-react';
import schedulingService, {
  type Window,
  DayOfWeek,
} from '@/lib/schedulingService';
import enumsService from '@/lib/enumsService';

interface AvailabilityScheduleProps {
  scheduleId: number | undefined;
  title?: string;
  description?: string;
  isTrainer?: boolean; // true = trainer schedule, false = client schedule
  onScheduleChange?: () => void;
}

const DAYS_ORDER = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

// Fallback labels while fetching from API
const FALLBACK_DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Monday',
  [DayOfWeek.TUESDAY]: 'Tuesday',
  [DayOfWeek.WEDNESDAY]: 'Wednesday',
  [DayOfWeek.THURSDAY]: 'Thursday',
  [DayOfWeek.FRIDAY]: 'Friday',
  [DayOfWeek.SATURDAY]: 'Saturday',
  [DayOfWeek.SUNDAY]: 'Sunday',
};

interface FormState {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export function AvailabilitySchedule({
  scheduleId,
  title = 'Availability Schedule',
  description = 'Manage your time windows',
  isTrainer = false,
  onScheduleChange,
}: AvailabilityScheduleProps) {
  const [windows, setWindows] = useState<Window[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWindowId, setEditingWindowId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '17:00',
  });

  const [dayLabels, setDayLabels] =
    useState<Record<DayOfWeek, string>>(FALLBACK_DAY_LABELS);

  useEffect(() => {
    // Fetch day labels from API and map to DayOfWeek enum
    let mounted = true;
    (async () => {
      try {
        const days = await enumsService.getDaysOfWeek();
        if (!mounted || !Array.isArray(days)) return;

        // If API returns ordered list of days, map by index
        if (days.length === DAYS_ORDER.length) {
          const map: Record<DayOfWeek, string> = { ...FALLBACK_DAY_LABELS };
          DAYS_ORDER.forEach((d, i) => {
            map[d] = days[i] || FALLBACK_DAY_LABELS[d];
          });
          setDayLabels(map);
          return;
        }

        // Otherwise try to match by enum key name
        const map: Record<DayOfWeek, string> = { ...FALLBACK_DAY_LABELS };
        DAYS_ORDER.forEach((d) => {
          const enumKey = DayOfWeek[d] as unknown as string;
          const found = days.find(
            (s) =>
              s.toLowerCase() === enumKey.toLowerCase() ||
              s.toLowerCase().includes(enumKey.toLowerCase())
          );
          if (found) map[d] = found;
        });
        setDayLabels(map);
      } catch (e) {
        // keep fallbacks
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    console.log('AvailabilitySchedule scheduleId:', scheduleId);
    if (scheduleId) {
      loadWindows();
    } else {
      console.warn('AvailabilitySchedule: No scheduleId provided');
      setIsLoading(false);
    }
  }, [scheduleId]);

  const loadWindows = async () => {
    if (!scheduleId) return;
    try {
      setIsLoading(true);
      const data = await schedulingService.getWindowsByScheduleId(scheduleId);
      setWindows(data);
    } catch (error) {
      console.error('Failed to load schedule windows:', error);
      toast.error('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    setEditingWindowId(null);
    setForm({
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '09:00',
      endTime: '17:00',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (window: Window) => {
    setIsEditMode(true);
    setEditingWindowId(window.windowId);
    setForm({
      dayOfWeek: window.dayOfWeek,
      startTime: window.startTime,
      endTime: window.endTime,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!scheduleId) {
      toast.error('Schedule is not available');
      return;
    }

    // Validate time
    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setIsSaving(true);

      if (isEditMode && editingWindowId) {
        await schedulingService.updateWindow(editingWindowId, {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        });
        toast.success('Time window updated');
      } else {
        await schedulingService.createWindow({
          scheduleIds: [scheduleId],
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        });
        toast.success('Time window added');

        // Reset form for quick addition of next window
        setForm({
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: '09:00',
          endTime: '17:00',
        });
      }

      // Only close dialog in edit mode
      if (isEditMode) {
        setIsDialogOpen(false);
      }

      await loadWindows();
      onScheduleChange?.();
    } catch (error: any) {
      console.error('Failed to save window:', error);
      const message =
        error?.response?.data?.message || 'Failed to save time window';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (windowId: number) => {
    if (!confirm('Are you sure you want to delete this time window?')) return;

    try {
      await schedulingService.deleteWindow(windowId);
      toast.success('Time window deleted');
      await loadWindows();
      onScheduleChange?.();
    } catch (error: any) {
      console.error('Failed to delete window:', error);
      const message =
        error?.response?.data?.message || 'Failed to delete time window';
      toast.error(message);
    }
  };

  // Group windows by day of week
  const windowsByDay = DAYS_ORDER.reduce(
    (acc, day) => {
      acc[day] = windows.filter((w) => w.dayOfWeek === day);
      return acc;
    },
    {} as Record<DayOfWeek, Window[]>
  );

  const hasAnyWindows = windows.length > 0;

  if (!scheduleId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Schedule has not been created yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No schedule to display.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction>
            <Button onClick={openAddDialog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add window
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !hasAnyWindows ? (
            <div className="py-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You don't have any time windows yet.</p>
              <p className="text-sm mt-1">
                {isTrainer
                  ? 'Add availability windows so clients can book trainings.'
                  : 'Add availability windows to specify when you can have trainings.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {DAYS_ORDER.map((day) => {
                const dayWindows = windowsByDay[day];
                if (dayWindows.length === 0) return null;

                return (
                  <div key={day} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">
                      {dayLabels[day] || FALLBACK_DAY_LABELS[day]}
                    </h4>
                    <div className="space-y-2">
                      {dayWindows.map((window) => (
                        <div
                          key={window.windowId}
                          className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {window.startTime} - {window.endTime}
                            </span>
                            {window.training && (
                              <Badge variant="secondary">Booked</Badge>
                            )}
                            {!window.training && isTrainer && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600"
                              >
                                Available
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!window.training && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(window)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(window.windowId)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Window Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit time window' : 'Add time window'}
            </DialogTitle>
            <DialogDescription>
              {isTrainer
                ? 'Specify when you are available for clients.'
                : 'Specify when you can have trainings.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dayOfWeek">Day of week</Label>
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
                <Label htmlFor="startTime">From</Label>
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
                <Label htmlFor="endTime">To</Label>
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              {isEditMode ? 'Cancel' : 'Close'}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? 'Saving...'
                : isEditMode
                  ? 'Save changes'
                  : 'Add and continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
