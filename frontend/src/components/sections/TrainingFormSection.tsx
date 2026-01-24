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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Edit, Plus, Activity, Target, Heart, Dumbbell } from 'lucide-react';
import {
  type Form,
  fetchClientForm,
  createForm,
  updateForm,
} from '@/lib/formService';
import enumsService from '@/lib/enumsService';

interface TrainingFormSectionProps {
  clientId: number;
  onFormUpdate?: () => void;
}

export function TrainingFormSection({
  clientId,
  onFormUpdate,
}: TrainingFormSectionProps) {
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [activityLevel, setActivityLevel] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [trainingGoal, setTrainingGoal] = useState('');
  const [healthProfile, setHealthProfile] = useState('');

  // Enum options
  const [activityOptions, setActivityOptions] = useState<string[]>([]);
  const [trainingTypeOptions, setTrainingTypeOptions] = useState<string[]>([]);

  // Load enums once
  useEffect(() => {
    let mounted = true;
    const loadEnums = async () => {
      try {
        const [acts, types] = await Promise.all([
          enumsService.getActivityLevels(),
          enumsService.getTrainingTypes(),
        ]);
        if (!mounted) return;
        setActivityOptions(acts);
        setTrainingTypeOptions(types);
        if (!activityLevel && acts.length) setActivityLevel(acts[0]);
      } catch (error) {
        console.error('Failed to load enums:', error);
      }
    };
    loadEnums();
    return () => {
      mounted = false;
    };
  }, []);

  // Load form when clientId changes
  useEffect(() => {
    let mounted = true;
    const loadForm = async () => {
      try {
        setIsLoading(true);
        const formData = await fetchClientForm(clientId);
        if (!mounted) return;
        setForm(formData);
        if (formData) {
          setActivityLevel(String(formData.activityLevel));
          setSelectedTypes((formData.trainingTypes || []) as string[]);
          setTrainingGoal(formData.trainingGoal || '');
          setHealthProfile(formData.healthProfile || '');
        }
      } catch (error) {
        console.error('Failed to load form:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadForm();
    return () => {
      mounted = false;
    };
  }, [clientId]);

  const openDialog = () => {
    if (form) {
      setActivityLevel(String(form.activityLevel));
      setSelectedTypes((form.trainingTypes || []) as string[]);
      setTrainingGoal(form.trainingGoal || '');
      setHealthProfile(form.healthProfile || '');
    } else {
      setActivityLevel(activityOptions[0] ?? '');
      setSelectedTypes([]);
      setTrainingGoal('');
      setHealthProfile('');
    }
    setIsDialogOpen(true);
  };

  const toggleTrainingType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    if (!activityLevel || selectedTypes.length === 0 || !trainingGoal.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        activityLevel,
        trainingTypes: selectedTypes,
        trainingGoal: trainingGoal.trim(),
        healthProfile: healthProfile.trim() || undefined,
      };

      if (form) {
        const updated = await updateForm(form.formId, payload);
        setForm(updated);
        toast.success('Form updated successfully');
      } else {
        const created = await createForm({ ...(payload as any), clientId });
        setForm(created);
        toast.success('Form created successfully');
      }

      setIsDialogOpen(false);
      onFormUpdate?.();
    } catch (error) {
      console.error('Failed to save form:', error);
      toast.error('Failed to save the form');
    } finally {
      setIsSaving(false);
    }
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value?: string | React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-sm">{value || 'Not provided'}</div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card id="training-form">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasForm = form !== null;

  return (
    <>
      <Card id="training-form">
        <CardHeader>
          <CardTitle>Training Form</CardTitle>
          <CardDescription>Your training preferences and goals</CardDescription>
          <CardAction>
            <Button
              onClick={openDialog}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {hasForm ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Fill
                </>
              )}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="divide-y">
          {hasForm ? (
            <>
              <InfoItem
                icon={Activity}
                label="Activity Level"
                value={form.activityLevel as string}
              />
              <InfoItem
                icon={Dumbbell}
                label="Preferred Training Types"
                value={
                  <div className="flex flex-wrap gap-1 mt-1">
                    {form.trainingTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                }
              />
              <InfoItem
                icon={Target}
                label="Training Goal"
                value={form.trainingGoal}
              />
              <InfoItem
                icon={Heart}
                label="Health Profile"
                value={form.healthProfile || 'Not provided'}
              />
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You haven't filled out the training form yet.</p>
              <p className="text-sm mt-1">
                Fill it to receive tailored training recommendations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {hasForm ? 'Edit Form' : 'Fill Training Form'}
            </DialogTitle>
            <DialogDescription>
              Provide your training preferences so we can recommend the best
              sessions for you.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Activity Level */}
            <div className="grid gap-2">
              <Label htmlFor="activityLevel">Activity Level *</Label>
              <Select
                value={activityLevel}
                onValueChange={(value) => setActivityLevel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  {activityOptions.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Training Types */}
            <div className="grid gap-2">
              <Label>Preferred Training Types *</Label>
              <div className="flex flex-wrap gap-2">
                {trainingTypeOptions.map((type) => (
                  <Badge
                    key={type}
                    variant={
                      selectedTypes.includes(type) ? 'default' : 'outline'
                    }
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTrainingType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
              {selectedTypes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Click to select training types
                </p>
              )}
            </div>

            {/* Training Goal */}
            <div className="grid gap-2">
              <Label htmlFor="trainingGoal">Training Goal *</Label>
              <Input
                id="trainingGoal"
                placeholder="e.g. Lose 5kg, increase strength..."
                value={trainingGoal}
                onChange={(e) => setTrainingGoal(e.target.value)}
              />
            </div>

            {/* Health Profile */}
            <div className="grid gap-2">
              <Label htmlFor="healthProfile">Health Profile (optional)</Label>
              <Textarea
                id="healthProfile"
                placeholder="Describe any health issues, injuries, or limitations..."
                value={healthProfile}
                onChange={(e) => setHealthProfile(e.target.value)}
                rows={3}
              />
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
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
