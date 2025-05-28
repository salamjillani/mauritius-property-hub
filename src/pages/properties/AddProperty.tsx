import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// Interfaces for type safety
interface Address {
  street?: string;
  city: string;
  zipCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface PropertyImage {
  url: string;
  caption?: string;
  isMain: boolean;
  file?: File; // For upload handling
}

interface AvailableDate {
  startDate: string;
  endDate: string;
  status: 'available' | 'unavailable';
}

interface FormData {
  title: string;
  description: string;
  price: string;
  currency: 'USD' | 'EUR' | 'MUR';
  category: 'for-sale' | 'for-rent' | 'offices' | 'office-rent' | 'land';
  type:
    | 'Apartment'
    | 'House'
    | 'Villa'
    | 'Penthouse'
    | 'Duplex'
    | 'Land'
    | 'Office'
    | 'Commercial'
    | 'Other';
  address: Address;
  bedrooms: string;
  bathrooms: string;
  area: string;
  amenities: string[];
  images: PropertyImage[];
  virtualTourUrl?: string;
  videoUrl?: string;
  isFeatured: boolean;
  rentalPeriod?: 'day' | 'month';
  availability?: AvailableDate[];
}

const AddProperty = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    currency: 'MUR',
    category: 'for-sale',
    type: 'Apartment',
    address: { street: '', city: '', zipCode: '', country: 'Mauritius', latitude: undefined, longitude: undefined },
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: [],
    images: [],
    virtualTourUrl: '',
    videoUrl: '',
    isFeatured: false,
    rentalPeriod: undefined,
    availability: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ _id: string; subscription?: { plan: 'basic' | 'elite' | 'platinum' } } | null>(
    null
  );

  // Load user from localStorage
  useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser?._id) {
        setUser(storedUser);
      }
    } catch {
      setUser(null);
    }
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1] as keyof Address;
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: field === 'latitude' || field === 'longitude' ? parseFloat(value) || undefined : value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSelectChange = useCallback((name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'category' && ['for-rent', 'office-rent'].includes(value) ? { rentalPeriod: 'month' } : { rentalPeriod: undefined }),
    }));
  }, []);

  const handleAmenityChange = useCallback((amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 10) {
      toast({
        title: t('error'),
        description: t('max_images_exceeded', { max: 10 }),
        variant: 'destructive',
      });
      return;
    }
    const newImages = files.map((file, index) => ({
      url: URL.createObjectURL(file),
      caption: '',
      isMain: formData.images.length === 0 && index === 0,
      file,
    }));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  }, [formData.images, toast, t]);

  const handleRemoveImage = useCallback((index: number) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      if (newImages.length > 0 && !newImages.some((img) => img.isMain)) {
        newImages[0].isMain = true;
      }
      return { ...prev, images: newImages };
    });
  }, []);

  const handleSetMainImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isMain: i === index,
      })),
    }));
  }, []);

  const handleAvailabilityChange = useCallback((index: number, field: 'startDate' | 'endDate', value: string) => {
    setFormData((prev) => {
      const newAvailability = [...(prev.availability || [])];
      newAvailability[index] = { ...newAvailability[index], [field]: value, status: 'available' };
      return { ...prev, availability: newAvailability };
    });
  }, []);

  const handleAddAvailability = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      availability: [...(prev.availability || []), { startDate: '', endDate: '', status: 'available' }],
    }));
  }, []);

  const handleRemoveAvailability = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      availability: (prev.availability || []).filter((_, i) => i !== index),
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.title.trim()) return t('title_required');
    if (!formData.description.trim()) return t('description_required');
    if (!formData.price || parseFloat(formData.price) <= 0) return t('valid_price_required');
    if (!formData.address.city.trim()) return t('city_required');
    if (formData.images.length === 0) return t('at_least_one_image_required');
    if (['for-rent', 'office-rent'].includes(formData.category)) {
      if (!formData.rentalPeriod) return t('rental_period_required');
      if ((formData.availability || []).length > 0) {
        for (const avail of formData.availability || []) {
          if (!avail.startDate || !avail.endDate) return t('availability_dates_required');
          if (new Date(avail.endDate) <= new Date(avail.startDate)) return t('end_date_after_start');
        }
      }
    }
    return null;
  }, [formData, t]);

  const uploadImages = useCallback(async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(t('failed_to_upload_image'));
      }
      const data = await response.json();
      urls.push(data.url);
    }
    return urls;
  }, [t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationError = validateForm();
      if (validationError) {
        toast({
          title: t('error'),
          description: validationError,
          variant: 'destructive',
        });
        return;
      }

      if (!user?._id) {
        toast({
          title: t('error'),
          description: t('login_required'),
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      setIsLoading(true);
      try {
        // Upload images
        const imageFiles = formData.images.map((img) => img.file).filter((file): file is File => !!file);
        let uploadedUrls: string[] = [];
        if (imageFiles.length > 0) {
          uploadedUrls = await uploadImages(imageFiles);
        }

        const submitData = {
          ...formData,
          images: formData.images.map((img, index) => ({
            url: img.file ? uploadedUrls.shift() || img.url : img.url,
            caption: img.caption,
            isMain: img.isMain,
          })),
          price: parseFloat(formData.price),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
          bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : 0,
          area: formData.area ? parseFloat(formData.area) : 0,
          location: formData.address.latitude && formData.address.latitude && formData.address.longitude ? {
            type: 'Point',
            coordinates: [formData.address.longitude, formData.address.latitude],
          } : undefined,
          availability: ['for-rent', 'office-rent'].includes(formData.category) ? formData.availability : undefined,
        };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast({
              title: t('error'),
              description: t('session_expired'),
              variant: 'destructive',
            });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || t('failed_to_add_property'));
        }

        const data = await response.json();

        // Create notification for admin or agent
        await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: 'admin', // Or agent ID if applicable
            title: t('new_property_submitted'),
            message: t('new_property_added', { title: formData.title }),
            link: `/properties/${data.data._id}`,
          }),
        });

        toast({ title: t('success'), description: t('property_added_successfully') });
        navigate('/properties');
      } catch (error: any) {
        console.error('Error adding property:', error);
        toast({
          title: t('error'),
          description: error.message || t('failed_to_add_property'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, user, validateForm, uploadImages, toast, t, navigate]
  );

  const isRental = ['for-rent', 'office-rent'].includes(formData.category);
  const availableAmenities = [
    'Pool',
    'Gym',
    'Parking',
    'Balcony',
    'Garden',
    'Security',
    'Air Conditioning',
    'Terrace',
    'Internet',
    'Elevator',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12" id="main-content">
        <h1 className="text-3xl font-bold mb-6" aria-label={t('add_new_property')}>
          {t('add_new_property')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6" aria-label={t('add_property_form')}>
          <div>
            <Label htmlFor="title">{t('title')}</Label>
            <Input
              id="title"
              name="title"
              placeholder={t('title')}
              value={formData.title}
              onChange={handleChange}
              required
              aria-describedby="title-help"
            />
            <p id="title-help" className="text-sm text-gray-500 mt-1">
              {t('title_help')}
            </p>
          </div>
          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              name="description"
              placeholder={t('description')}
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              maxLength={2000}
              aria-describedby="description-help"
            />
            <p id="description-help" className="text-sm text-gray-500 mt-1">
              {t('description_help')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{t('price')}</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder={t('price')}
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                aria-describedby="price-help"
              />
              <p id="price-help" className="text-sm text-gray-500 mt-1">
                {t('price_help')}
              </p>
            </div>
            <div>
              <Label htmlFor="currency">{t('currency')}</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleSelectChange('currency', value)}
              >
                <SelectTrigger id="currency" aria-label={t('currency')}>
                  <SelectValue placeholder={t('currency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="MUR">MUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">{t('category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger id="category" aria-label={t('category')}>
                  <SelectValue placeholder={t('category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="for-sale">{t('for_sale')}</SelectItem>
                  <SelectItem value="for-rent">{t('for_rent')}</SelectItem>
                  <SelectItem value="offices">{t('offices')}</SelectItem>
                  <SelectItem value="office-rent">{t('office_rent')}</SelectItem>
                  <SelectItem value="land">{t('land')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">{t('type')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type" aria-label={t('type')}>
                  <SelectValue placeholder={t('type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">{t('apartment')}</SelectItem>
                  <SelectItem value="House">{t('house')}</SelectItem>
                  <SelectItem value="Villa">{t('villa')}</SelectItem>
                  <SelectItem value="Penthouse">{t('penthouse')}</SelectItem>
                  <SelectItem value="Duplex">{t('duplex')}</SelectItem>
                  <SelectItem value="Land">{t('land')}</SelectItem>
                  <SelectItem value="Office">{t('office')}</SelectItem>
                  <SelectItem value="Commercial">{t('commercial')}</SelectItem>
                  <SelectItem value="Other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isRental && (
            <div>
              <Label htmlFor="rentalPeriod">{t('rental_period')}</Label>
              <Select
                value={formData.rentalPeriod}
                onValueChange={(value) => handleSelectChange('rentalPeriod', value)}
              >
                <SelectTrigger id="rentalPeriod" aria-label={t('rental_period')}>
                  <SelectValue placeholder={t('rental_period')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">{t('day')}</SelectItem>
                  <SelectItem value="month">{t('month')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="address.street">{t('street')}</Label>
            <Input
              id="address.street"
              name="address.street"
              placeholder={t('street')}
              value={formData.address.street}
              onChange={handleChange}
              aria-describedby="street-help"
            />
            <p id="street-help" className="text-sm text-gray-500 mt-1">
              {t('street_help')}
            </p>
          </div>
          <div>
            <Label htmlFor="address.city">{t('city')}</Label>
            <Input
              id="address.city"
              name="address.city"
              placeholder={t('city')}
              value={formData.address.city}
              onChange={handleChange}
              required
              aria-describedby="city-help"
            />
            <p id="city-help" className="text-sm text-gray-500 mt-1">
              {t('city_help')}
            </p>
          </div>
          <div>
            <Label htmlFor="address.zipCode">{t('zip_code')}</Label>
            <Input
              id="address.zipCode"
              name="address.zipCode"
              placeholder={t('zip_code')}
              value={formData.address.zipCode}
              onChange={handleChange}
              aria-describedby="zipCode-help"
            />
            <p id="zipCode-help" className="text-sm text-gray-500 mt-1">
              {t('zip_code_help')}
            </p>
          </div>
          <div>
            <Label htmlFor="address.country">{t('country')}</Label>
            <Input
              id="address.country"
              name="address.country"
              placeholder={t('country')}
              value={formData.address.country}
              onChange={handleChange}
              required
              aria-describedby="country-help"
            />
            <p id="country-help" className="text-sm text-gray-500 mt-1">
              {t('country_help')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address.latitude">{t('latitude')}</Label>
              <Input
                id="address.latitude"
                name="address.latitude"
                type="number"
                placeholder={t('latitude')}
                value={formData.address.latitude || ''}
                onChange={handleChange}
                step="0.000001"
                aria-describedby="latitude-help"
              />
              <p id="latitude-help" className="text-sm text-gray-500 mt-1">
                {t('latitude_help')}
              </p>
            </div>
            <div>
              <Label htmlFor="address.longitude">{t('longitude')}</Label>
              <Input
                id="address.longitude"
                name="address.longitude"
                type="number"
                placeholder={t('longitude')}
                value={formData.address.longitude || ''}
                onChange={handleChange}
                step="0.000001"
                aria-describedby="longitude-help"
              />
              <p id="longitude-help" className="text-sm text-gray-500 mt-1">
                {t('longitude_help')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bedrooms">{t('bedrooms')}</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                placeholder={t('bedrooms')}
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                aria-describedby="bedrooms-help"
              />
              <p id="bedrooms-help" className="text-sm text-gray-500 mt-1">
                {t('bedrooms_help')}
              </p>
            </div>
            <div>
              <Label htmlFor="bathrooms">{t('bathrooms')}</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                placeholder={t('bathrooms')}
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                step="0.5"
                aria-describedby="bathrooms-help"
              />
              <p id="bathrooms-help" className="text-sm text-gray-500 mt-1">
                {t('bathrooms_help')}
              </p>
            </div>
            <div>
              <Label htmlFor="area">{t('area')}</Label>
              <Input
                id="area"
                name="area"
                type="number"
                placeholder={t('area_sqm')}
                value={formData.area}
                onChange={handleChange}
                min="0"
                step="0.1"
                aria-describedby="area-help"
              />
              <p id="area-help" className="text-sm text-gray-500 mt-1">
                {t('area_help')}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">{t('amenities')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityChange(amenity)}
                    aria-label={t(amenity.toLowerCase().replace(/\s+/g, '_'))}
                  />
                  <Label htmlFor={`amenity-${amenity}`}>
                    {t(amenity.toLowerCase().replace(/\s+/g, '_'))}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">{t('images')}</h3>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              aria-label={t('upload_images')}
            />
            <p className="text-sm text-gray-500 mt-1">{t('images_help')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.url}
                    alt={`${t('property_image')} ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                    loading="lazy"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1"
                    onClick={() => handleRemoveImage(index)}
                    aria-label={t('remove_image')}
                  >
                    X
                  </Button>
                  <Button
                    variant={img.isMain ? 'default' : 'outline'}
                    size="sm"
                    className="absolute bottom-1 left-1"
                    onClick={() => handleSetMainImage(index)}
                    aria-label={img.isMain ? t('main_image') : t('set_as_main_image')}
                  >
                    {img.isMain ? t('main') : t('set_main')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="virtualTourUrl">{t('virtual_tour_url')}</Label>
            <Input
              id="virtualTourUrl"
              name="virtualTourUrl"
              placeholder={t('virtual_tour_url')}
              value={formData.virtualTourUrl}
              onChange={handleChange}
              aria-describedby="virtualTourUrl-help"
            />
            <p id="virtualTourUrl-help" className="text-sm text-gray-500 mt-1">
              {t('virtual_tour_url_help')}
            </p>
          </div>
          <div>
            <Label htmlFor="videoUrl">{t('video_url')}</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              placeholder={t('video_url')}
              value={formData.videoUrl}
              onChange={handleChange}
              aria-describedby="videoUrl-help"
            />
            <p id="videoUrl-help" className="text-sm text-gray-500 mt-1">
              {t('video_url_help')}
            </p>
          </div>
          {isRental && (
            <div>
              <h3 className="text-lg font-bold mb-2">{t('availability')}</h3>
              {(formData.availability || []).map((avail, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 mb-2">
                  <div className="flex-1">
                    <Label htmlFor={`startDate-${index}`}>{t('start_date')}</Label>
                    <Input
                      id={`startDate-${index}`}
                      type="date"
                      value={avail.startDate}
                      onChange={(e) => handleAvailabilityChange(index, 'startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      aria-label={t('start_date')}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`endDate-${index}`}>{t('end_date')}</Label>
                    <Input
                      id={`endDate-${index}`}
                      type="date"
                      value={avail.endDate}
                      onChange={(e) => handleAvailabilityChange(index, 'endDate', e.target.value)}
                      min={avail.startDate || new Date().toISOString().split('T')[0]}
                      aria-label={t('end_date')}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveAvailability(index)}
                    aria-label={t('remove_availability')}
                    className="mt-6"
                  >
                    X
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddAvailability}
                className="mt-2"
                aria-label={t('add_availability')}
              >
                {t('add_availability')}
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked === true }))}
              disabled={user?.subscription?.plan === 'basic'}
              aria-label={t('feature_property')}
            />
            <Label htmlFor="isFeatured">
              {t('feature_property')} {user?.subscription?.plan === 'basic' ? t('elite_platinum_only') : ''}
            </Label>
          </div>
          <Button type="submit" disabled={isLoading} aria-label={t('add_property')}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t('add_property')
            )}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AddProperty;