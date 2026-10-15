import React, { useState, useEffect } from 'react';
import { supabase } from '../../library/supabase';
import { Plus, Edit3, Trash2, CheckCircle2, AlertCircle, Search, X, ImagePlus, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface Variant {
  name: string;
  stock: number;
}

// Each color has its own image gallery
interface ColorOption {
  name: string;
  image: string;      // thumbnail / swatch image URL
  images?: string[];  // full gallery for this color
}

// Matches the EXACT Supabase products table columns:
// id, name, brand, category, series, tier, price, original_price,
// stock, images, image, specs, description, variants, colors, collections, created_at
interface Product {
  id?: string;
  name: string;
  brand: string;
  category: string;
  series?: string;       // e.g. "Astrox Series"
  tier?: string;         // used as display badge e.g. "Pro Choice", "Best Seller"
  price: number;
  original_price: number;
  description: string;
  specs?: string;        // technical specifications
  image: string;
  images: string[];
  stock: number;
  variants: Variant[];
  colors?: ColorOption[];
  collections?: string[];
}

const CATEGORIES = [
  'rackets', 'shoes', 'shuttles', 'grips-and-strings', 'kitbags',
  'cricket-bats-english', 'cricket-bats-kashmir', 'cricket-balls', 'cricket-protection',
  'football-balls', 'football-boots', 'football-accessories',
  'carrom', 'volleyball', 'basketball', 'throwball',
];

const COLLECTIONS = ['new_arrivals', 'featured', 'best_sellers', 'sale'];

// Maps to 'tier' column in Supabase (used as a display badge on product cards)
const TIER_OPTIONS = ['', 'Pro Choice', 'Best Seller', 'Tournament', 'Club Standard', 'New Arrival', 'Value Pack', 'Grade 1', 'Match Grade'];

// Supabase storage bucket name for product images
const STORAGE_BUCKET = 'product-images';

export const SUPABASE_STORAGE_SQL = `-- Copy & Paste into Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)

-- 1. Create the storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to view uploaded images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 3. Allow public uploads from the admin page
CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');`;

// ─── Upload helper: sends file to Supabase Storage, returns public URL ───────
async function uploadImageToSupabase(
  file: File,
  onProgress?: (msg: string) => void
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `uploads/${safeName}`;

  onProgress?.('Uploading...');

  let { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  // If bucket not found, attempt auto-creation
  if (error && (error.message?.toLowerCase().includes('bucket not found') || (error as any).statusCode === '404')) {
    onProgress?.('Creating storage bucket...');
    try {
      await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
      const retry = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });
      data = retry.data;
      error = retry.error;
    } catch {
      // Creation might require service role key, fallback to detailed error below
    }
  }

  if (error) {
    if (error.message?.includes('row-level security') || error.message?.includes('policy') || error.message?.includes('RLS')) {
      throw new Error(
        'Upload blocked by Supabase policy. Run the SQL snippet shown below in your Supabase SQL Editor to enable public uploads.'
      );
    }
    if (error.message?.toLowerCase().includes('bucket not found') || (error as any).statusCode === '404') {
      throw new Error(
        'Bucket "product-images" not found in Supabase. Please run the SQL snippet in Supabase SQL Editor or paste image URLs directly!'
      );
    }
    throw new Error(error.message);
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data!.path);
  onProgress?.('Done');
  return urlData.publicUrl;
}

// ─── ImageRow: URL paste + file upload ───────────────────────────────────────
function ImageRow({
  value,
  onChange,
  onRemove,
  placeholder = 'Image URL',
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  placeholder?: string;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const publicUrl = await uploadImageToSupabase(file);
      onChange(publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    }
    setUploading(false);
    // Reset so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {/* Tiny preview */}
        <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {value.trim() ? (
            <img src={value} alt="" className="w-full h-full object-contain" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
          ) : (
            <ImagePlus className="w-4 h-4 text-gray-300" />
          )}
        </div>

        {/* URL Input */}
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border border-gray-200 rounded-lg p-2 text-xs font-semibold outline-none focus:border-black transition"
        />

        {/* Upload button */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={`px-2.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border transition flex items-center gap-1.5 shrink-0 ${
            uploading
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-wait'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-black'
          }`}
          title="Upload from device"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? '...' : 'Upload'}
        </button>

        {/* Remove */}
        <button type="button" onClick={onRemove} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {uploadError && (
        <p className="text-[10px] text-red-500 font-semibold pl-12">{uploadError}</p>
      )}
    </div>
  );
}

interface ColorOption {
  name: string;
  image: string;      // thumbnail / swatch image URL
  images?: string[];  // full gallery for this color
  variants?: Variant[]; // sizes & stock specific to THIS color
}

// ─── Color card with expandable image gallery & per-color stock ──────────────
function ColorCard({
  color,
  onChange,
  onRemove,
}: {
  color: ColorOption;
  onChange: (updated: ColorOption) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const colorImages = color.images || [];
  const colorVariants = color.variants || [];

  const addImage = () => onChange({ ...color, images: [...colorImages, ''] });
  const updateImage = (i: number, val: string) => {
    const imgs = [...colorImages];
    imgs[i] = val;
    onChange({ ...color, images: imgs });
  };
  const removeImage = (i: number) => onChange({ ...color, images: colorImages.filter((_, idx) => idx !== i) });

  const addVariant = () => onChange({ ...color, variants: [...colorVariants, { name: '', stock: 5 }] });
  const updateVariant = (i: number, updated: Variant) => {
    const vars = [...colorVariants];
    vars[i] = updated;
    onChange({ ...color, variants: vars });
  };
  const removeVariant = (i: number) => onChange({ ...color, variants: colorVariants.filter((_, idx) => idx !== i) });

  const totalColorStock = colorVariants.length > 0
    ? colorVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        {/* Swatch preview */}
        <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {color.image.trim() ? (
            <img src={color.image} alt="" className="w-full h-full object-contain" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
          ) : (
            <ImagePlus className="w-5 h-5 text-gray-300" />
          )}
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase mb-0.5 block">Color Name</label>
            <input
              type="text"
              placeholder="e.g. MIDNIGHT BLUE"
              value={color.name}
              onChange={(e) => onChange({ ...color, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase mb-0.5 block">Swatch Image URL</label>
            <input
              type="url"
              placeholder="Thumbnail URL"
              value={color.image}
              onChange={(e) => onChange({ ...color, image: e.target.value })}
              className="w-full border border-gray-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-black rounded-lg transition"
            title={expanded ? 'Collapse' : 'Manage images & per-color sizes/stock'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button type="button" onClick={onRemove} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable: per-color image gallery & per-color size/stock matrix */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/70 space-y-4">
          {/* Gallery Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">
                Photo Gallery for "{color.name || 'this color'}" ({colorImages.length} image{colorImages.length !== 1 ? 's' : ''})
              </p>
              <button
                type="button"
                onClick={addImage}
                className="text-[10px] font-black uppercase tracking-wider text-black bg-white border border-gray-200 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition shadow-2xs"
              >
                <Plus className="w-3 h-3" /> Add Image
              </button>
            </div>

            {colorImages.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-2 bg-white rounded-lg border border-dashed border-gray-200">
                No images yet. Click "+ Add Image" to add photos for this color.
              </p>
            ) : (
              <div className="space-y-2">
                {colorImages.map((img, i) => (
                  <ImageRow
                    key={i}
                    value={img}
                    onChange={(val) => updateImage(i, val)}
                    onRemove={() => removeImage(i)}
                    placeholder={i === 0 ? 'Main photo for this color' : `Angle ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sizes & Stock for THIS specific color */}
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">
                  Sizes & Stock for "{color.name || 'this color'}"
                </p>
                <p className="text-[9px] text-gray-400 font-medium">
                  Set stock levels for each size in this specific color.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="text-[10px] font-black uppercase tracking-wider text-white bg-black px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-neutral-800 transition shadow-2xs"
              >
                <Plus className="w-3 h-3" /> Add Size for {color.name || 'Color'}
              </button>
            </div>

            {colorVariants.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-2 bg-white rounded-lg border border-dashed border-gray-200">
                No size stocks configured for this color yet. Click "+ Add Size for {color.name || 'Color'}" to add per-color inventory.
              </p>
            ) : (
              <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-200">
                {colorVariants.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Size (e.g. UK 7, 4U/G5)"
                      value={v.name}
                      onChange={(e) => updateVariant(i, { ...v, name: e.target.value })}
                      className="flex-1 border border-gray-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-black"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Stock:</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(i, { ...v, stock: Number(e.target.value) })}
                        className="w-20 border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-right outline-none focus:border-black"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="p-1 text-gray-300 hover:text-red-500 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {totalColorStock !== null && (
                  <div className="pt-2 border-t border-gray-100 text-right">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      Total stock for {color.name || 'this color'}: <strong className="text-black">{totalColorStock} pcs</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State — field names match Supabase column names exactly
  const [productId, setProductId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [series, setSeries] = useState('');          // DB col: series
  const [tier, setTier] = useState('');              // DB col: tier (shown as badge on cards)
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState('');            // DB col: specs
  const [baseStock, setBaseStock] = useState<number | ''>(10);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [colors, setColors] = useState<ColorOption[]>([{ name: 'DEFAULT', image: '', images: [] }]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // List filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  }

  const resetForm = () => {
    setProductId(null);
    setName('');
    setBrand('');
    setCategory(CATEGORIES[0]);
    setSeries('');
    setTier('');
    setPrice('');
    setOriginalPrice('');
    setDescription('');
    setSpecs('');
    setBaseStock(10);
    setVariants([]);
    setColors([{ name: 'DEFAULT', image: '', images: [] }]);
    setSelectedCollections([]);
  };

  const handleEditClick = (p: Product) => {
    setProductId(p.id || null);
    setName(p.name || '');
    setBrand(p.brand || '');
    setCategory(p.category || CATEGORIES[0]);
    setSeries(p.series || '');
    setTier(p.tier || '');
    setPrice(p.price || '');
    setOriginalPrice(p.original_price || '');
    setDescription(p.description || '');
    setSpecs(p.specs || '');
    setBaseStock(p.stock ?? 10);
    setVariants(p.variants || []);
    
    // If product has colors, load them and preserve per-color variants
    if (p.colors && p.colors.length > 0) {
      setColors(p.colors.map(c => ({
        name: c.name,
        image: c.image || '',
        images: (c as any).images || [],
        variants: (c as any).variants || []
      })));
    } else {
      const fallbackImage = p.image || (p.images && p.images[0]) || '';
      const fallbackImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
      setColors([{ name: 'DEFAULT', image: fallbackImage, images: fallbackImages, variants: p.variants || [] }]);
    }

    setSelectedCollections(p.collections || []);
    setActiveTab('editor');
    setStatusMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const cleanColors = colors.filter(c => c.name.trim() !== '').map(c => ({
      name: c.name.trim(),
      image: c.image.trim(),
      images: (c.images || []).map(u => u.trim()).filter(Boolean),
      variants: (c.variants || []).filter(v => v.name.trim() !== '').map(v => ({
        name: v.name.trim(),
        stock: Number(v.stock) || 0
      }))
    }));

    // Calculate total stock from per-color variants, top-level variants, or baseStock
    const hasPerColorVariants = cleanColors.some(c => c.variants && c.variants.length > 0);
    const calculatedStock = hasPerColorVariants
      ? cleanColors.reduce((acc, c) => acc + (c.variants || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0), 0)
      : (variants.length > 0
          ? variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0)
          : Number(baseStock) || 0);

    // Derive primary image & all images array automatically from color options
    const allColorImages = Array.from(
      new Set(cleanColors.flatMap(c => [c.image, ...(c.images || [])]).filter(Boolean))
    );
    const mainImage = cleanColors[0]?.image || cleanColors[0]?.images?.[0] || allColorImages[0] || '';

    // Payload maps to existing Supabase columns
    const payload: any = {
      name: name.trim(),
      brand: brand.trim(),
      category,
      series: series.trim() || null,
      tier: tier.trim() || null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : Number(price),
      description: description.trim(),
      specs: specs.trim() || null,
      image: mainImage,
      images: allColorImages,
      stock: calculatedStock,
      variants: variants.filter(v => v.name.trim() !== ''),
      colors: cleanColors,
      collections: selectedCollections,
    };

    const { error } = productId
      ? await supabase.from('products').update(payload).eq('id', productId)
      : await supabase.from('products').insert([payload]);

    if (error) {
      setStatusMsg({ text: error.message, type: 'error' });
    } else {
      setStatusMsg({ text: productId ? '✓ Product updated!' : '✓ Product created!', type: 'success' });
      fetchProducts();
      setActiveTab('list');
      resetForm();
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm('Delete this product permanently?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  };

  const toggleCollection = (col: string) =>
    setSelectedCollections(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);

  const filteredProducts = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory === 'ALL' || p.category === filterCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'stock_low') return a.stock - b.stock;
      return 0;
    });

  return (
    <div>
      {/* Sub-Navigation */}
      <div className="flex items-center gap-4 border-b border-gray-200 mb-6 pb-4">
        <button
          onClick={() => { resetForm(); setActiveTab('list'); }}
          className={`text-sm font-black uppercase tracking-wider transition ${activeTab === 'list' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-black'}`}
        >
          All Products
        </button>
        <button
          onClick={() => { resetForm(); setActiveTab('editor'); }}
          className={`text-sm font-black uppercase tracking-wider transition flex items-center gap-1 ${activeTab === 'editor' ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400 hover:text-black'}`}
        >
          <Plus className="w-4 h-4" /> {productId ? 'Edit Product' : 'Add Product'}
        </button>
      </div>

      {statusMsg && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-bold ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {statusMsg.text}
        </div>
      )}

      {/* ── PRODUCT LIST ── */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search products or brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-bold uppercase focus:outline-none focus:border-black bg-white flex-1 sm:flex-initial"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replace(/-/g, ' ')}</option>)}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-bold uppercase focus:outline-none focus:border-black bg-white flex-1 sm:flex-initial"
              >
                <option value="newest">Newest First</option>
                <option value="price_high">Price: High → Low</option>
                <option value="price_low">Price: Low → High</option>
                <option value="stock_low">Low Stock First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading products...</div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Product</th>
                    <th className="p-4 hidden sm:table-cell">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 hidden md:table-cell">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || (p.images && p.images[0]) || ''}
                            alt=""
                            className="w-11 h-11 object-contain rounded-lg bg-gray-50 border border-gray-100 p-1 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1">{p.name}</div>
                            <div className="text-[10px] text-gray-400 uppercase">{p.brand}</div>
                            {p.colors && p.colors.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {p.colors.slice(0, 4).map((c, i) => (
                                  <div key={i} className="w-4 h-4 rounded-full border border-gray-200 bg-gray-100 overflow-hidden">
                                    {c.image && <img src={c.image} alt="" className="w-full h-full object-cover" />}
                                  </div>
                                ))}
                                {p.colors.length > 4 && <span className="text-[9px] text-gray-400 font-bold">+{p.colors.length - 4}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 capitalize hidden sm:table-cell">{p.category.replace(/-/g, ' ')}</td>
                      <td className="p-4 font-bold text-gray-900">₹{p.price?.toLocaleString('en-IN')}</td>
                      <td className="p-4 hidden md:table-cell">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleEditClick(p)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black mr-1 transition">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-600 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-xs text-gray-400 font-bold uppercase">No products found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── EDITOR FORM ── */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Product Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:outline-none focus:border-black transition" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Brand *</label>
                <input type="text" required value={brand} onChange={e => setBrand(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:outline-none focus:border-black transition" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold bg-white focus:outline-none focus:border-black capitalize transition">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replace(/-/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">
                  Series
                  <span className="ml-1 text-[9px] text-gray-400 normal-case font-medium">(DB: series)</span>
                </label>
                <input type="text" value={series} onChange={e => setSeries(e.target.value)}
                  placeholder="e.g. Astrox Series, Power Cushion"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-black transition" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">
                  Display Badge / Tier
                  <span className="ml-1 text-[9px] text-gray-400 normal-case font-medium">(DB: tier)</span>
                </label>
                <select value={tier} onChange={e => setTier(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-bold bg-white focus:outline-none focus:border-black transition">
                  {TIER_OPTIONS.map(t => <option key={t} value={t}>{t || '— None —'}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Collections</label>
              <div className="flex flex-wrap gap-2">
                {COLLECTIONS.map(col => (
                  <button key={col} type="button" onClick={() => toggleCollection(col)}
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border transition ${selectedCollections.includes(col) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-300 hover:border-black'}`}>
                    {col.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">Pricing & Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Price (₹) *</label>
                <input type="number" required value={price} onChange={e => setPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:outline-none focus:border-black transition" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Original / MRP (₹)</label>
                <input type="number" value={originalPrice} onChange={e => setOriginalPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:outline-none focus:border-black transition" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">
                  Base Stock {variants.length > 0 ? '(auto from variants)' : ''}
                </label>
                <input type="number"
                  disabled={variants.length > 0}
                  value={variants.length > 0 ? variants.reduce((a, c) => a + (Number(c.stock) || 0), 0) : baseStock}
                  onChange={e => setBaseStock(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-semibold disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:border-black transition" />
              </div>
            </div>
          </div>

          {/* Colors & Image Galleries */}

          {/* Colors with per-color galleries */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Colors</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Each color can have its own image gallery. Expand ↓ to add per-color images.</p>
              </div>
              <button type="button"
                onClick={() => setColors([...colors, { name: '', image: '', images: [] }])}
                className="bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-neutral-800 transition">
                <Plus className="w-3.5 h-3.5" /> Add Color
              </button>
            </div>
            <div className="space-y-3">
              {colors.map((c, i) => (
                <ColorCard
                  key={i}
                  color={c}
                  onChange={updated => { const newC = [...colors]; newC[i] = updated; setColors(newC); }}
                  onRemove={() => setColors(colors.filter((_, idx) => idx !== i))}
                />
              ))}
              {colors.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No colors added yet. Leave empty for single-color products.</p>
              )}
            </div>
          </div>



          {/* Description & Specs */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">Description & Specifications</h3>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5 flex items-center justify-between">
                <span>Product Description <span className="ml-1 text-[9px] text-gray-400 normal-case font-medium">(DB: description)</span></span>
                <span className="text-[10px] text-gray-400 font-normal">Supports Bold, Italic, Headings & Lists</span>
              </label>
              <RichTextEditor value={description} onChange={setDescription} />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">
                Technical Specs
                <span className="ml-1 text-[9px] text-gray-400 normal-case font-medium">(DB: specs)</span>
              </label>
              <textarea
                rows={3}
                value={specs}
                onChange={e => setSpecs(e.target.value)}
                placeholder="e.g. Weight: 85g | Flex: Stiff | String Tension: 24-27 lbs | Frame: HM Graphite"
                className="w-full border border-gray-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-black transition resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <button type="button" onClick={() => { resetForm(); setActiveTab('list'); }}
              className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit"
              className="px-8 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:bg-neutral-800 transition active:scale-[0.99]">
              {productId ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}