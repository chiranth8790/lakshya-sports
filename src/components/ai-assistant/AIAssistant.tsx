import { useState, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { 
  X, Send, Sparkles, ShoppingBag, Check, 
  RotateCcw, Scale, Truck,
  Package,
  MessageCircle, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../library/supabase';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import MavisShuttleIcon from './MavisShuttleIcon';

// Configurable Assistant Name & Personality
export const ASSISTANT_NAME = 'Smashy';
export const ASSISTANT_TITLE = 'Lakshya AI Pro Coach & Gear Specialist';

// High-speed, responsive Gemini models
const GEMINI_PRIMARY_MODEL = 'gemini-3.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-3-flash-preview';

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  original_price?: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  stock: number;
  series?: string;
  tier?: string;
  description?: string;
  specs?: string;
  colors?: { name: string; image: string; images?: string[] }[];
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderTrackingInfo {
  order_id: string;
  status: string;
  created_at: string;
  total_amount: number;
  items?: OrderItem[];
  customer_name?: string;
  shipping_address?: any;
  tracking_number?: string;
  courier_name?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  products?: ProductItem[];
  order?: OrderTrackingInfo | null;
  suggestions?: string[];
  timestamp: Date;
}

interface SearchAnalysis {
  products: ProductItem[];
  isComparison: boolean;
  targetCategory: string | null;
  maxBudget: number | null;
  brand: string | null;
  isBudgetFallback: boolean;
}

// Verifast-style quick action chips
const ACTION_CHIPS = [
  { label: '🏸 Racket Finder', prompt: 'Help me choose the best racket for my playing style (Singles vs Doubles, Attack vs Control)' },
  { label: '👟 Court Shoes under 4k', prompt: 'Badminton non-marking court shoes under 4k & size guide' },
  { label: '⚡ Astrox vs Nanoflare', prompt: 'Compare Yonex Astrox vs Nanoflare for attacking smashes vs flat drives' },
  { label: '📦 Track My Order', prompt: 'Track my order status' },
  { label: '🎯 String & Tension Guide', prompt: 'What racket string and tension (lbs) should I use for my playing level?' },
  { label: '🛡️ Genuine Guarantee', prompt: 'How does Lakshya Sports guarantee 100% genuine equipment & warranty?' },
];

// Clean Amazon/image tracking artifacts while preserving valid CDNs
const cleanImage = (url?: string) => {
  if (!url) return '';
  let clean = url;
  if (clean.includes('amazon') && clean.includes('?')) {
    clean = clean.split('?')[0];
  }
  clean = clean.replace(/\._[a-zA-Z0-9_]+_\./g, '.');
  clean = clean.replace(/_[0-9]+x[0-9]+(?=\.[a-zA-Z]+$)/g, '');
  return clean;
};

// Normalization helper for space-insensitive, punctuation-free string matching
function cleanToken(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// 1. INTENT & QUERY PARSERS
function parseBudget(text: string): number | null {
  const lower = text.toLowerCase();
  
  // Matches 'under 4k', 'below 4.5k', '4k budget', 'under 4 k'
  const kMatch = lower.match(/(?:under|below|less than|within|budget(?: of)?|max|around|sub)?\s*₹?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    return parseFloat(kMatch[1]) * 1000;
  }
  
  // Matches 'under 4000', 'below 3500', '₹4000', '4000 rs', '4000 inr'
  const numMatch = lower.match(/(?:under|below|less than|within|budget(?: of)?|max|around|sub)\s*₹?\s*(\d{3,6})/i) ||
                   lower.match(/₹\s*(\d{3,6})/i) ||
                   lower.match(/\b(\d{3,6})\s*(?:rs|inr|rupees)\b/i);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }
  return null;
}

function parseCategory(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\b(shoe|shoes|footwear|court shoe|court shoes|sneaker|sneakers|boot|boots)\b/i.test(lower)) return 'shoes';
  if (/\b(racket|racquet|rackets|racquets)\b/i.test(lower)) return 'rackets';
  if (/\b(shuttle|shuttles|shuttlecock|shuttlecocks|mavis|feather|nylon)\b/i.test(lower)) return 'shuttles';
  if (/\b(string|strings|grip|grips)\b/i.test(lower)) return 'grips-and-strings';
  if (/\b(kitbag|kitbags|bag|bags|backpack)\b/i.test(lower)) return 'kitbags';
  if (/\b(bat|bats|cricket)\b/i.test(lower)) return 'cricket';
  return null;
}

function parseBrand(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\byonex\b/i.test(lower)) return 'Yonex';
  if (/\b(li-ning|lining)\b/i.test(lower)) return 'Lining';
  if (/\bvictor\b/i.test(lower)) return 'Victor';
  if (/\basics\b/i.test(lower)) return 'Asics';
  if (/\bhundred\b/i.test(lower)) return 'Hundred';
  if (/\bapacs\b/i.test(lower)) return 'Apacs';
  if (/\bss\b/i.test(lower)) return 'SS';
  if (/\bsg\b/i.test(lower)) return 'SG';
  if (/\bdsc\b/i.test(lower)) return 'DSC';
  return null;
}

function isComparisonQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return /\b(compare|comparison|vs|versus|difference between|better between|which one is better)\b/i.test(lower);
}

// 2. ORDER TRACKING (WISMO) INTENT PARSER
function parseOrderQuery(text: string): { isOrderQuery: boolean; orderId: string | null; contact: string | null } {
  const lower = text.toLowerCase();
  const isOrderQuery = /\b(track|tracking|order|status|where is my|delivery|dispatch|package|wismo)\b/i.test(lower);
  
  // Match Order ID patterns: LAK-XXXXX or UUID or 6+ digit ID
  const orderIdMatch = text.match(/\b(LAK-[A-Za-z0-9_-]+)\b/i) ||
                       text.match(/\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i) ||
                       text.match(/order\s*(?:#|id|number)?\s*[:=]?\s*([A-Za-z0-9_-]{5,36})/i);
                       
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/\b(?:\+91|91)?[6-9]\d{9}\b/);

  return {
    isOrderQuery,
    orderId: orderIdMatch ? orderIdMatch[1] : null,
    contact: emailMatch ? emailMatch[0] : (phoneMatch ? phoneMatch[0] : null),
  };
}

const STOP_WORDS = new Set([
  'suggest', 'recommend', 'recommendation', 'recommendations', 'show', 'give', 'tell', 'me', 'find', 'looking', 'look', 'search',
  'i', 'im', 'we', 'you', 'can', 'please', 'need', 'want', 'buy', 'get', 'best', 'good', 'top', 'great', 'better',
  'cheap', 'affordable', 'budget', 'under', 'below', 'less', 'than', 'more', 'above', 'around', 'about', 'within',
  'badminton', 'sports', 'lakshya', 'court', 'indoor', 'for', 'the', 'a', 'an', 'and', 'or', 'with', 'in', 'at', 'to',
  'price', 'rs', 'inr', 'rupees', 'k', 'item', 'items', 'product', 'products',
  'shoe', 'shoes', 'footwear', 'racket', 'racquet', 'rackets', 'racquets', 'shuttle', 'shuttles', 'bat', 'bats',
  'compare', 'comparison', 'vs', 'versus', 'difference', 'between'
]);

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, ' ');
  return lower
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+k?$/.test(w));
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // In-memory catalog cache for instant fuzzy matching & comparisons
  const catalogCacheRef = useRef<ProductItem[]>([]);
  const isCacheLoadedRef = useRef<boolean>(false);

  const { addToCart } = useCart();
  const { success } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 **Welcome to Lakshya Sports!** I am **${ASSISTANT_NAME}**, your AI Pro Coach & Gear Specialist. 🏸\n\nInspired by elite tournament standards, I can help you with:\n• 🏸 **Finding the perfect racket** for your attacking or control style\n• 👟 **Non-marking court shoes** & size matching\n• ⚡ **Head-to-head gear comparisons** (e.g., Astrox vs Nanoflare)\n• 📦 **Live order tracking** & dispatch status\n• 🎯 **Custom electronic stringing & tension guidance**\n\nHow can I help you dominate the court today?`,
      suggestions: [
        '🏸 Recommend an attacking racket',
        '👟 Best badminton shoes under 4k',
        '⚡ Compare Astrox 77 Pro vs Arcsaber 11 Pro',
        '📦 Track my order'
      ],
      timestamp: new Date(),
    },
  ]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  // Pre-load store catalog into client memory
  useEffect(() => {
    async function preloadCatalog() {
      if (isCacheLoadedRef.current) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, brand, category, price, original_price, image, images, stock, series, tier, description, specs, colors')
          .gt('stock', 0);
        
        if (!error && data) {
          catalogCacheRef.current = data.map((item: any) => ({
            ...item,
            price: Number(item.price || 0),
            original_price: Number(item.original_price || item.originalPrice || 0),
            image: item.image || (item.images && item.images.length > 0 ? item.images[0] : '') || (item.colors && item.colors.length > 0 ? item.colors[0].image : '') || '',
            stock: Number(item.stock || 0),
          }));
          isCacheLoadedRef.current = true;
        }
      } catch (err) {
        console.warn('Catalog preload error:', err);
      }
    }
    preloadCatalog();
  }, []);

  // Live Order Lookup (Verifast WISMO Feature)
  async function lookupOrder(orderId: string, contact?: string | null): Promise<OrderTrackingInfo | null> {
    try {
      // 1. Try RPC track_order
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('track_order', {
          p_order_id: orderId.trim(),
          p_contact: contact ? contact.trim() : null
        });
        if (!rpcErr && rpcRes && rpcRes.found && rpcRes.order) {
          return rpcRes.order;
        }
      } catch (e) {
        console.warn('RPC lookup fallback:', e);
      }

      // 2. Direct table lookup
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`order_id.eq.${orderId.trim()},id.eq.${orderId.trim()}`)
        .maybeSingle();

      if (!error && data) {
        return {
          order_id: data.order_id || data.id,
          status: data.status || 'Processing',
          created_at: data.created_at,
          total_amount: Number(data.total_amount || 0),
          items: data.items || [],
          customer_name: data.customer_name,
          shipping_address: data.shipping_address,
          tracking_number: data.tracking_number,
          courier_name: data.courier_name,
        };
      }
    } catch (e) {
      console.error('Order tracking fetch error:', e);
    }
    return null;
  }

  // 3. ULTRA-INTELLIGENT CATALOG SEARCH (FUZZY, COMPARISONS & RELEVANCE)
  async function searchCatalog(queryText: string): Promise<SearchAnalysis> {
    const isComparison = isComparisonQuery(queryText);
    const maxBudget = parseBudget(queryText);
    const targetCategory = parseCategory(queryText);
    const brand = parseBrand(queryText);
    const keywords = extractKeywords(queryText);

    let catalog = catalogCacheRef.current;
    if (!catalog || catalog.length === 0) {
      try {
        const { data } = await supabase
          .from('products')
          .select('id, name, brand, category, price, original_price, image, images, stock, series, tier, description, specs, colors')
          .gt('stock', 0);
        if (data) {
          catalog = data.map((item: any) => ({
            ...item,
            price: Number(item.price || 0),
            original_price: Number(item.original_price || item.originalPrice || 0),
            image: item.image || (item.images && item.images.length > 0 ? item.images[0] : '') || (item.colors && item.colors.length > 0 ? item.colors[0].image : '') || '',
            stock: Number(item.stock || 0),
          }));
          catalogCacheRef.current = catalog;
          isCacheLoadedRef.current = true;
        }
      } catch (e) {
        console.error('Direct fetch catalog error:', e);
      }
    }

    const cleanQuery = cleanToken(queryText);

    // Exact or Space-Insensitive Direct Match
    const exactNameMatches: ProductItem[] = [];
    for (const item of catalog) {
      const cleanName = cleanToken(item.name);
      if (cleanName.length >= 3 && cleanQuery.includes(cleanName)) {
        exactNameMatches.push(item);
      }
    }

    if (exactNameMatches.length > 0) {
      return {
        products: exactNameMatches.slice(0, 4),
        isComparison,
        targetCategory: targetCategory || exactNameMatches[0].category,
        maxBudget,
        brand,
        isBudgetFallback: false,
      };
    }

    // Category & Budget Filter
    let candidates = [...catalog];

    if (targetCategory) {
      candidates = candidates.filter((item) => 
        item.category.toLowerCase().includes(targetCategory)
      );
    }

    if (brand) {
      candidates = candidates.filter((item) => 
        item.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    if (maxBudget) {
      const budgetMatched = candidates.filter((item) => item.price <= maxBudget * 1.05);
      if (budgetMatched.length > 0) {
        candidates = budgetMatched;
      } else if (targetCategory && candidates.length > 0) {
        candidates.sort((a, b) => a.price - b.price);
        return {
          products: candidates.slice(0, 3),
          isComparison,
          targetCategory,
          maxBudget,
          brand,
          isBudgetFallback: true,
        };
      }
    }

    // Keyword Scoring
    if (keywords.length > 0) {
      const scored = candidates.map((item) => {
        let score = 0;
        const itemClean = cleanToken(`${item.name} ${item.brand} ${item.series || ''} ${item.description || ''}`);
        for (const kw of keywords) {
          const cleanKw = cleanToken(kw);
          if (cleanKw.length >= 3 && itemClean.includes(cleanKw)) {
            score += 10;
          }
        }
        return { item, score };
      });

      const filtered = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
      if (filtered.length > 0) {
        candidates = filtered.map((s) => s.item);
      }
    }

    candidates.sort((a, b) => a.price - b.price);

    return {
      products: candidates.slice(0, 4),
      isComparison,
      targetCategory,
      maxBudget,
      brand,
      isBudgetFallback: false,
    };
  }

  // 4. GEMINI GENERATION
  async function callGemini(model: string, apiKey: string, prompt: string, enableSearch: boolean = false): Promise<string | null> {
    try {
      const bodyPayload: any = {
        contents: [{ parts: [{ text: prompt }] }],
      };

      if (enableSearch) {
        bodyPayload.tools = [{ google_search: {} }];
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (!res.ok) {
        if (enableSearch) {
          return callGemini(model, apiKey, prompt, false);
        }
        return null;
      }

      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const text = parts
        .filter((p: any) => typeof p.text === 'string' && !p.thought)
        .map((p: any) => p.text)
        .join('\n');

      return text || parts[0]?.text || null;
    } catch {
      if (enableSearch) {
        return callGemini(model, apiKey, prompt, false);
      }
      return null;
    }
  }

  // 5. AUTONOMOUS VERIFAST-STYLE CHATBOT ORCHESTRATION
  async function handleSend(userText?: string) {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    setInput('');
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Step 1: Check for WISMO (Where Is My Order) / Order Tracking
      const orderQuery = parseOrderQuery(textToSend);
      if (orderQuery.isOrderQuery && orderQuery.orderId) {
        const orderData = await lookupOrder(orderQuery.orderId, orderQuery.contact);
        if (orderData) {
          const orderMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: `📦 **Order Status Found!** Here are the live tracking details for order **#${orderData.order_id}**:`,
            order: orderData,
            suggestions: ['Track Another Order', 'Ask about stringing specs', 'Chat with Coach on WhatsApp'],
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, orderMsg]);
          if (!isOpen) setHasUnread(true);
          setLoading(false);
          return;
        } else {
          const notFoundMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: `🔍 **Order Tracking Status**\nWe couldn't locate an order with ID **"${orderQuery.orderId}"**.\n\nPlease double check your confirmation email/SMS or provide the phone number used at checkout. You can also track directly on our tracking portal or message our support team on WhatsApp!`,
            suggestions: ['Go to Track Order Page', 'Connect on WhatsApp', 'Browse Badminton Rackets'],
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, notFoundMsg]);
          if (!isOpen) setHasUnread(true);
          setLoading(false);
          return;
        }
      } else if (orderQuery.isOrderQuery && !orderQuery.orderId) {
        const promptMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `📦 **Live Order Tracking (WISMO)**\nTo check your dispatch and delivery status, please reply with your **Order ID** (e.g., \`LAK-10294\` or your order UUID) or your registered mobile number.\n\nYou can also visit our full tracking page anytime!`,
          suggestions: ['Visit Track Order Page', 'Speak to human support on WhatsApp'],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, promptMsg]);
        if (!isOpen) setHasUnread(true);
        setLoading(false);
        return;
      }

      // Step 2: Catalog Search & Recommendation
      const searchAnalysis = await searchCatalog(textToSend);
      const { products: catalogMatches, isComparison, maxBudget, isBudgetFallback } = searchAnalysis;

      let botResponseText = '';
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (geminiApiKey) {
        const catalogContext = catalogMatches.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: `₹${p.price.toLocaleString('en-IN')}`,
          originalPrice: p.original_price ? `₹${p.original_price.toLocaleString('en-IN')}` : undefined,
          series: p.series,
          tier: p.tier,
          specs: p.specs || undefined,
        }));

        let situationNotes = '';
        if (isComparison) {
          situationNotes += `USER INTENT: HEAD-TO-HEAD COMPARISON.
Structure your reply with the following Verifast-style sections:
1. ⚡ **Head-to-Head Comparison Matrix**:
   - Balance Point & Weight (Head-Heavy vs Head-Light vs Even Balance)
   - Shaft Stiffness & Whip (Extra Stiff, Stiff, Medium, Hi-Flex)
   - Outsole / Cushioning (For shoes: Non-marking Gum Rubber, Power Cushion, HYPEREVA, FF BLAST)
   - Sweet Spot & Frame Aerodynamics
2. 💡 **Definitive Coach's Pick**: Declare clear winners for specific play styles (Singles Smasher vs Fast Doubles Drive vs All-Court Control). Never be neutral!
3. 🎯 **1-2 Quick Follow-Up Questions** to lock in their choice (singles vs doubles, string tension, foot width).
4. Mention they can tap "Add" on any product card below to add directly to their cart with custom electronic stringing!`;
        } else if (isBudgetFallback && maxBudget && catalogMatches.length > 0) {
          situationNotes += `USER INTENT: Budget under ₹${maxBudget.toLocaleString('en-IN')}.
Transparently explain that while options under ₹${maxBudget.toLocaleString('en-IN')} are currently limited, our closest verified tournament-grade gear starts at ₹${catalogMatches[0].price.toLocaleString('en-IN')}. Highlight their real value and durability.`;
        } else if (catalogMatches.length === 0) {
          situationNotes += `USER INTENT: Inquiring about badminton technical advice, rules, or stringing.
Deliver authoritative coaching advice with sports symbols (🏸, ⚡, 👟, 🎯, ⚖️, 🛡️). Mention that Lakshya Sports offers custom electronic tournament stringing and 100% genuine equipment verified with Sunrise Hologram scratch codes.`;
        }

        const systemPrompt = `You are "${ASSISTANT_NAME}", the ultimate AI Pro Badminton Coach & Gear Specialist at Lakshya Sports in Bengaluru (inspired by the Verifast conversational assistant on Nivia Sports).
You are an authority on badminton gear, court footwear, racket biomechanics, string tensions, and player performance.

CRITICAL DELIVERY FORMAT (THE VERIFAST METHOD):
- Use clean sports symbols & emoji bullets (⚡, 🏸, 👟, 🎯, ⚖️, 🛡️, 💡, 🧵)
- Format with bold headers and clear, high-converting bullet points.
- Always include:
  • ⚡ **Pro Verdict / Quick Recommendation**
  • 🏸 / 👟 **Key Specifications Matrix** (Flex, Balance, Weight/Grip, Tension lbs, Non-marking Gum Rubber Outsole)
  • 💡 **Best Suited For (Player Profile)**
  • 🛡️ **Lakshya Guarantee** (100% Genuine with Sunrise Hologram, Custom Electronic Stringing in-house)
- End with 1-2 interactive coaching questions.

IN-STOCK STORE CATALOG ITEMS AVAILABLE TO RECOMMEND:
${JSON.stringify(catalogContext)}

${situationNotes ? `\nCURRENT SITUATION GUIDANCE:\n${situationNotes}` : ''}`;

        const fullPrompt = `${systemPrompt}\n\nCustomer Inquiry: "${textToSend}"`;

        try {
          botResponseText = (await callGemini(GEMINI_PRIMARY_MODEL, geminiApiKey, fullPrompt, true)) || '';
          if (!botResponseText) {
            botResponseText = (await callGemini(GEMINI_FALLBACK_MODEL, geminiApiKey, fullPrompt, false)) || '';
          }
        } catch (apiErr) {
          console.warn('Gemini API call failed, falling back to local expert summary:', apiErr);
        }
      }

      if (!botResponseText) {
        if (catalogMatches.length > 0) {
          botResponseText = `Here are our top tournament-grade options that match your query! 🏸\n\nEvery item is 100% genuine with official Hologram verification and eligible for custom electronic stringing. Tap "Add" to place directly in your cart:`;
        } else {
          botResponseText = `I couldn't locate an exact product match in our active catalog right now, but I can guide you through our complete collection of Yonex Astrox, Nanoflare, Arcsaber rackets, and non-marking court shoes! What playing style or budget can I assist you with?`;
        }
      }

      // Generate smart follow-up suggestions
      const suggestions: string[] = [];
      if (catalogMatches.length > 0) {
        suggestions.push(`What string tension should I use?`);
        if (catalogMatches[0].category === 'rackets') {
          suggestions.push(`Compare with ${catalogMatches[0].name.includes('Astrox') ? 'Nanoflare 1000 Play' : 'Astrox 77 Pro'}`);
        } else {
          suggestions.push(`Show interactive Size Guide`);
        }
        suggestions.push(`Chat on WhatsApp`);
      } else {
        suggestions.push('Show all badminton rackets', 'Show non-marking court shoes', 'Track my order');
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: botResponseText,
        products: catalogMatches,
        suggestions: suggestions.slice(0, 3),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setHasUnread(true);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "Caught in the net! 🏸 Let me fetch our recommendations again. You can also DM our flagship Bengaluru store directly via WhatsApp!",
          suggestions: ['Show best selling rackets', 'Track my order', 'Talk on WhatsApp'],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // DIRECT IN-CHAT "ADD TO CART"
  const handleAddToCart = (e: MouseEvent, product: ProductItem) => {
    e.stopPropagation();
    const rawImg = product.image || (product.images && product.images[0]) || '';
    const displayImg = cleanImage(rawImg);

    (addToCart as any)({
      ...product,
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: displayImg,
      images: product.images || [displayImg],
      stock: Number(product.stock || 10),
      quantity: 1,
    });

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    success(`Added "${product.name}" to your cart! 🏸`);

    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2500);
  };

  return (
    <>
      {/* 1. FLOATING MAVIS SHUTTLECOCK MASCOT (BOTTOM-RIGHT) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="mb-2 bg-neutral-950 border border-neutral-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transform hover:scale-105 transition animate-bounce"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Need gear advice or order tracking? Ask Smashy! 🏸</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={`Open ${ASSISTANT_NAME} AI Gear Specialist`}
          className="relative bg-gradient-to-tr from-amber-400 via-yellow-400 to-lime-400 p-2.5 rounded-full shadow-2xl border-2 border-white hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        >
          {isOpen ? (
            <div className="w-12 h-12 flex items-center justify-center bg-neutral-950 rounded-full text-white">
              <X className="w-6 h-6" />
            </div>
          ) : (
            <div className="relative">
              <MavisShuttleIcon size={52} className="group-hover:rotate-12 transition-transform duration-300" />
              {hasUnread && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full animate-pulse" />
              )}
            </div>
          )}
        </button>
      </div>

      {/* 2. CHAT WINDOW / VERIFAST-STYLE BOT DRAWER */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[94vw] sm:w-[460px] max-h-[86vh] h-[680px] bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 font-sans">
          
          {/* Header */}
          <div className="bg-neutral-950 text-white p-3.5 flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center overflow-hidden">
                <MavisShuttleIcon size={34} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-white uppercase">{ASSISTANT_NAME}</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                    Verifast AI Coach
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{ASSISTANT_TITLE}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([{
                  id: 'reset',
                  sender: 'assistant',
                  text: `Court refreshed! 🏸 What badminton gear or order can I inspect, compare, or track for you?`,
                  suggestions: ['🏸 Attacking rackets', '👟 Shoes under 4k', '📦 Track order'],
                  timestamp: new Date()
                }])}
                title="Restart conversation"
                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Verifast Quick Action Bar */}
          <div className="bg-gray-50 border-b border-gray-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {ACTION_CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip.prompt)}
                className="whitespace-nowrap bg-white hover:bg-neutral-900 hover:text-white border border-gray-200 text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-full transition shadow-2xs shrink-0 flex items-center gap-1"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-neutral-950 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-200/90 rounded-bl-none shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* WISMO / Live Order Tracking Card */}
                {msg.order && (
                  <div className="mt-3 w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-black text-gray-900 uppercase">
                          Order #{msg.order.order_id}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        msg.order.status.toLowerCase() === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : msg.order.status.toLowerCase() === 'shipped'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {msg.order.status}
                      </span>
                    </div>

                    {/* Progress Dots */}
                    <div className="grid grid-cols-4 gap-1.5 py-1 text-center">
                      {['Placed', 'Processing', 'Dispatched', 'Delivered'].map((step, idx) => {
                        const statusLower = (msg.order?.status || '').toLowerCase();
                        let currentStep = 1;
                        if (statusLower === 'delivered') currentStep = 4;
                        else if (statusLower === 'shipped') currentStep = 3;
                        else if (statusLower === 'processing' || statusLower === 'paid' || statusLower === 'confirmed') currentStep = 2;

                        const isDone = idx + 1 <= currentStep;
                        return (
                          <div key={step} className="flex flex-col items-center gap-1">
                            <div className={`w-full h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                            <span className={`text-[9px] font-bold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-2.5 text-[11px] text-gray-700 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Total:</span>
                        <span className="font-black text-gray-900">₹{msg.order.total_amount.toLocaleString('en-IN')}</span>
                      </div>
                      {msg.order.tracking_number && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Courier Tracking:</span>
                          <span className="font-mono font-bold text-red-600">{msg.order.tracking_number} ({msg.order.courier_name || 'Express'})</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/track-order?id=${msg.order.order_id}`}
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-neutral-900 hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider py-2 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>View Live Courier Map & Details</span>
                    </Link>
                  </div>
                )}

                {/* Grounded Recommended Product Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 w-full space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5 ml-1">
                      {isComparisonQuery(msg.text) ? (
                        <>
                          <Scale className="w-3.5 h-3.5 text-amber-500" />
                          <span>Compared Gear In-Stock:</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Recommended Products:</span>
                        </>
                      )}
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                      {msg.products.map((item) => {
                        const rawImg = item.image || (item.images && item.images[0]) || (item.colors && item.colors[0]?.image) || '';
                        const displayImg = cleanImage(rawImg);
                        const isAdded = addedItemIds[item.id];
                        const origPrice = Number(item.original_price || item.originalPrice || 0);
                        const sellPrice = Number(item.price);
                        const discountPct = origPrice > sellPrice ? Math.round(((origPrice - sellPrice) / origPrice) * 100) : 0;

                        return (
                          <div
                            key={item.id}
                            className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs hover:shadow-md transition flex items-center gap-3 group relative"
                          >
                            {/* Product Thumbnail */}
                            <Link
                              to={`/product/${item.id}`}
                              onClick={() => setIsOpen(false)}
                              className="w-16 h-16 shrink-0 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center p-1 overflow-hidden"
                            >
                              {displayImg ? (
                                <img
                                  src={displayImg}
                                  alt={item.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <Sparkles className="w-6 h-6 text-gray-300" />
                              )}
                            </Link>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black uppercase text-red-600 tracking-wider">
                                  {item.brand || 'Yonex'}
                                </span>
                                {item.tier && (
                                  <span className="text-[8px] bg-neutral-900 text-white font-bold px-1.5 py-0.2 rounded">
                                    {item.tier}
                                  </span>
                                )}
                              </div>

                              <Link
                                to={`/product/${item.id}`}
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-bold text-gray-900 truncate block hover:text-red-600 transition"
                                title={item.name}
                              >
                                {item.name}
                              </Link>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black text-gray-900">
                                  ₹{sellPrice.toLocaleString('en-IN')}
                                </span>
                                {origPrice > sellPrice && (
                                  <>
                                    <span className="text-[10px] text-gray-400 line-through">
                                      ₹{origPrice.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-[9px] font-black text-emerald-600">
                                      {discountPct}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Add To Cart Button */}
                            <button
                              onClick={(e) => handleAddToCart(e, item)}
                              disabled={item.stock <= 0}
                              className={`shrink-0 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                                isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Follow-Up Suggestion Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && msg.sender === 'assistant' && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (sug.includes('WhatsApp')) {
                            window.open('https://wa.me/919999999999?text=Hi%20Lakshya%20Sports,%20I%20need%20custom%20badminton%20gear%20advice!', '_blank');
                          } else if (sug.includes('Track Order Page')) {
                            setIsOpen(false);
                            window.location.href = '/track-order';
                          } else {
                            handleSend(sug);
                          }
                        }}
                        className="text-[10px] font-semibold bg-white hover:bg-neutral-100 text-gray-700 border border-gray-200/90 rounded-full px-2.5 py-1 transition flex items-center gap-1 shadow-2xs"
                      >
                        {sug.includes('WhatsApp') ? (
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                        )}
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 w-fit">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-semibold text-gray-600 ml-1">
                  Smashy is analyzing tournament catalog specs...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything: track order, compare gear, best racket..."
              className="flex-1 bg-gray-100 focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-neutral-300 outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-neutral-950 hover:bg-red-600 disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
