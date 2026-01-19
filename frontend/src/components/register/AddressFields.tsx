import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  city: string;
  setCity: (v: string) => void;
  zipCode: string;
  setZipCode: (v: string) => void;
  street: string;
  setStreet: (v: string) => void;
  buildingNumber: string;
  setBuildingNumber: (v: string) => void;
  apartmentNumber: string;
  setApartmentNumber: (v: string) => void;
  isLoading: boolean;
};

export default function AddressFields({
  city,
  setCity,
  zipCode,
  setZipCode,
  street,
  setStreet,
  buildingNumber,
  setBuildingNumber,
  apartmentNumber,
  setApartmentNumber,
  isLoading,
}: Props) {
  return (
    <>
      <div className="border-t pt-4 mt-2">
        <Label className="text-sm font-medium text-muted-foreground">
          Address Information
        </Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="Warsaw"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            disabled={isLoading}
            minLength={2}
            maxLength={100}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="zipCode">Zip Code *</Label>
          <Input
            id="zipCode"
            placeholder="00-001"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
            disabled={isLoading}
            minLength={4}
            maxLength={20}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="street">Street *</Label>
        <Input
          id="street"
          placeholder="Main St"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          required
          disabled={isLoading}
          minLength={1}
          maxLength={150}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="buildingNumber">Building No. *</Label>
          <Input
            id="buildingNumber"
            placeholder="12A"
            value={buildingNumber}
            onChange={(e) => setBuildingNumber(e.target.value)}
            required
            disabled={isLoading}
            minLength={1}
            maxLength={20}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="apartmentNumber">Apt No.</Label>
          <Input
            id="apartmentNumber"
            placeholder="3"
            value={apartmentNumber}
            onChange={(e) => setApartmentNumber(e.target.value)}
            disabled={isLoading}
            maxLength={20}
          />
        </div>
      </div>
    </>
  );
}
