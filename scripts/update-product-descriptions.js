import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to format HTML specs table
function generateSpecsTable(specs) {
  const rows = Object.entries(specs)
    .filter(([_, value]) => value && value.trim() !== '')
    .map(([key, value]) => `
      <tr class="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition">
        <td class="py-2.5 px-3 text-xs font-bold text-gray-700 bg-gray-50/60 w-2/5">${key}</td>
        <td class="py-2.5 px-3 text-xs font-medium text-gray-900">${value}</td>
      </tr>
    `).join('');

  return `
    <div class="my-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xs">
      <div class="bg-neutral-900 px-3.5 py-2 flex items-center justify-between">
        <span class="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
          📊 Technical Specifications
        </span>
        <span class="text-[10px] text-amber-400 font-bold">100% Verified Specs</span>
      </div>
      <table class="w-full border-collapse text-left">
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// Generate high-converting Amazon/Flipkart/Nivia style product description
export function buildProductDetails(product) {
  const { name, brand, category, price } = product;
  const isShoe = category === 'shoes' || name.toLowerCase().includes('shoe') || brand.toLowerCase().includes('asics');
  
  if (isShoe) {
    return buildShoeDetails(product);
  } else {
    return buildRacketDetails(product);
  }
}

function buildRacketDetails(p) {
  const name = p.name.toUpperCase();
  let series = 'Badminton Rackets';
  let tier = 'Tournament';
  let flex = 'Medium';
  let balance = 'Even Balance';
  let weightGrip = '4U (Avg. 83g) / G5';
  let tension = '20 – 28 lbs';
  let frame = 'H.M. Graphite, Isometric Sweet Spot';
  let shaft = 'H.M. Graphite, Slim Shaft';
  let level = 'Intermediate to Advanced';
  let style = 'All-Round Control & Precision';
  let origin = 'Japan / Taiwan / China (Sunrise Authorized)';
  let headline = `🏸 Professional Tournament-Grade Badminton Racket | Precision & Power`;
  let techHighlights = ['Isometric Frame Technology', 'Rotational Generator System', 'Slim Aerodynamic Shaft', 'Built-in T-Joint'];

  // Specific Model Matchers
  if (name.includes('100ZZ') || name.includes('100 ZZ')) {
    series = 'Astrox Series';
    tier = 'Pro Choice';
    flex = 'Extra Stiff';
    balance = 'Head Heavy (Max Smash Power)';
    weightGrip = '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4';
    tension = '4U: 20 – 28 lbs | 3U: 21 – 29 lbs';
    frame = 'HM Graphite + Namd + Tungsten + Black Micro Core + Nanometric';
    shaft = 'HM Graphite + Namd + Hyper Slim Shaft';
    level = 'Advanced / Tournament Pro';
    style = 'Aggressive Attacking Smashers (Viktor Axelsen Model)';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 BWF Champion Weapon: Astrox 100 ZZ | Maximum Steep Smash Power';
    techHighlights = ['Namd Graphite for Explosive Snapback', 'Hyper Slim Solid Core Shaft', 'Rotational Generator System', 'Energy Boost Cap Plus'];
  } else if (name.includes('100VA ZZ')) {
    series = 'Astrox Series';
    tier = 'Pro Choice';
    flex = 'Extra Stiff';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4';
    tension = '4U: 20 – 28 lbs | 3U: 21 – 29 lbs';
    frame = 'HM Graphite + Namd + Tungsten + Black Micro Core';
    shaft = 'HM Graphite + Namd + Hyper Slim Shaft';
    level = 'Advanced / Tournament Pro';
    style = 'Olympic Champion Limited Signature Edition (Viktor Axelsen)';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Viktor Axelsen Olympic Edition: Astrox 100VA ZZ | Limited Heritage';
    techHighlights = ['Signature Viktor Axelsen Decals & Crest', 'Namd Carbon Rebound Engine', 'Hyper Slim Solid Core Shaft', 'Black Micro Core Head Stability'];
  } else if (name.includes('100VA TOUR') || name.includes('100 TOUR')) {
    series = 'Astrox Series';
    tier = 'Tournament';
    flex = 'Extra Stiff';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + Nanomesh Neo + Tungsten';
    shaft = 'HM Graphite + Namd + Rexis Slim Shaft';
    level = 'Advanced Club / Competitive';
    style = 'Aggressive Smash & Steep Angle Attack';
    origin = 'Made in Taiwan (Sunrise Authorized)';
    headline = '🏸 Astrox 100 Tour | Pro-Caliber Smash Power with Rexis Shaft';
    techHighlights = ['Rexis High Repulsion Shaft', 'Nanomesh Neo Frame Reinforcement', 'Rotational Generator Weight Distribution', 'Isometric Sweet Spot'];
  } else if (name.includes('100VA GAME') || name.includes('100 GAME')) {
    series = 'Astrox Series';
    tier = 'Club Standard';
    flex = 'Medium';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + Nanomesh Neo + Tungsten';
    shaft = 'HM Graphite + Nanomesh Neo';
    level = 'Intermediate / Club Players';
    style = 'Power Smash with High Forgiveness';
    origin = 'Made in Taiwan';
    headline = '🏸 Astrox 100 Game | Easy Access to Head-Heavy Smash Velocity';
    techHighlights = ['Nanomesh Neo Elastic Frame', 'Medium Flex Whip Power', 'Rotational Generator System', 'Energy Boost Cap'];
  } else if (name.includes('99 PRO')) {
    series = 'Astrox Series';
    tier = 'Pro Choice';
    flex = 'Stiff';
    balance = 'Head Heavy (Maximum Shuttle Hold)';
    weightGrip = '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4';
    tension = '4U: 20 – 28 lbs | 3U: 21 – 29 lbs';
    frame = 'HM Graphite + Namd + VOLUME CUT RESIN + Tungsten';
    shaft = 'HM Graphite + Namd + Extra Slim Shaft';
    level = 'Advanced / Tournament Pro';
    style = 'Overwhelming Power & Shuttle Hold (Kento Momota Weapon)';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Astrox 99 Pro | Heavyweight Smash & Deep Court Penetration';
    techHighlights = ['Power-Assist Bumper for Extra Smash Weight', 'Namd Full-Length Energy Transfer', 'Volume Cut Resin Frame', 'Extra Slim Shaft'];
  } else if (name.includes('99 TOUR')) {
    series = 'Astrox Series';
    tier = 'Tournament';
    flex = 'Stiff';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + VOLUME CUT RESIN + Tungsten';
    shaft = 'HM Graphite + Namd';
    level = 'Advanced / Competitive Club';
    style = 'Heavy Smashing & Offensive Baseline Dominance';
    origin = 'Made in Taiwan';
    headline = '🏸 Astrox 99 Tour | Tournament Baseline Power with Namd Core';
    techHighlights = ['Namd Shaft Flex Engine', 'Volume Cut Resin', 'Tungsten-Weighted Frame Head', 'Isometric Sweet Spot'];
  } else if (name.includes('99 GAME')) {
    series = 'Astrox Series';
    tier = 'Club Standard';
    flex = 'Medium';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + VOLUME CUT RESIN + Tungsten';
    shaft = 'HM Graphite + Nanomesh Neo';
    level = 'Intermediate Club Players';
    style = 'Steep Attacking Angles with Comfortable Whip';
    origin = 'Made in Taiwan';
    headline = '🏸 Astrox 99 Game | Forgiving Attacking Frame for Aggressive Rallies';
    techHighlights = ['Volume Cut Resin Grommets', 'Nanomesh Neo Shaft', 'Rotational Weighting', 'Isometric Head Profile'];
  } else if (name.includes('99 PLAY')) {
    series = 'Astrox Series';
    tier = 'Best Seller';
    flex = 'Medium';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Full Graphite';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner to Intermediate';
    style = 'Easy Attacking Power & Smash Assist';
    origin = 'Made in China (Authorized)';
    headline = '🏸 Astrox 99 Play | Gateway to Head-Heavy Smash Domination';
    techHighlights = ['Full Graphite Construction', 'Rotational Generator System', 'Large Isometric Sweet Spot', 'Slim Shaft'];
  } else if (name.includes('88 D PRO') || name.includes('88D PRO') || name.includes('3AX88D-P')) {
    series = 'Astrox Series (3rd Generation)';
    tier = 'Pro Choice';
    flex = 'Stiff';
    balance = 'Head Heavy (Backcourt Specialist)';
    weightGrip = '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4';
    tension = '4U: 20 – 28 lbs | 3U: 21 – 29 lbs';
    frame = 'HM Graphite + CFR + Tungsten';
    shaft = 'HM Graphite + 2G-Namd Flex Force + Ultra PE Fiber';
    level = 'Advanced / Tournament Pro';
    style = 'Backcourt Domination, Steep Smashes (Kunlavut Vitidsarn Model)';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Astrox 88 D Pro 3rd Gen | Ultimate Backcourt Smash Cannon';
    techHighlights = ['2G-Namd Flex Force Shaft', 'CFR Carbon Fiber Reinforced Frame', 'Rotational Generator System 2.0', 'Power-Assist Bumper'];
  } else if (name.includes('88 D TOUR') || name.includes('3AX88D-T')) {
    series = 'Astrox Series (3rd Generation)';
    tier = 'Tournament';
    flex = 'Stiff';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + CFR + Tungsten';
    shaft = 'HM Graphite + 2G-Namd Flex Force';
    level = 'Advanced Club / Competitive';
    style = 'Hard-Hitting Rear Court Smashes';
    origin = 'Made in Taiwan';
    headline = '🏸 Astrox 88 D Tour 3rd Gen | Elite Rear-Court Striking Power';
    techHighlights = ['2G-Namd Flex Force', 'CFR Frame Reinforcement', 'Rotational Weight Distribution', 'Isometric Sweet Spot'];
  } else if (name.includes('88 D GAME') || name.includes('3AX88D-G')) {
    series = 'Astrox Series (3rd Generation)';
    tier = 'Club Standard';
    flex = 'Medium';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + CFR + Tungsten';
    shaft = 'HM Graphite + 2G-Namd Flex Force';
    level = 'Intermediate Doubles Players';
    style = 'Rear-Court Attacking with Easy Whip';
    origin = 'Made in Taiwan';
    headline = '🏸 Astrox 88 D Game 3rd Gen | Accessible Power for Doubles Attackers';
    techHighlights = ['2G-Namd Flex Force', 'Rotational Generator 2.0', 'Medium Flex Forgiveness', 'Isometric Head'];
  } else if (name.includes('88 S PRO') || name.includes('3AX88S-P')) {
    series = 'Astrox Series (3rd Generation)';
    tier = 'Pro Choice';
    flex = 'Stiff';
    balance = 'Slightly Head Heavy (Frontcourt Specialist)';
    weightGrip = '4U (Avg. 83g) G5 / 3U G4';
    tension = '4U: 20 – 28 lbs | 3U: 21 – 29 lbs';
    frame = 'HM Graphite + CFR + Tungsten';
    shaft = 'HM Graphite + 2G-Namd Flex Force + Ultra PE Fiber';
    level = 'Advanced / Tournament Pro';
    style = 'Frontcourt Speed, Rapid Net Interceptions & Drives';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Astrox 88 S Pro 3rd Gen | Precision Net Kill & Frontcourt Master';
    techHighlights = ['5mm Longer Length for Fast Reflexes', '2G-Namd Flex Force', 'CFR Carbon Frame', 'Energy Boost Cap Plus'];
  } else if (name.includes('88 S TOUR') || name.includes('3AX88S-T')) {
    series = 'Astrox Series (3rd Generation)';
    tier = 'Tournament';
    flex = 'Stiff';
    balance = 'Slightly Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + CFR + Tungsten';
    shaft = 'HM Graphite + 2G-Namd Flex Force';
    level = 'Advanced Club / Competitive';
    style = 'Fast Net Dominance & Mid-Court Countering';
    origin = 'Made in Taiwan';
    headline = '🏸 Astrox 88 S Tour 3rd Gen | Rapid Frontcourt Control & Interception';
    techHighlights = ['2G-Namd Flex Force', 'Rotational Generator System', 'Isometric Head Profile', 'Fast-Handling Frame'];
  } else if (name.includes('88 PLAY') || name.includes('3AX88-PL')) {
    series = 'Astrox Series';
    tier = 'Best Seller';
    flex = 'Medium';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Full Graphite';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner to Intermediate';
    style = 'All-Round Doubles Power & Easy Timing';
    origin = 'Made in China (Authorized)';
    headline = '🏸 Astrox 88 Play | High-Forgiveness Doubles Power Racket';
    techHighlights = ['Full High Quality Graphite', 'Rotational Generator Weighting', 'Isometric Sweet Spot Expansion', 'Slim Shaft'];
  } else if (name.includes('77 PRO') || name.includes('ASTROX 77 PRO')) {
    series = 'Astrox Series';
    tier = 'Pro Choice';
    flex = 'Medium';
    balance = 'Head Heavy (Shock Dampened)';
    weightGrip = '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4';
    tension = '4U: 19 – 27 lbs | 3U: 20 – 28 lbs';
    frame = 'HM Graphite + Flex Fuse + Tungsten';
    shaft = 'HM Graphite + Namd + Ultra PE Fiber';
    level = 'Advanced / Tournament Pro';
    style = 'Dynamic Attacking & Defense (An Se Young & Chen Yufei Choice)';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Astrox 77 Pro | World #1 An Se Young Choice: Smooth Power & Cushion';
    techHighlights = ['Flex Fuse Shock-Absorbing Resin', 'Namd Flexible Power Shaft', 'Rotational Generator System', 'Energy Boost Cap Plus'];
  } else if (name.includes('77 TOUR')) {
    series = 'Astrox Series';
    tier = 'Tournament';
    flex = 'Medium';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + Nanomesh Neo + Tungsten';
    shaft = 'HM Graphite + Namd';
    level = 'Competitive Club Players';
    style = 'High-Repulsion Smashes & Controlled Clears';
    origin = 'Made in Taiwan';
    headline = '🏸 Astrox 77 Tour | Effortless Power with Namd Core Technology';
    techHighlights = ['Namd Graphite Shaft', 'Rotational Weight Distribution', 'Nanomesh Neo Frame', 'Isometric Sweet Spot'];
  } else if (name.includes('77 PLAY')) {
    series = 'Astrox Series';
    tier = 'Best Seller';
    flex = 'Medium';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 27 lbs';
    frame = 'Full Graphite';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner / Intermediate';
    style = 'Effortless Attacking Power & Comfortable Clear Depth';
    origin = 'Made in China';
    headline = '🏸 Astrox 77 Play | Easy-Play Attacking Badminton Racket';
    techHighlights = ['Full Graphite Construction', 'Rotational Generator System', 'Expanded Isometric Sweet Spot', 'Comfortable Grip Profile'];
  } else if (name.includes('ASTROX NEXTAGE') || name.includes('AXNT')) {
    series = 'Astrox Series';
    tier = 'Tournament';
    flex = 'Medium';
    balance = 'Head Heavy (Comfort Focused)';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Graphite + VDM (Vibration Dampening Mesh) + Tungsten';
    shaft = 'Graphite + Nanomesh Neo';
    level = 'Intermediate to Advanced Club';
    style = 'Vibration-Free Heavy Smashes & Joint Comfort';
    origin = 'Made in Taiwan';
    headline = '🏸 Astrox Nextage | Zero-Sting Heavy Smash Power with VDM Tech';
    techHighlights = ['VDM Vibration Dampening Mesh in Frame', 'Rotational Generator System', 'Energy Boost Cap', 'Wide Isometric Head'];
  } else if (name.includes('ASTROX 70') || name.includes('AX70')) {
    series = 'Astrox Series';
    tier = 'Club Standard';
    flex = 'Hi-Flex';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '19 – 26 lbs';
    frame = 'HM Graphite + VDM + Tungsten';
    shaft = 'HM Graphite + Namd';
    level = 'Intermediate / Club Players';
    style = 'Effortless Deep Clears & High-Repulsion Smashes';
    origin = 'Made in Japan (Sunrise Authorized)';
    headline = '🏸 Astrox 70 | Hi-Flex Powerhouse for Effortless Deep Clears';
    techHighlights = ['Hi-Flex Shaft for Maximum Whip', 'Namd Carbon Technology', 'VDM Vibration Dampening', 'Rotational Weight Distribution'];
  } else if (name.includes('DG') || name.includes('3 DG') || name.includes('7 DG') || name.includes('1 DG')) {
    series = 'Astrox DG (Durable Grade)';
    tier = 'Best Seller';
    flex = name.includes('HF') ? 'Hi-Flex' : name.includes('ST') ? 'Stiff' : 'Medium-Stiff';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = 'Heavy Tension Monster: Up to 35 lbs!';
    frame = 'High Modulus Super HMG + Tungsten';
    shaft = 'HM Graphite + Nanomesh Neo';
    level = 'Intermediate to Advanced Club';
    style = 'High Tension Heavy Smashes (Withstands 35 lbs Stringing)';
    origin = 'Made in Taiwan (Sunrise Authorized)';
    headline = `🏸 Astrox ${name.replace('ASTROX ', '')} | Durable Grade Frame Built for 35 lbs Tension`;
    techHighlights = ['Durable Grade (DG) Reinforced Carbon Frame', 'Withstands up to 35 lbs High String Tension', 'Rotational Generator Balance', 'Isometric Sweet Spot'];
  } else if (name.includes('22 RX')) {
    series = 'Astrox Super Light';
    tier = 'Pro Choice';
    flex = 'Stiff';
    balance = 'Head Heavy';
    weightGrip = '2F (Avg. 68g) / G5 Super Featherweight';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + Tungsten';
    shaft = 'HM Graphite + Nanomesh Neo';
    level = 'Intermediate to Advanced';
    style = 'Ultra-Lightweight Lightning Speed with Head-Heavy Punch';
    origin = 'Made in Taiwan';
    headline = '🏸 Astrox 22 RX | 68g Super-Featherweight Head-Heavy Attacker';
    techHighlights = ['Ultra-Lightweight 68g Frame', 'Head-Heavy Weight Distribution for Smashing Mass', 'Aero+Box Frame', 'Isometric Head Profile'];
  } else if (name.includes('ASTROX 01') || name.includes('ASTROX 02') || name.includes('AX02') || name.includes('AXE13')) {
    series = 'Astrox Entry Series';
    tier = 'Best Seller';
    flex = name.includes('CLEAR') ? 'Hi-Flex' : name.includes('FEEL') ? 'Flexible' : 'Medium';
    balance = 'Head Heavy';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Full Graphite + Isometric';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner to Intermediate';
    style = 'Accessible Attacking Power & Fast Rallies';
    origin = 'Made in China (Sunrise Authorized)';
    headline = `🏸 ${p.name} | Full Graphite Attacking Badminton Racket`;
    techHighlights = ['Rotational Generator System', 'Isometric Head Shape', 'Full Graphite Construction', 'Slim Shaft'];
  } else if (name.includes('1000 Z') || name.includes('1000Z')) {
    series = 'Nanoflare Series';
    tier = 'Pro Choice';
    flex = 'Extra Stiff';
    balance = 'Head Light (Lightning Speed)';
    weightGrip = '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4';
    tension = '4U: 20 – 28 lbs | 3U: 21 – 29 lbs';
    frame = 'HM Graphite + NANOMETRIC DR + M40X + EX-HYPER MG';
    shaft = 'HM Graphite + Ultra PE Fiber + Super Slim Shaft';
    level = 'Advanced / Tournament Pro';
    style = 'World Record Smash Speed (565 km/h) & Lightning Fast Drives (Lakshya Sen Weapon)';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 World Record Speed: Nanoflare 1000 Z | 565 km/h Smash Weapon (Lakshya Sen Model)';
    techHighlights = ['Sonic Flare System with TORAYCA M40X Carbon', 'Compact Aerodynamic Frame for Instant Whip', 'Speed-Assist Bumper', 'Super Slim Shaft'];
  } else if (name.includes('1000 TOUR')) {
    series = 'Nanoflare Series';
    tier = 'Tournament';
    flex = 'Extra Stiff';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + NANOMETRIC DR + M40X + EX-HMG';
    shaft = 'HM Graphite + Rexis Slim Shaft';
    level = 'Advanced Club / Competitive';
    style = 'Blistering Drive Exchanges & Rapid Defense';
    origin = 'Made in Taiwan';
    headline = '🏸 Nanoflare 1000 Tour | Tour-Level Lightning Speed with M40X Core';
    techHighlights = ['TORAYCA M40X Next-Gen Carbon', 'Speed-Assist Bumper', 'Aero Frame for Zero Wind Resistance', 'Isometric Sweet Spot'];
  } else if (name.includes('1000 GAME')) {
    series = 'Nanoflare Series';
    tier = 'Club Standard';
    flex = 'Medium';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Nanocell NEO + HM Graphite';
    shaft = 'HM Graphite + Slim Shaft';
    level = 'Intermediate Club Players';
    style = 'Fast Maneuverability & Easy Counter-Attacking';
    origin = 'Made in Taiwan';
    headline = '🏸 Nanoflare 1000 Game | Rapid Fast-Action Badminton Racket';
    techHighlights = ['Nanocell NEO Vibration Absorption', 'Sonic Flare Aerodynamics', 'Aero Frame Contour', 'Isometric Sweet Spot'];
  } else if (name.includes('1000 PLAY') || name.includes('NF-1000P')) {
    series = 'Nanoflare Series';
    tier = 'Best Seller';
    flex = 'Medium';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Full Graphite';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner to Intermediate';
    style = 'Quick Reflexes, Fast Net Play & Defense';
    origin = 'Made in China (Authorized)';
    headline = '🏸 Nanoflare 1000 Play | Ultra-Fast Swing Recovery & Quick Reaction Racket';
    techHighlights = ['Sonic Flare System Frame Profile', 'Full Graphite Construction', 'Wide Isometric Head', 'Slim Shaft'];
  } else if (name.includes('800 PRO') || name.includes('NF-800PR')) {
    series = 'Nanoflare Series';
    tier = 'Pro Choice';
    flex = 'Stiff';
    balance = 'Head Light (Drive Specialist)';
    weightGrip = '4U (Avg. 83g) G5 / 3U G4';
    tension = '4U: 20 – 28 lbs | 3U: 21 – 29 lbs';
    frame = 'HM Graphite + M40X + SUPER HMG';
    shaft = 'HM Graphite + SUPER HMG + Ultra PE Fiber';
    level = 'Advanced / Tournament Pro';
    style = 'Blinding Flat Drives, Fast Net Interceptions & Counter-Attacks';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Nanoflare 800 Pro | Flat Drive Specialist for Rapid Reflex Doubles';
    techHighlights = ['Enhanced Sonic Flare System', 'Deep Groove Wide Profile Frame', 'Super Slim Shaft', 'Energy Boost Cap Plus'];
  } else if (name.includes('800 TOUR') || name.includes('NF-800T')) {
    series = 'Nanoflare Series';
    tier = 'Tournament';
    flex = 'Stiff';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + M40X + SUPER HMG';
    shaft = 'HM Graphite';
    level = 'Advanced Club / Competitive';
    style = 'Aggressive Fast Drives & Quick Net Recovery';
    origin = 'Made in Taiwan';
    headline = '🏸 Nanoflare 800 Tour | Tournament Flat-Drive Speed with M40X';
    techHighlights = ['TORAYCA M40X High Modulus Carbon', 'Deep Groove Frame', 'Aero Frame Geometry', 'Isometric Head'];
  } else if (name.includes('800 GAME') || name.includes('NF-800G')) {
    series = 'Nanoflare Series';
    tier = 'Club Standard';
    flex = 'Medium';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + Nanocell NEO + Copper';
    shaft = 'HM Graphite';
    level = 'Intermediate Club Players';
    style = 'Fast Drive Battles & Quick Court Recovery';
    origin = 'Made in Taiwan';
    headline = '🏸 Nanoflare 800 Game | Fast-Paced Rallies & Quick Reaction Control';
    techHighlights = ['Nanocell NEO Impact Resistance', 'Sonic Flare Aerodynamics', 'Medium Flex Whip', 'Isometric Head'];
  } else if (name.includes('800 PLAY')) {
    series = 'Nanoflare Series';
    tier = 'Best Seller';
    flex = 'Medium';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Full Graphite';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner / Intermediate';
    style = 'Effortless Fast Swings & Easy Defensive Clears';
    origin = 'Made in China';
    headline = '🏸 Nanoflare 800 Play | Lightning Maneuverability & Easy Defense';
    techHighlights = ['Aero Frame Contouring', 'Full Graphite Composition', 'Isometric Sweet Spot', 'Comfort Grip'];
  } else if (name.includes('700 PRO') || name.includes('2NF-700')) {
    series = 'Nanoflare 700 (2nd Generation)';
    tier = 'Pro Choice';
    flex = 'Medium';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5 / 5U (Avg. 78g) G5';
    tension = '4U: 19 – 27 lbs | 5U: 18 – 26 lbs';
    frame = 'HM Graphite + M40X + SUPER HMG + SERVO FILTER';
    shaft = 'HM Graphite + SERVO FILTER';
    level = 'Advanced / Tournament Pro';
    style = 'Effortless Deep Clears & Soft Impact Feel (Ratchanok Intanon Choice)';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Nanoflare 700 Pro 2nd Gen | Silky Clear Depth & Servo Filter Touch';
    techHighlights = ['SERVO FILTER Vibration Absorber', 'Enhanced Sonic Flare System', 'TORAYCA M40X Carbon', 'Super Slim Shaft'];
  } else if (name.includes('700 TOUR')) {
    series = 'Nanoflare 700 (2nd Generation)';
    tier = 'Tournament';
    flex = 'Medium';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + M40X + SERVO FILTER';
    shaft = 'HM Graphite';
    level = 'Advanced Club / Competitive';
    style = 'High Repulsion Clears & Soft Touch';
    origin = 'Made in Taiwan';
    headline = '🏸 Nanoflare 700 Tour 2nd Gen | Effortless Clearing Power with Servo Filter';
    techHighlights = ['SERVO FILTER Technology', 'TORAYCA M40X Carbon Fiber', 'Aero Frame Profile', 'Isometric Sweet Spot'];
  } else if (name.includes('700 GAME')) {
    series = 'Nanoflare 700 (2nd Generation)';
    tier = 'Club Standard';
    flex = 'Medium';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + Nanocell NEO + SERVO FILTER';
    shaft = 'HM Graphite';
    level = 'Intermediate Club Players';
    style = 'Smooth Maneuverability & Deep Shuttles';
    origin = 'Made in Taiwan';
    headline = '🏸 Nanoflare 700 Game 2nd Gen | Smooth Power & Reduced Impact Shock';
    techHighlights = ['SERVO FILTER Shock Reduction', 'Nanocell NEO Frame Matrix', 'Isometric Head Profile', 'Slim Shaft'];
  } else if (name.includes('700 PLAY')) {
    series = 'Nanoflare 700 (2nd Generation)';
    tier = 'Best Seller';
    flex = 'Hi-Flex';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Full Graphite';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner / Intermediate';
    style = 'Super Easy Clear Depth & Light Swing Feel';
    origin = 'Made in China';
    headline = '🏸 Nanoflare 700 Play 2nd Gen | High-Flex Forgiving Clears & Quick Drives';
    techHighlights = ['Hi-Flex Shaft for Long Clears', 'Aero Box Frame', 'Isometric Sweet Spot Expansion', 'Full Graphite'];
  } else if (name.includes('NANOFLARE NEXTAGE') || name.includes('NF-NT')) {
    series = 'Nanoflare Series';
    tier = 'Tournament';
    flex = 'Medium';
    balance = 'Head Light';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HT Graphite + Nanocell NEO';
    shaft = 'Graphite + VDM (Vibration Dampening Mesh)';
    level = 'Intermediate to Advanced Club';
    style = 'Silky Smooth Shuttle Feel & Lightning Net Maneuvers';
    origin = 'Made in Taiwan';
    headline = '🏸 Nanoflare Nextage | Vibration-Free Lightning Fast Doubles Racket';
    techHighlights = ['VDM Shock Absorption Mesh', 'Sonic Flare Aerodynamics', 'Nanocell NEO Matrix', 'Isometric Head'];
  } else if (name.includes('NANOFLARE 001') || name.includes('NANOFLARE 002') || name.includes('NF-002')) {
    series = 'Nanoflare Light Series';
    tier = 'Best Seller';
    flex = name.includes('CLEAR') ? 'Hi-Flex' : name.includes('FEEL') ? 'Flexible' : 'Medium';
    balance = 'Head Light';
    weightGrip = '5U (Avg. 78g) / 4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Full Graphite + Isometric';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner to Intermediate';
    style = 'Featherlight Swing Speed, Fast Defense & Net Control';
    origin = 'Made in China';
    headline = `🏸 ${p.name} | Super-Lightweight Fast Reaction Badminton Racket`;
    techHighlights = ['Sonic Flare Frame Profile', 'Isometric Sweet Spot Expansion', 'Full Graphite Construction', 'Slim Shaft'];
  } else if (name.includes('ARCSABER 11 PRO') || name.includes('ARC11-P')) {
    series = 'Arcsaber Series';
    tier = 'Pro Choice';
    flex = 'Stiff';
    balance = 'Even Balance (Supreme Shuttle Hold)';
    weightGrip = '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4';
    tension = '4U: 19 – 27 lbs | 3U: 20 – 28 lbs';
    frame = 'HM Graphite + POCKETING BOOSTER';
    shaft = 'HM Graphite + SUPER HMG + ULTRA PE FIBER';
    level = 'Advanced / Tournament Pro';
    style = 'Pinpoint Accuracy & Controlled Counter-Attack (Aaron Chia Weapon)';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Supreme Control: Arcsaber 11 Pro | Pocketing Booster Pinpoint Precision';
    techHighlights = ['POCKETING BOOSTER Carbon Elastomer', 'Control-Assist Bumper at Top of Frame', 'Super HMG Stiff Power Shaft', 'Energy Boost Cap Plus'];
  } else if (name.includes('ARCSABER 11 TOUR') || name.includes('ARC11-T')) {
    series = 'Arcsaber Series';
    tier = 'Tournament';
    flex = 'Stiff';
    balance = 'Even Balance';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + POCKETING BOOSTER';
    shaft = 'HM Graphite + SUPER HMG';
    level = 'Advanced Club / Competitive';
    style = 'Pinpoint Control & Calculated Counter-Attacking';
    origin = 'Made in Taiwan';
    headline = '🏸 Arcsaber 11 Tour | Precision Placement & Firm Even-Balance Feel';
    techHighlights = ['Pocketing Booster Frame Technology', 'Control-Assist Bumper', 'Super HMG Carbon Shaft', 'Isometric Sweet Spot'];
  } else if (name.includes('ARCSABER 11 PLAY') || name.includes('ARC11-PL')) {
    series = 'Arcsaber Series';
    tier = 'Best Seller';
    flex = 'Medium';
    balance = 'Even Balance';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 27 lbs';
    frame = 'Full Graphite';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner to Intermediate';
    style = 'All-Round Control, Forgiving Clears & Steady Defense';
    origin = 'Made in China (Authorized)';
    headline = '🏸 Arcsaber 11 Play | Ultimate All-Round Control & Easy Maneuverability';
    techHighlights = ['Even Balance Weight Distribution', 'Large Isometric Sweet Spot', 'Full High-Grade Graphite', 'Slim Shaft'];
  } else if (name.includes('ARCSABER 7 PRO') || name.includes('ARC7-P')) {
    series = 'Arcsaber Series';
    tier = 'Pro Choice';
    flex = 'Medium';
    balance = 'Even Balance';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '19 – 27 lbs';
    frame = 'HM Graphite + POCKETING BOOSTER';
    shaft = 'HM Graphite + ULTRA PE FIBER';
    level = 'Advanced / Tournament Pro';
    style = 'Extended Shuttle Hold & Calculated Pinpoint Control';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Arcsaber 7 Pro | Maximum Shuttle Contact Time & Pinpoint Accuracy';
    techHighlights = ['Pocketing Booster High-Elasticity Resin', 'Enhanced Frame Stability', 'Ultra PE Fiber Shaft', 'Isometric Head'];
  } else if (name.includes('ARCSABER 7 TOUR') || name.includes('ARC7-T')) {
    series = 'Arcsaber Series';
    tier = 'Tournament';
    flex = 'Medium';
    balance = 'Even Balance';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'HM Graphite + POCKETING BOOSTER';
    shaft = 'HM Graphite';
    level = 'Advanced Club Players';
    style = 'Smooth All-Round Control & Precision Returns';
    origin = 'Made in Taiwan';
    headline = '🏸 Arcsaber 7 Tour | Tournament Even-Balance Control & Accuracy';
    techHighlights = ['Pocketing Booster Matrix', 'Box Frame Torsional Rigidity', 'Slim Aerodynamic Shaft', 'Isometric Sweet Spot'];
  } else if (name.includes('ARCSABER 7 PLAY') || name.includes('ARC7-PL')) {
    series = 'Arcsaber Series';
    tier = 'Best Seller';
    flex = 'Medium';
    balance = 'Even Balance';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 27 lbs';
    frame = 'Full Graphite';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner / Intermediate';
    style = 'Effortless Rallies, Steady Defense & Controlled Clears';
    origin = 'Made in China';
    headline = '🏸 Arcsaber 7 Play | Easy-Handling Precision Badminton Racket';
    techHighlights = ['Even Balance All-Round Geometry', 'Expanded Sweet Spot Frame', 'Full Graphite Construction', 'Slim Shaft'];
  } else if (name.includes('ARCSABER 2')) {
    series = 'Arcsaber Series';
    tier = 'Best Seller';
    flex = name.includes('CLEAR') ? 'Hi-Flex' : name.includes('FEEL') ? 'Flexible' : 'Medium';
    balance = 'Even Balance';
    weightGrip = '4U (Avg. 83g) G5';
    tension = '20 – 28 lbs';
    frame = 'Full Graphite + CS Carbon Nanotube';
    shaft = 'Full Graphite + Slim Shaft';
    level = 'Beginner / Intermediate';
    style = 'Controlled All-Court Play & Reliable Clears';
    origin = 'Made in China';
    headline = `🏸 ${p.name} | All-Court Control Full Graphite Badminton Racket`;
    techHighlights = ['CS Carbon Nanotube Compound', 'Even Balance Handling', 'Isometric Sweet Spot Expansion', 'Full Graphite'];
  } else if (name.includes('DUORA Z-STRIKE') || name.includes('DUO-ZS')) {
    series = 'Duora Series';
    tier = 'Pro Choice';
    flex = 'Extra Stiff';
    balance = 'Even Balance';
    weightGrip = '3U (Avg. 88g) G4 / 2U G4';
    tension = '3U: 20 – 28 lbs | 2U: 21 – 29 lbs';
    frame = 'HM Graphite + NANOMETRIC DR + Hyper-MG';
    shaft = 'HM Graphite + NANOMETRIC + EX-HMG';
    level = 'Advanced / Tournament Elite';
    style = 'Dual Optimum: Forehand Box Smash Power + Backhand Aero Drive Speed';
    origin = 'Made in Japan (Sunrise Hologram Verified)';
    headline = '🏸 Dual Dynamic Weapon: Duora Z-Strike | Dual Optimum Forehand & Backhand System';
    techHighlights = ['Dual Optimum System (Box Frame Forehand / Aero Frame Backhand)', 'NANOMETRIC DR Dynamic Carbon', 'Horizontal-A Grommet Pattern', 'Compact Frame'];
  } else if (name.includes('AXFORCE 100') || p.brand.toLowerCase().includes('li-ning')) {
    series = 'Li-Ning Axforce Series';
    tier = 'Pro Choice';
    flex = 'Stiff';
    balance = 'Heavy Head (302mm Balance Point)';
    weightGrip = '4U (Avg. 82g) G5 / 3U G4';
    tension = '4U: Up to 30 lbs | 3U: Up to 31 lbs';
    frame = 'M50 Super Carbon + TB Nano + Superb Carbon';
    shaft = 'M50 Super Carbon + 6.0mm Extra Slim Shaft';
    level = 'Advanced / Tournament Pro';
    style = 'Devastating Jump Smashes & Steep Angles (Jonatan Christie Model)';
    origin = 'Li-Ning Authorized Genuine Stock';
    headline = '🏸 Flagship Attack: Li-Ning Axforce 100 | M50 Super Carbon Heavy Head Cannon';
    techHighlights = ['M50 Super Carbon Resilience', '6.0mm Ultra-Slim Elastic Shaft', 'Box Wing High-Stability Frame', 'Wing Stabilizer Anti-Torsion'];
  }

  const specsObj = {
    'Brand': p.brand || 'Yonex',
    'Series': series,
    'Model': p.name,
    'Player Level': level,
    'Playing Style': style,
    'Flexibility': flex,
    'Balance Point': balance,
    'Frame Composition': frame,
    'Shaft Composition': shaft,
    'Weight / Grip Size': weightGrip,
    'Stringing Tension': tension,
    'Recommended String': flex === 'Extra Stiff' || flex === 'Stiff' ? 'Yonex BG 80 / BG 66 Ultimax' : 'Yonex BG 65 / Nanogy 95',
    'Country of Origin': origin,
    'Authenticity': '100% Genuine with Hologram Scratch Code',
    'Warranty': 'Manufacturer Warranty Against Manufacturing Defects'
  };

  const specsTableHtml = generateSpecsTable(specsObj);

  const descriptionHtml = `
    <div class="space-y-4">
      <div class="border-b border-gray-100 pb-3">
        <h2 class="text-base font-black text-gray-900 leading-snug">${headline}</h2>
        <p class="text-xs text-red-600 font-bold uppercase tracking-wider mt-1">
          🏸 Series: ${series} • ${tier}
        </p>
      </div>

      <div>
        <p class="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">⭐ Key Product Highlights</p>
        <ul class="space-y-1.5 text-xs text-gray-800">
          <li class="flex items-start gap-2">
            <span class="text-red-500 font-black shrink-0">⚡</span>
            <span><strong>Play Style:</strong> Engineered specifically for <strong>${style}</strong>.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-amber-500 font-black shrink-0">⚖️</span>
            <span><strong>Balance & Flex:</strong> <strong>${balance}</strong> with a responsive <strong>${flex}</strong> shaft.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-500 font-black shrink-0">🏗️</span>
            <span><strong>Frame Engineering:</strong> Constructed with <strong>${frame}</strong> for maximum structural resilience and explosive power transfer.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 font-black shrink-0">🎯</span>
            <span><strong>Weight & Grip:</strong> <strong>${weightGrip}</strong> for lightning maneuverability and steady wrist control.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500 font-black shrink-0">🧵</span>
            <span><strong>High Tension Rating:</strong> Supports <strong>${tension}</strong>. Available with our computerized custom tournament stringing!</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-yellow-600 font-black shrink-0">🛡️</span>
            <span><strong>100% Genuine Guarantee:</strong> Sourced through authorized distributors with original Hologram verification stickers and scratch authentication codes.</span>
          </li>
        </ul>
      </div>

      <div class="bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/80 text-xs text-gray-700 leading-relaxed">
        <p class="font-bold text-gray-900 mb-1">💡 Coach's Performance Overview:</p>
        <p>The <strong>${p.name}</strong> is designed to elevate your court performance. Combining ${techHighlights.slice(0, 2).join(' with ')}, this racket delivers sharp shuttle acceleration, steep attacking smash angles, and rapid defensive recovery. Whether you play fast doubles flat drives or dominate singles baseline rallies, this frame provides tournament-tested precision.</p>
      </div>

      ${specsTableHtml}

      <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
        <span class="text-lg">🏸</span>
        <div class="text-[11px] text-emerald-900 leading-tight">
          <strong>Lakshya Sports Pro Stringing Service:</strong> Select your favorite Yonex tournament string (BG65, BG66 Ultimax, BG80) and exact electronic tension at checkout. Strung in-house by certified stringers!
        </div>
      </div>
    </div>
  `.trim();

  return {
    description: descriptionHtml,
    specs: JSON.stringify(specsObj),
    series: series,
    tier: tier
  };
}

function buildShoeDetails(p) {
  const name = p.name.toUpperCase();
  let brand = p.brand || 'Yonex';
  let tier = 'Best Seller';
  let fit = 'Ergonomic TruShape / U-Shape 2.5 (Indian Foot Profile)';
  let upper = 'Double Russel Breathable Mesh + Durable Synthetic Leather Skin';
  let midsole = 'TruCushion Dual-Density Shock Absorbing EVA Foam';
  let outsole = '100% Non-Marking Gum Rubber with HexaGrip Radial Pattern';
  let courtType = 'Indoor Wooden & Synthetic Court Approved (BWF Standard)';
  let headline = `👟 Professional Non-Marking Badminton Court Shoes | Zero Skid & Shock Dampening`;
  let playerProfile = 'Badminton, Squash & Multi-Court Indoor Athletes';

  if (name.includes('A970') || brand.toLowerCase().includes('victor')) {
    brand = 'Victor';
    tier = 'Pro Choice';
    fit = 'U-Shape 2.5 Ergonomic Fit (Wide Toe Box)';
    upper = 'PU Synthetic Leather + Breathable Double Mesh';
    midsole = 'HYPEREVA + ENERGYMAX 3.0 + Anti-Torsion TPU Plate';
    outsole = 'VSR Non-Marking Gum Rubber with Multi-Directional Grip';
    headline = '👟 Victor A970-TD All-Around Series | Professional HYPEREVA Court Cushioning';
    playerProfile = 'Tournament & High-Impact All-Around Badminton Players';
  } else if (name.includes('COURT CONTROL') || brand.toLowerCase().includes('asics')) {
    brand = 'Asics';
    tier = 'Pro Choice';
    fit = 'Standard Ergonomic Athletic Fit with DYNALACING Lock-in';
    upper = 'Polyurethane (PU) Reinforced Skin + Breathable Performance Mesh';
    midsole = 'FF BLAST™ PLUS Premium Lightweight Foam + Rearfoot GEL Cushioning';
    outsole = 'NC Non-Marking Gum Rubber with Multi-Surface Traction';
    headline = '👟 ASICS Court Control FF 4 | FF BLAST+ Jump & Smash Court Dominance';
    playerProfile = 'Jump-and-Smash Aggressive Players Engaging in Long Heavy Rallies';
  } else if (name.includes('HALBERD') || brand.toLowerCase().includes('lining')) {
    brand = 'Li-Ning';
    tier = 'Tournament';
    fit = 'Ergonomic Court Wrap Fit';
    upper = 'High-Density Breathable Sandwich Mesh + Durable TPU Wrap';
    midsole = 'Li-Ning Cloud Shock Absorption Foam + Probar Loc TPU Bridge';
    outsole = 'TUFF RB High-Abrasion Non-Marking Gum Rubber';
    headline = '👟 Li-Ning Halberd Strike | Cloud Cushioning & TUFF RB Court Traction';
    playerProfile = 'Fast Lateral Movement & Aggressive Indoor Court Footwork';
  } else if (name.includes('HY ULTRA') || name.includes('Y-2')) {
    brand = 'Yonex';
    tier = 'Best Seller';
    fit = 'TruShape Snug Ergonomic Fit (Zero Toe Pressure)';
    upper = 'Breathable Hex-Knit Double Mesh + Durable PU Overlay';
    midsole = 'TruCushion Shock Dampening Dual Midsole (Knee & Heel Protection)';
    outsole = '100% Non-Marking Hexa-Grip Radial Gum Rubber';
    headline = '👟 Yonex HY ULTRAi | TruCushion Shock Dampening & Hexa-Grip Traction';
    playerProfile = 'Daily Club & Academy Badminton Players Seeking Durability & Knee Comfort';
  } else if (name.includes('VOLTREX 2')) {
    brand = 'Yonex';
    tier = 'Tournament';
    fit = 'TruShape Lateral Shell Secure Lockdown';
    upper = 'Lateral Shell Outer PU Support + High-Flow Air Mesh';
    midsole = 'Power Cushion Rebound Foam + High-Density Shock Core';
    outsole = 'Non-Marking Hexa-Grip Gum Rubber with Lateral Stabilizer';
    headline = '👟 Yonex Voltrex 2 | Lateral Shell Stability & High-Impact Court Traction';
    playerProfile = 'Fast-Moving Club Players Requiring Lateral Ankle & Foot Stability';
  } else if (name.includes('VELO 100')) {
    brand = 'Yonex';
    tier = 'Best Seller';
    fit = 'TruShape Ergonomic Contour (Prevents Blisters & Toe Squeeze)';
    upper = 'Breathable Engineered Air Mesh + Durable Synthetic Skin';
    midsole = 'TruCushion Impact Dampening Midsole';
    outsole = '100% Non-Marking Radial Hexagrip Gum Rubber';
    headline = '👟 Yonex VELO 100 | Ultra-Comfort Non-Marking Badminton Court Shoes';
    playerProfile = 'Beginner to Intermediate Badminton Players Demanding Grip & Value';
  }

  const specsObj = {
    'Brand': brand,
    'Model': p.name,
    'Footwear Category': 'Non-Marking Indoor Badminton / Court Shoes',
    'Outsole Material': outsole,
    'Midsole Technology': midsole,
    'Upper Construction': upper,
    'Fit Profile': fit,
    'Court Surface': courtType,
    'Recommended For': playerProfile,
    'Weight (Approx)': '310g (Single Shoe UK 8)',
    'Closure': 'Traditional Lace-Up with Padded Tongue & Heel Collar',
    'Authenticity': '100% Original Equipment Guaranteed',
    'Country of Origin': 'India / China / Vietnam (Authorized Distribution)'
  };

  const specsTableHtml = generateSpecsTable(specsObj);

  const descriptionHtml = `
    <div class="space-y-4">
      <div class="border-b border-gray-100 pb-3">
        <h2 class="text-base font-black text-gray-900 leading-snug">${headline}</h2>
        <p class="text-xs text-red-600 font-bold uppercase tracking-wider mt-1">
          👟 Brand: ${brand} • ${tier}
        </p>
      </div>

      <div>
        <p class="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">⭐ Key Performance Highlights</p>
        <ul class="space-y-1.5 text-xs text-gray-800">
          <li class="flex items-start gap-2">
            <span class="text-amber-500 font-black shrink-0">🛡️</span>
            <span><strong>100% Non-Marking Gum Rubber:</strong> Built with <strong>${outsole}</strong> providing slip-free 360° traction on wooden and synthetic court mats without leaving dark streaks.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-500 font-black shrink-0">☁️</span>
            <span><strong>Advanced Shock Absorption:</strong> Powered by <strong>${midsole}</strong> to absorb heavy landing forces and protect knees, ankles, and lower joints during jump smashes.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 font-black shrink-0">🌬️</span>
            <span><strong>Breathable & Lightweight Upper:</strong> Constructed with <strong>${upper}</strong> to keep feet cool and dry during intense multi-set tournament matches.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-500 font-black shrink-0">👣</span>
            <span><strong>Ergonomic Court Fit:</strong> Features <strong>${fit}</strong> contoured to reduce forefoot pressure points and eliminate blister friction.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-yellow-600 font-black shrink-0">🏅</span>
            <span><strong>Academy & Tournament Approved:</strong> Meets strict court non-marking standards across all Indian state and club badminton academies.</span>
          </li>
        </ul>
      </div>

      <div class="bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/80 text-xs text-gray-700 leading-relaxed">
        <p class="font-bold text-gray-900 mb-1">💡 Coach's Footwear Recommendation:</p>
        <p>In badminton, fast footwork is everything. The <strong>${p.name}</strong> combines firm lateral support with responsive heel-to-toe cushioning, allowing you to lunge forward at the net and push backward for baseline jump smashes with total confidence. Always check our Size Guide modal to match your foot measurement in centimeters (CM) or UK sizing.</p>
      </div>

      ${specsTableHtml}

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
        <span class="text-lg">👟</span>
        <div class="text-[11px] text-amber-900 leading-tight">
          <strong>Size Advice:</strong> For maximum comfort with sports socks, badminton shoes should have roughly 0.5 cm of space at the toes. Refer to our interactive Size Guide above the add-to-cart button!
        </div>
      </div>
    </div>
  `.trim();

  return {
    description: descriptionHtml,
    specs: JSON.stringify(specsObj),
    series: 'Badminton Shoes',
    tier: tier
  };
}

async function runMigration() {
  console.log("🚀 Starting Bulk Product Description & Specs Enrichment...");

  // Sign in as admin to bypass RLS
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@lakshyasports.in',
    password: 'LakshyaAdmin2026!#'
  });

  if (authError) {
    console.error("Auth sign-in failed:", authError.message);
    process.exit(1);
  }

  console.log("✅ Authenticated as Admin successfully.");

  // Fetch all 69 products
  const { data: products, error: fetchErr } = await supabase.from('products').select('*');
  if (fetchErr) {
    console.error("Fetch products failed:", fetchErr);
    process.exit(1);
  }

  console.log(`📦 Found ${products.length} products to enrich.`);

  let updatedCount = 0;
  let failCount = 0;

  for (const p of products) {
    const details = buildProductDetails(p);

    const updatePayload = {
      description: details.description,
      specs: details.specs,
      series: details.series,
      tier: details.tier,
    };

    const { error: updateErr } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', p.id);

    if (updateErr) {
      console.error(`❌ Failed updating [${p.id}] ${p.name}:`, updateErr.message);
      failCount++;
    } else {
      updatedCount++;
      console.log(`✅ [${updatedCount}/${products.length}] Enriched: ${p.name} (${details.series} - ${details.tier})`);
    }
  }

  console.log(`\n🎉 Enrichment Complete! Successfully updated: ${updatedCount}, Failed: ${failCount}`);
}

runMigration();
