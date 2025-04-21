import { useState, FormEvent } from 'react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/shared/ImageUploader';

interface ProductOption {
  id: number;
  name: string;
}

const NewPromotion = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    affiliateLink: '',
    description: '',
    autoPostToSocial: true
  });

  // Fetch products on component mount
  useState(() => {
    fetchProducts();
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, autoPostToSocial: checked }));
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value ? Number(e.target.value) : '');
  };

  const handleImagesChange = (urls: string[]) => {
    setCustomImages(urls);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId) {
      toast({
        title: 'Error',
        description: 'Please select a product',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.affiliateLink) {
      toast({
        title: 'Error',
        description: 'Please enter an affiliate link',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProductId,
          affiliateLink: formData.affiliateLink,
          description: formData.description,
          customImages,
          autoPostToSocial: formData.autoPostToSocial
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Promotion created successfully!'
        });
        
        // Reset form
        setFormData({
          affiliateLink: '',
          description: '',
          autoPostToSocial: true
        });
        setSelectedProductId('');
        setCustomImages([]);
        setStep(1);
      } else {
        throw new Error(data.message || 'Failed to create promotion');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Create New Promotion</h2>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                Select Product to Promote
              </label>
              <select
                id="product"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedProductId}
                onChange={handleProductSelect}
                required
              >
                <option value="">-- Select a product --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="affiliateLink" className="block text-sm font-medium text-gray-700 mb-1">
                Affiliate Link
              </label>
              <Input
                id="affiliateLink"
                name="affiliateLink"
                type="url"
                placeholder="Enter your affiliate link"
                value={formData.affiliateLink}
                onChange={handleInputChange}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your Amazon affiliate link or other affiliate platform link
              </p>
            </div>
            
            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={!selectedProductId || !formData.affiliateLink}
              className="w-full mt-4"
            >
              Continue
            </Button>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Description (Optional)
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter a custom description for the product"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave empty to use the original product description
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Images (Optional)
              </label>
              <ImageUploader 
                initialImages={customImages} 
                onChange={handleImagesChange} 
                maxImages={5}
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload up to 5 custom images or leave empty to use the original product images
              </p>
            </div>
            
            <div className="flex items-center space-x-2 my-6">
              <Switch
                id="autoPost"
                checked={formData.autoPostToSocial}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="autoPost">
                Automatically post to my connected social media accounts
              </Label>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Promotion'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewPromotion; 