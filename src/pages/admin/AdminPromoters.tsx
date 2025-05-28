import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Building2, Trash2, Pencil } from 'lucide-react';

interface Promoter {
  _id: string;
  name: string;
  status: string;
  address: { city: string; country: string };
}

const AdminPromoters = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromoters = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/admin/promoters`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(t('failed_to_fetch_promoters'));
        }

        const data = await response.json();
        setPromoters(data.data || []);
      } catch (error) {
        toast({
          title: t('error'),
          description: error.message || t('failed_to_load_promoters'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromoters();
  }, [toast, t]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/promoters/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(t('failed_to_delete_promoter'));
      }

      setPromoters(promoters.filter((prom) => prom._id !== id));
      toast({ title: t('success'), description: t('promoter_deleted') });
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message || t('failed_to_delete_promoter'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          {t('promoters')}
        </h1>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : promoters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('no_promoters_found')}
          </div>
        ) : (
          <div className="space-y-4">
            {promoters.map((promoter) => (
              <div
                key={promoter._id}
                className="p-4 rounded-lg shadow bg-white flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold">{promoter.name}</h3>
                  <p className="text-gray-600">
                    {promoter.address.city}, {promoter.address.country}
                  </p>
                  <p className="text-sm capitalize">{t(promoter.status)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={t('edit_promoter', { name: promoter.name })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(promoter._id)}
                    aria-label={t('delete_promoter', { name: promoter.name })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPromoters;