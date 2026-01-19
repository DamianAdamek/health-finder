import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '../ui/textarea';

type Props = {
  specialization: string;
  setSpecialization: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  isLoading: boolean;
};

export default function TrainerFields({
  specialization,
  setSpecialization,
  description,
  setDescription,
  isLoading,
}: Props) {
  {
    /* TODO: fetch specializations from API */
  }
  const specializations = [
    'Functional',
    'Healthy Back',
    'Cardio',
    'Yoga',
    'Calisthenics',
    'Pilates',
    'Zumba',
    'Bodybuilding',
    'Powerlifting',
  ];

  return (
    <>
      <div className="border-t pt-4 mt-2">
        <Label className="text-sm font-medium text-muted-foreground">
          Professional Information
        </Label>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="specialization">Specialization</Label>
        <Select
          value={specialization}
          onValueChange={(v) => setSpecialization(v)}
        >
          <SelectTrigger
            id="specialization"
            className="w-full"
            disabled={isLoading}
          >
            <SelectValue placeholder="Select specialization..." />
          </SelectTrigger>
          <SelectContent>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Tell us about your experience and training approach..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          maxLength={500}
        />
      </div>
    </>
  );
}
