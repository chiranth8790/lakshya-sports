import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sharp from 'sharp';

// Load environment variables from .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Note: If Anon key fails due to RLS, you will need to replace this with the Service Role Key
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to clean URLs like your frontend does
function getHighResUrl(url) {
  if (!url) return '';
  if (url.includes('?')) url = url.split('?')[0];
  url = url.replace(/\._[a-zA-Z0-9_]+_\./g, '.');
  url = url.replace(/_[0-9]+x[0-9]+(?=\.[a-zA-Z]+$)/g, '');
  return url;
}

// Generate a slug-like filename from product name
function generateFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.webp';
}

async function migrateImages() {
  console.log("🚀 Starting Yonex Image Migration to WebP...");

  // 1. Fetch products that have Yonex in brand or yonex.com in image URL
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name, image, images')
    .ilike('brand', '%yonex%');

  if (fetchError) {
    console.error("❌ Error fetching products:", fetchError);
    return;
  }

  console.log(`📦 Found ${products.length} Yonex products.`);

  let successCount = 0;
  let failCount = 0;

  for (const product of products) {
    console.log(`\nProcessing: ${product.name}`);
    
    // Check if the image is already a Supabase URL
    const targetUrl = product.image || (product.images && product.images.length > 0 ? product.images[0] : null);
    if (!targetUrl || targetUrl.includes(supabaseUrl)) {
      console.log("⏭️ Skipping: Image is missing or already migrated.");
      continue;
    }

    try {
      const originalUrl = getHighResUrl(targetUrl);
      const filename = generateFilename(product.name);

      console.log(`⬇️ Downloading: ${originalUrl}`);
      
      // 2. Download the image
      const response = await fetch(originalUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`🔄 Converting to WebP...`);
      // 3. Convert to WebP using Sharp
      const webpBuffer = await sharp(buffer)
        .webp({ quality: 80 }) // 80% quality is a great balance of size and visual fidelity
        .toBuffer();

      console.log(`⬆️ Uploading ${filename} to Supabase...`);
      
      // 4. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images') // Make sure this bucket exists!
        .upload(`yonex-webp/${filename}`, webpBuffer, {
          contentType: 'image/webp',
          upsert: true // Overwrite if it already exists
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);

      console.log(`✅ Uploaded successfully. New URL: ${publicUrl}`);

      // 5. Update the database record
      const newImagesArray = product.images && product.images.length > 0 
        ? [publicUrl, ...product.images.slice(1)]
        : [publicUrl];

      const { error: updateError } = await supabase
        .from('products')
        .update({ images: newImagesArray })
        .eq('id', product.id);

      if (updateError) throw updateError;
      
      console.log(`💾 Database updated for ${product.name}`);
      successCount++;

    } catch (err) {
      console.error(`❌ Failed to process ${product.name}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n🎉 Migration Complete! Success: ${successCount}, Failed: ${failCount}`);
}

// Run the script
migrateImages();
