import React, { useState, useEffect } from 'react';
import { supabase } from '../../library/supabase';
import { Plus, Edit3, Trash2, CheckCircle2, AlertCircle, Search, X, ImagePlus, ChevronDown, ChevronUp, Upload } from 'lucide-react';

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

// ─── Upload helper: sends file to Supabase Storage, returns public URL ───────
async function uploadImageToSupabase(
  file: File,
  onProgress?: (msg: string) => void
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `uploads/${safeName}`;

  onProgress?.('Uploading...');

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    // Friendly error for common RLS issue
    if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
      throw new Error(
        'Upload blocked by Storage policy. Go to Supabase Dashboard → Storage → product-images → Policies → Add "INSERT for anon" policy.'
      );
    }
    throw new Error(error.message);
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
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

// ─── Color card with expandable image gallery ─────────────────────────────────
function ColorCard({
  color,
  index,
  onChange,
  onRemove,
}: {
  color: ColorOption;
  index: number;
  onChange: (updated: ColorOption) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const colorImages = color.images || [];

  const addImage = () => onChange({ ...color, images: [...colorImages, ''] });
  const updateImage = (i: number, val: string) => {
    const imgs = [...colorImages];
    imgs[i] = val;
    onChange({ ...color, images: imgs });
  };
  const removeImage = (i: number) => onChange({ ...color, images: colorImages.filter((_, idx) => idx !== i) });

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
            title={expanded ? 'Collapse' : 'Add color images'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button type="button" onClick={onRemove} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable: per-color image gallery */}
      {expanded && (
        <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
              Gallery for "{color.name || 'this color'}" ({colorImages.length} image{colorImages.length !== 1 ? 's' : ''})
            </p>
            <button
              type="button"
              onClick={addImage}
              className="text-[10px] font-black uppercase tracking-wider text-black bg-white border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition"
            >
              <Plus className="w-3 h-3" /> Add Image
            </button>
          </div>

          {colorImages.length === 0 ? (
            <p className="text-[11px] text-gray-400 text-center py-3">
              No images yet. Click "Add Image" to add gallery photos for this color.
            </p>
          ) : (
            <div className="space-y-2">
              {colorImages.map((img, i) => (
                <ImageRow
                  key={i}
                  value={img}
                  onChange={(val) => updateImage(i, val)}
                  onRemove={() => removeImage(i)}
                  placeholder={i === 0 ? 'Main image for this color' : `Angle ${i + 1}`}
                />
              ))}
            </div>
          )}
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
  const [productImages, setProductImages] = useState<string[]>(['']);
  const [baseStock, setBaseStock] = useState<number | ''>(10);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [colors, setColors] = useState<ColorOption[]>([]);
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
    setProductImages(['']);
    setBaseStock(10);
    setVariants([]);
    setColors([]);
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
    setProductImages(p.images?.length ? p.images : [p.image || '']);
    setBaseStock(p.stock ?? 10);
    setVariants(p.variants || []);
    setColors((p.colors || []).map(c => ({ name: c.name, image: c.image, images: (c as any).images || [] })));
    setSelectedCollections(p.collections || []);
    setActiveTab('editor');
    setStatusMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const calculatedStock = variants.length > 0
      ? variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0)
      : Number(baseStock) || 0;

    const cleanImages = productImages.map(u => u.trim()).filter(Boolean);

    // Only include columns that EXIST in the Supabase products table
    const payload: any = {
      name: name.trim(),
      brand: brand.trim(),
      category,
      series: series.trim() || null,          // DB col: series
      tier: tier.trim() || null,              // DB col: tier (display badge)
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : Number(price),
      description: description.trim(),
      specs: specs.trim() || null,            // DB col: specs
      image: cleanImages[0] || '',
      images: cleanImages,
      stock: calculatedStock,
      variants: variants.filter(v => v.name.trim() !== ''),
      colors: colors.filter(c => c.name.trim() !== '').map(c => ({
        name: c.name.trim(),
        image: c.image.trim(),
        images: (c.images || []).map(u => u.trim()).filter(Boolean),
      })),
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

          {/* Product Images */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Product Images</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">First image is the main display image. Add multiple angles.</p>
              </div>
              <button type="button" onClick={() => setProductImages([...productImages, ''])}
                className="bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-neutral-800 transition">
                <Plus className="w-3.5 h-3.5" /> Add Image
              </button>
            </div>

            {/* Preview strip */}
            {productImages.some(u => u.trim()) && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {productImages.filter(u => u.trim()).map((img, i) => (
                  <div key={i} className={`shrink-0 w-16 h-16 rounded-xl border-2 p-1 bg-gray-50 ${i === 0 ? 'border-black' : 'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-contain"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {productImages.map((img, i) => (
                <ImageRow
                  key={i}
                  value={img}
                  onChange={val => { const imgs = [...productImages]; imgs[i] = val; setProductImages(imgs); }}
                  onRemove={() => setProductImages(productImages.filter((_, idx) => idx !== i))}
                  placeholder={i === 0 ? 'Main product image URL' : `Additional image ${i + 1}`}
                />
              ))}
            </div>
          </div>

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
                  index={i}
                  onChange={updated => { const newC = [...colors]; newC[i] = updated; setColors(newC); }}
                  onRemove={() => setColors(colors.filter((_, idx) => idx !== i))}
                />
              ))}
              {colors.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No colors added yet. Leave empty for single-color products.</p>
              )}
            </div>
          </div>

          {/* Variants / Sizes */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Sizes / Variants</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">e.g. UK 7, 4U/G5, 85g — each with its own stock.</p>
              </div>
              <button type="button" onClick={() => setVariants([...variants, { name: '', stock: 5 }])}
                className="bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-neutral-800 transition">
                <Plus className="w-3.5 h-3.5" /> Add Variant
              </button>
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 border border-gray-200 rounded-xl">
                  <input type="text" placeholder="Size / Variant Name" value={v.name}
                    onChange={e => { const newV = [...variants]; newV[i].name = e.target.value; setVariants(newV); }}
                    className="flex-1 border border-gray-200 rounded-lg p-2 text-xs font-semibold outline-none focus:border-black bg-white transition" />
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase block mb-0.5">Stock</label>
                    <input type="number" value={v.stock}
                      onChange={e => { const newV = [...variants]; newV[i].stock = Number(e.target.value); setVariants(newV); }}
                      className="w-20 border border-gray-200 rounded-lg p-2 text-xs font-semibold outline-none focus:border-black bg-white transition" />
                  </div>
                  <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                    className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {variants.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No variants added. Base stock will be used.</p>
              )}
            </div>
          </div>

          {/* Description & Specs */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">Description & Specifications</h3>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">
                Product Description
                <span className="ml-1 text-[9px] text-gray-400 normal-case font-medium">(DB: description)</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Write a detailed product description with key features and benefits..."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-black transition resize-y leading-relaxed"
              />
              <p className="text-[10px] text-gray-400 mt-1">{description.length} characters</p>
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