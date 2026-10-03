import React, { useState, useEffect } from 'react';
import { supabase } from '../../library/supabase';
import {
  Star,
  TrendingUp,
  Zap,
  Tag,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Link as LinkIcon,
  Info,
  Layers,
  X,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  collections: string[];
}

export interface HeroBanner {
  id: string;
  title: string;
  image_url: string;
  cta_link: string;
  is_active: boolean;
}

type CollectionType = 'new_arrivals' | 'recommended' | 'best_sellers' | 'sale';

const LOCAL_STORAGE_KEY = 'lakshya_hero_banners';

export default function AdminMerchandising() {
  const [activeTab, setActiveTab] = useState<'banners' | 'collections'>('banners');

  // Banners state
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState(false);

  // Simple Form inputs
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Collections state
  const [activeCollection, setActiveCollection] = useState<CollectionType>('new_arrivals');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [collections, setCollections] = useState<Record<CollectionType, string[]>>({
    new_arrivals: [],
    recommended: [],
    best_sellers: [],
    sale: [],
  });

  const fileRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    loadBanners();
  }, []);

  // Load banners from LocalStorage & Supabase
  async function loadBanners() {
    let loaded: HeroBanner[] = [];

    // 1. Try LocalStorage first for instant local persistence
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        loaded = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // 2. Try fetching from Supabase if table exists
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        loaded = data.map((b: any) => ({
          id: String(b.id),
          title: b.title || 'Banner',
          image_url: b.image_url || '',
          cta_link: b.cta_link || '',
          is_active: b.is_active ?? true,
        }));
      }
    } catch {
      // Supabase table might not exist yet, fallback to localStorage
    }

    setBanners(loaded);
  }

  function saveBannersToStorage(updated: HeroBanner[]) {
    setBanners(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, brand, price, image, collections')
      .order('id', { ascending: false });

    if (!error && data) {
      setProducts(data);
      const loadedCollections: Record<CollectionType, string[]> = {
        new_arrivals: [],
        recommended: [],
        best_sellers: [],
        sale: [],
      };

      data.forEach((p) => {
        const pCol: string[] = p.collections || [];
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

  // Handle local file upload for Hero Banner
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const safeName = `banner_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const path = `banners/${safeName}`;

      const { data, error } = await supabase.storage.from('product-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
        setImageUrl(urlData.publicUrl);
      } else {
        // Fallback: convert to base64 DataURL if storage bucket upload returns RLS error
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImageUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    }
    setBannerUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const openBannerForm = (banner?: HeroBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setTitle(banner.title);
      setImageUrl(banner.image_url || '');
      setCtaLink(banner.cta_link || '');
      setIsActive(banner.is_active ?? true);
    } else {
      setEditingBanner(null);
      setTitle('');
      setImageUrl('');
      setCtaLink(products[0] ? `/product/${products[0].id}` : '/category/rackets');
      setIsActive(true);
    }
    setIsFormOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      alert('Please upload a banner image or paste an image URL!');
      return;
    }

    const newBanner: HeroBanner = {
      id: editingBanner?.id || `banner_${Date.now()}`,
      title: title.trim() || 'Custom Promo Banner',
      image_url: imageUrl.trim(),
      cta_link: ctaLink.trim() || (products[0] ? `/product/${products[0].id}` : '/category/rackets'),
      is_active: isActive,
    };

    let updated: HeroBanner[] = [];
    if (editingBanner) {
      updated = banners.map((b) => (b.id === editingBanner.id ? newBanner : b));
    } else {
      updated = [newBanner, ...banners];
    }

    saveBannersToStorage(updated);

    // Also attempt saving to Supabase if table exists
    try {
      await supabase.from('hero_banners').upsert([{
        id: newBanner.id,
        title: newBanner.title,
        image_url: newBanner.image_url,
        cta_link: newBanner.cta_link,
        is_active: newBanner.is_active
      }]);
    } catch {
      // ignore table missing error
    }

    setIsFormOpen(false);
    setBannerSuccess(true);
    setTimeout(() => setBannerSuccess(false), 3000);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner slide?')) return;
    const updated = banners.filter((b) => b.id !== id);
    saveBannersToStorage(updated);

    try {
      await supabase.from('hero_banners').delete().eq('id', id);
    } catch {
      // ignore
    }
  };

  const toggleBannerActive = async (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b));
    saveBannersToStorage(updated);
  };

  const toggleProductInCollection = (productId: string) => {
    setCollections((prev) => {
      const currentList = prev[activeCollection];
      const isSelected = currentList.includes(productId);
      return {
        ...prev,
        [activeCollection]: isSelected
          ? currentList.filter((id) => id !== productId)
          : [...currentList, productId],
      };
    });
  };

  const handleSaveCollections = async () => {
    setSaving(true);
    setShowSuccess(false);

    const updates = products
      .map((p) => {
        const pCollections: string[] = p.collections || [];
        const isCurrentlyInDb = pCollections.includes(activeCollection);
        const isSelectedInUI = collections[activeCollection].includes(p.id);

        if (isSelectedInUI && !isCurrentlyInDb) {
          return { id: p.id, collections: [...pCollections, activeCollection] };
        } else if (!isSelectedInUI && isCurrentlyInDb) {
          return { id: p.id, collections: pCollections.filter((colName: string) => colName !== activeCollection) };
        }
        return null;
      })
      .filter(Boolean);

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
      {/* Header */}
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase mb-1">Storefront Merchandising</h1>
          <p className="text-xs text-gray-500 font-semibold">
            Upload custom promotional banners and manage homepage product showcases.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'banners' ? 'bg-black text-white shadow-xs' : 'text-gray-500 hover:text-black'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Hero Banners
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'collections' ? 'bg-black text-white shadow-xs' : 'text-gray-500 hover:text-black'
            }`}
          >
            <Layers className="w-4 h-4" /> Collections
          </button>
        </div>
      </div>

      {/* ── SECTION 1: HERO BANNERS ── */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          {/* Success Banner Notice */}
          {bannerSuccess && (
            <div className="p-4 bg-green-50 text-green-700 font-bold text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Banner saved successfully and published to homepage!
            </div>
          )}

          {/* Banner Dimensions & Specs Info Box */}
          <div className="bg-gradient-to-r from-neutral-900 via-zinc-900 to-black text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-neutral-800">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                  Custom Banner Dimensions (Nano Banana / Canva / Photoshop)
                </h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Upload your full design image. When clicked by a customer on the homepage, it will redirect directly to your selected product!
                </p>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    📐 Recommended Size: <strong className="text-amber-300">1920 × 600 px</strong>
                  </span>
                  <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    📱 Aspect Ratio: <strong className="text-amber-300">16 : 5 (3.2:1)</strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => openBannerForm()}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Upload New Banner
            </button>
          </div>

          {/* Upload Form Modal */}
          {isFormOpen && (
            <form onSubmit={handleSaveBanner} className="bg-white border-2 border-black rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                  {editingBanner ? 'Edit Banner' : 'Upload New Custom Banner'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-gray-400 hover:text-black rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title / Internal Name */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1">
                  Banner Name / Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nano Banana Astrox Sale Banner"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-black"
                />
              </div>

              {/* Upload Image Section */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1">
                  Banner Image File *
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL or click upload →"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-black"
                    />
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerFileUpload} />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={bannerUploading}
                      className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-xl hover:bg-neutral-800 transition flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {bannerUploading ? 'Uploading...' : 'Choose Image File'}
                    </button>
                  </div>

                  {/* Preview box */}
                  {imageUrl.trim() && (
                    <div className="relative aspect-[3.2/1] w-full max-h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        Preview
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Redirect Link Picker */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1">
                  Redirect Link (Where to go when clicked) *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. /product/YOUR_PRODUCT_ID or /category/rackets"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-black"
                  />
                  {products.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase">Quick Pick Product:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) setCtaLink(`/product/${e.target.value}`);
                        }}
                        className="border border-gray-200 rounded-lg p-1.5 text-xs font-semibold bg-gray-50 flex-1"
                      >
                        <option value="">— Select product from your catalog —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.brand} - {p.name} (₹{p.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Display this banner slide on homepage
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2 border border-gray-300 rounded-xl text-xs font-bold uppercase hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase hover:bg-neutral-800 transition"
                >
                  Save & Publish Banner
                </button>
              </div>
            </form>
          )}

          {/* Banner Cards List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Uploaded Banners ({banners.length})
            </h3>

            {banners.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-3">
                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-600">No custom banners uploaded yet.</p>
                <p className="text-xs text-gray-400">
                  Click "Upload New Banner" above to add custom promo banners created in Nano Banana or Photoshop!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className={`bg-white border rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs transition ${
                      b.is_active ? 'border-gray-200 hover:border-black' : 'border-gray-100 opacity-60 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Thumbnail preview */}
                      <div className="w-32 h-16 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                        {b.image_url ? (
                          <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {b.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <h4 className="font-black text-gray-900 text-sm mt-1 line-clamp-1">{b.title}</h4>
                        <p className="text-[11px] font-bold text-red-600 mt-0.5 flex items-center gap-1">
                          <LinkIcon className="w-3.5 h-3.5" /> When clicked $\rightarrow$ {b.cta_link}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => toggleBannerActive(b.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                          b.is_active ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {b.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => openBannerForm(b)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-1.5 text-gray-300 hover:text-red-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 2: PRODUCT COLLECTIONS ── */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-xl shadow-xs">
            <div>
              <h2 className="text-sm font-black uppercase text-gray-900">
                {collectionTabs.find((t) => t.id === activeCollection)?.label}
              </h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                Check the box to feature products in this collection section on the homepage.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {showSuccess && (
                <span className="text-xs font-bold text-green-600 uppercase flex items-center gap-1 transition-all">
                  <CheckCircle2 className="w-4 h-4" /> Saved Successfully
                </span>
              )}
              <button
                onClick={handleSaveCollections}
                disabled={saving || loading}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition flex items-center gap-2 ${
                  saving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Collection Changes'}
              </button>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto">
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
            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-gray-400">Loading catalog...</div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white shadow-xs z-10">
                    <tr className="border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      <th className="p-4 w-12 text-center">Select</th>
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
      )}
    </div>
  );
}