import { useState, useEffect } from 'react';
import { supabase } from '../../library/supabase';
import { Star, TrendingUp, Zap, Tag, Save, CheckCircle2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  collections: string[];
}

type CollectionType = 'new_arrivals' | 'recommended' | 'best_sellers' | 'sale';

export default function AdminMerchandising() {
  const [activeCollection, setActiveCollection] = useState<CollectionType>('new_arrivals');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [collections, setCollections] = useState<Record<CollectionType, string[]>>({
    new_arrivals: [],
    recommended: [],
    best_sellers: [],
    sale: []
  });

  useEffect(() => {
    fetchProducts();
  }, []);
async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('id, name, brand, price, image, collections').order('id', { ascending: false });
    
    if (!error && data) {
      setProducts(data);
      
      const loadedCollections: Record<CollectionType, string[]> = {
        new_arrivals: [], recommended: [], best_sellers: [], sale: []
      };

      data.forEach((p) => {
        const pCol: string[] = p.collections || [];
        // Fixed: Renamed 'c' to 'colName' and explicitly typed it as a string
        pCol.forEach((colName: string) => {
          if (loadedCollections[colName as CollectionType]) {
            loadedCollections[colName as CollectionType].push(p.id);
          }
        });
      });
      
      setCollections(loadedCollections);
    }
    setLoading(false);
  }


  const toggleProductInCollection = (productId: string) => {
    setCollections((prev) => {
      const currentList = prev[activeCollection];
      const isSelected = currentList.includes(productId);
      
      return {
        ...prev,
        [activeCollection]: isSelected 
          ? currentList.filter(id => id !== productId) 
          : [...currentList, productId]
      };
    });
  };

   const handleSave = async () => {
    setSaving(true);
    setShowSuccess(false);

    const updates = products.map((p) => {
      const pCollections: string[] = p.collections || [];
      const isCurrentlyInDb = pCollections.includes(activeCollection);
      const isSelectedInUI = collections[activeCollection].includes(p.id);

      if (isSelectedInUI && !isCurrentlyInDb) {
        return { id: p.id, collections: [...pCollections, activeCollection] };
      } else if (!isSelectedInUI && isCurrentlyInDb) {
        // Fixed: Renamed 'c' to 'colName' and explicitly typed it
        return { id: p.id, collections: pCollections.filter((colName: string) => colName !== activeCollection) };
      }
      return null;
    }).filter(Boolean);

    for (const update of updates) {
      if (update) {
        await supabase.from('products').update({ collections: update.collections }).eq('id', update.id);
      }
    }

    await fetchProducts(); 
    setSaving(false);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const collectionTabs = [
    { id: 'new_arrivals', label: 'New Arrivals', icon: Zap },
    { id: 'recommended', label: 'Recommended', icon: Star },
    { id: 'best_sellers', label: 'Best Sellers', icon: TrendingUp },
    { id: 'sale', label: 'On Sale', icon: Tag },
  ];

  return (
    <div>
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase mb-1">Merchandising</h1>
          <p className="text-xs text-gray-500 font-semibold">Select products and save to update your storefront instantly.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {showSuccess && (
            <span className="text-xs font-bold text-green-600 uppercase flex items-center gap-1 transition-all">
              <CheckCircle2 className="w-4 h-4" /> Saved Successfully
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving || loading}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition flex items-center gap-2 ${
              saving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto">
        {collectionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCollection(tab.id as CollectionType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCollection === tab.id 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-black uppercase text-gray-900">
              {collectionTabs.find(t => t.id === activeCollection)?.label}
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
              Check the box to display the product on the homepage in this section.
            </p>
          </div>
          <span className="bg-black text-white px-2 py-1 rounded text-[10px] font-bold">
            {collections[activeCollection].length} Selected
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-gray-400">Loading catalog...</div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white shadow-xs z-10">
                <tr className="border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">Status</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
                {products.map((p) => {
                  const isSelected = collections[activeCollection].includes(p.id);
                  return (
                    <tr 
                      key={p.id} 
                      className={`transition cursor-pointer ${isSelected ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}
                      onClick={() => toggleProductInCollection(p.id)}
                    >
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black cursor-pointer"
                        />
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.image} alt="" className="w-8 h-8 object-contain rounded bg-white border border-gray-100 p-0.5" />
                        <span className="font-bold text-gray-900">{p.name}</span>
                      </td>
                      <td className="p-4 text-gray-500 uppercase text-[10px]">{p.brand}</td>
                      <td className="p-4 font-bold">₹{p.price.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}