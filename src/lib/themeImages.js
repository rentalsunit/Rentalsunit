/**
 * Real Estate & Rental Unit Theme Classifier
 * Automatically detects the property or unit category from title, type, and description keywords
 * and assigns standard premium high-resolution Unsplash architectural assets and themed icons.
 * This eliminates the need for user image uploads, optimizing database storage quota.
 */

export const getThemedAsset = (name = '', type = '', category = '') => {
  const query = `${name} ${type} ${category}`.toLowerCase();

  // 1. Shop / Retail Store / Commercial Storefront / Boutique
  if (query.includes('shop') || query.includes('store') || query.includes('retail') || query.includes('boutique') || query.includes('supermarket') || query.includes('mart')) {
    return {
      icon: '🏪 Shop / Store',
      tag: 'Retail Commercial',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      description: 'Modern Commercial Retail Shop Front'
    };
  }

  // 2. Land / Plot / Acreage / Site / Farm
  if (query.includes('land') || query.includes('plot') || query.includes('acre') || query.includes('site') || query.includes('parcel') || query.includes('farm')) {
    return {
      icon: '🗺️ Land / Serviced Plot',
      tag: 'Serviced Acreage',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      description: 'Scenic Green Land Parcel & Cadastral Acreage'
    };
  }

  // 3. Apartment / Suite / Flat / Condo / Studio
  if (query.includes('apartment') || query.includes('apt') || query.includes('suite') || query.includes('flat') || query.includes('condo') || query.includes('studio') || query.includes('room')) {
    return {
      icon: '🏢 Modern Apartment / Suite',
      tag: 'Residential High-Rise',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      description: 'Premium Modern Residential Complex'
    };
  }

  // 4. Warehouse / Industrial / Storage / Logistics
  if (query.includes('warehouse') || query.includes('industrial') || query.includes('factory') || query.includes('logistics') || query.includes('depot') || query.includes('storage')) {
    return {
      icon: '🏭 Industrial Warehouse / Depot',
      tag: 'Industrial Facility',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      description: 'Modern High-Ceiling Logistics Facility & Warehouse'
    };
  }

  // 5. Office / Commercial Complex / Skyscraper / Plaza
  if (query.includes('office') || query.includes('commercial') || query.includes('tower') || query.includes('plaza') || query.includes('skyscraper') || query.includes('complex')) {
    return {
      icon: '💼 Commercial Office Tower',
      tag: 'Corporate Complex',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      description: 'Sleek Corporate Glass & Steel Skyscraper'
    };
  }

  // 6. Villa / Standalone House / Mansion / Townhouse / Penthouse / Single Family
  if (query.includes('villa') || query.includes('house') || query.includes('mansion') || query.includes('townhouse') || query.includes('penthouse') || query.includes('residence') || query.includes('home')) {
    return {
      icon: '🏡 Executive House / Villa',
      tag: 'Luxury Standalone',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      description: 'Executive Luxury Villa with Enclosed Perimeter'
    };
  }

  // Default Fallback
  return {
    icon: '🏢 Standard Property / Unit',
    tag: 'Premium Real Estate',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: 'Certified Modern Architectural Real Estate Asset'
  };
};
