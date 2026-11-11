// Shiprocket & Delivery Estimation Service for Lakshya Sports
// Channel ID: 12918420 (Lakshya Sports Custom Channel)
// Store Pickup Locations: Chikkalasandra (560061) & JP Nagar 7th Phase (560078), Bengaluru

export const SHIPROCKET_CHANNEL_ID = 12918420;
export const STORE_PICKUP_PINCODE = '560061';

export interface ShippingEstimate {
  pincode: string;
  isBangalore: boolean;
  isInstantEligible: boolean;
  city: string;
  state: string;
  instantETA: string;
  instantCourier: string;
  standardETA: string;
  standardCourier: string;
  channelId: number;
}

export type ShippingMode = 'instant' | 'standard';

/**
 * Evaluates Indian PIN codes with high precision:
 * - 560xxx: Bengaluru Metro (within 20km radius of Lakshya Sports stores)
 *   Eligible for Shiprocket Quick on-demand 2-hour bike delivery.
 * - Other PIN codes: Pan-India standard express courier (Blue Dart, Delhivery)
 */
export function getDeliveryEstimate(pincode: string): ShippingEstimate | null {
  const cleanPin = pincode.replace(/\D/g, '');
  if (cleanPin.length !== 6) return null;

  const isBangalore = cleanPin.startsWith('560');

  if (isBangalore) {
    return {
      pincode: cleanPin,
      isBangalore: true,
      isInstantEligible: true,
      city: 'Bengaluru',
      state: 'Karnataka',
      instantETA: '60–120 Minutes (Under 2 Hours)',
      instantCourier: 'Shiprocket Quick (Shadowfax / Dunzo / Porter)',
      standardETA: 'Same Day / Next Day',
      standardCourier: 'Shiprocket Express (Blue Dart / Delhivery)',
      channelId: SHIPROCKET_CHANNEL_ID,
    };
  }

  const isKarnatakaOther = cleanPin.startsWith('57') || cleanPin.startsWith('58') || cleanPin.startsWith('59');

  return {
    pincode: cleanPin,
    isBangalore: false,
    isInstantEligible: false,
    city: isKarnatakaOther ? 'Karnataka Regional' : 'National Express Zone',
    state: isKarnatakaOther ? 'Karnataka' : 'Pan-India',
    instantETA: '',
    instantCourier: '',
    standardETA: isKarnatakaOther ? '1–2 Business Days' : '2–4 Business Days',
    standardCourier: 'Shiprocket Express (Blue Dart / Delhivery / DTDC)',
    channelId: SHIPROCKET_CHANNEL_ID,
  };
}

/**
 * Persists the user's selected PIN code in localStorage so that
 * checking delivery on ProductPage carries over automatically to Checkout.
 */
export function getSavedPincode(): string {
  try {
    return localStorage.getItem('lakshya_user_pincode') || '';
  } catch {
    return '';
  }
}

export function saveUserPincode(pincode: string): void {
  try {
    const clean = pincode.replace(/\D/g, '');
    if (clean.length === 6) {
      localStorage.setItem('lakshya_user_pincode', clean);
    }
  } catch {
    // Ignore storage errors in private browsing
  }
}
