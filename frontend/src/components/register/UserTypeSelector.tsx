import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Award } from 'lucide-react';

type Props = {
  userType: 'client' | 'trainer';
  setUserType: (t: 'client' | 'trainer') => void;
};

export default function UserTypeSelector({ userType, setUserType }: Props) {
  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Select User Type</CardTitle>
        <CardDescription>
          Choose whether you want to register as a Client or Trainer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setUserType('client')}
            className={`relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-200 ${
              userType === 'client'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="font-medium">Client</span>
              <span className="text-xs text-muted-foreground">
                Find gyms & trainers
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setUserType('trainer')}
            className={`relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-200 ${
              userType === 'trainer'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Award className="h-6 w-6" />
              <span className="font-medium">Trainer</span>
              <span className="text-xs text-muted-foreground">
                Offer your services
              </span>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
