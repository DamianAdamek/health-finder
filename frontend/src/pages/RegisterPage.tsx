import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '@/lib/authService';
import type {
  RegisterClientPayload,
  RegisterTrainerPayload,
} from '@/lib/authService';
import { AxiosError } from 'axios';
import { z } from 'zod';
import UserTypeSelector from '@/components/register/UserTypeSelector';
import AddressFields from '@/components/register/AddressFields';
import TrainerFields from '@/components/register/TrainerFields';

type UserType = 'client' | 'trainer';

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userType, setUserType] = useState<UserType>('client');

  // Common fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password upper case required')
    .regex(/[a-z]/, 'Password lower case required')
    .regex(/\d/, 'Password number required')
    .regex(/[@$!%*?&]/, 'Password special character required');

  // Client specific fields
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');

  // Trainer specific fields
  const [specialization, setSpecialization] = useState('');
  const [description, setDescription] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      if (userType === 'client') {
        const payload: RegisterClientPayload = {
          firstName,
          lastName,
          email,
          password,
          contactNumber: contactNumber || undefined,
          city,
          zipCode,
          street,
          buildingNumber,
          apartmentNumber: apartmentNumber || undefined,
        };
        await authService.registerClient(payload);
      } else {
        const payload: RegisterTrainerPayload = {
          firstName,
          lastName,
          email,
          password,
          contactNumber: contactNumber || undefined,
          specialization: specialization || undefined,
          description: description || undefined,
        };
        await authService.registerTrainer(payload);
      }

      setSuccess(true);
      toast.success('Registration successful!');
      setTimeout(() => navigate('/login'));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string | string[] }>;
      let message = 'Registration failed. Please try again.';

      if (axiosError.response?.data?.message) {
        const msg = axiosError.response.data.message;
        message = Array.isArray(msg) ? msg.join(', ') : msg;
      } else if (axiosError.message) {
        message = axiosError.message;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="shadow-md w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">
              Registration Successful!
            </CardTitle>
            <CardDescription>
              Your account has been created. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center mb-6">
          <Link to="/">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground hover:opacity-80 transition-opacity">
              HealthFinder
            </h1>
          </Link>
          <p className="text-muted-foreground">
            Create your account to get started
          </p>
        </div>

        <UserTypeSelector userType={userType} setUserType={setUserType} />

        <Card className="shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Register as a {userType}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* Common Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Min 8 chars with uppercase, lowercase, number and special
                    char
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactNumber">Phone Number</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="+48 123 456 789"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {userType === 'client' && (
                  <AddressFields
                    city={city}
                    setCity={setCity}
                    zipCode={zipCode}
                    setZipCode={setZipCode}
                    street={street}
                    setStreet={setStreet}
                    buildingNumber={buildingNumber}
                    setBuildingNumber={setBuildingNumber}
                    apartmentNumber={apartmentNumber}
                    setApartmentNumber={setApartmentNumber}
                    isLoading={isLoading}
                  />
                )}

                {userType === 'trainer' && (
                  <TrainerFields
                    specialization={specialization}
                    setSpecialization={setSpecialization}
                    description={description}
                    setDescription={setDescription}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 mt-6">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary underline-offset-4 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-muted-foreground text-sm">
          <p>
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
