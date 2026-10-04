export interface PostalLookupResult {
  success: boolean;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  message?: string;
}

export async function lookupPostalCode(
  postalCode: string,
  countryCode: string = 'IN'
): Promise<PostalLookupResult> {
  const cleanZip = postalCode.trim().replace(/\s+/g, '');
  if (!cleanZip) {
    return { success: false, message: 'Empty postal code' };
  }

  const normalizedCountry = countryCode.toUpperCase();

  // 1. INDIA PIN CODE LOOKUP (api.postalpincode.in)
  if (normalizedCountry === 'IN' || normalizedCountry === 'INDIA') {
    // Standard Indian PIN codes are 6 digits
    if (!/^\d{6}$/.test(cleanZip)) {
      return { success: false, message: 'Indian PIN code must be 6 digits' };
    }

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanZip}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();

      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const district = po.District || po.Block || po.Circle;
        const state = po.State;

        return {
          success: true,
          city: district,
          district: district,
          state: state,
          country: 'India',
        };
      }

      return { success: false, message: 'Invalid Indian PIN code' };
    } catch (err: any) {
      console.warn('India PIN code fetch error:', err);
      return { success: false, message: 'Failed to fetch PIN code data' };
    }
  }

  // 2. INTERNATIONAL POSTAL LOOKUP (api.zippopotam.us)
  const zippoCountryCode = normalizedCountry === 'US' || normalizedCountry === 'UNITED STATES'
    ? 'us'
    : normalizedCountry === 'GB' || normalizedCountry === 'UNITED KINGDOM'
    ? 'gb'
    : normalizedCountry === 'CA' || normalizedCountry === 'CANADA'
    ? 'ca'
    : normalizedCountry === 'DE' || normalizedCountry === 'GERMANY'
    ? 'de'
    : normalizedCountry === 'AU' || normalizedCountry === 'AUSTRALIA'
    ? 'au'
    : normalizedCountry.toLowerCase();

  try {
    const res = await fetch(`https://api.zippopotam.us/${zippoCountryCode}/${encodeURIComponent(cleanZip)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        const city = place['place name'] || '';
        const state = place['state'] || place['state abbreviation'] || '';

        return {
          success: true,
          city,
          district: city,
          state,
          country: data.country || countryCode,
        };
      }
    }
  } catch (err) {
    console.warn('International postal lookup error:', err);
  }

  return { success: false, message: 'Postal code location not found' };
}
