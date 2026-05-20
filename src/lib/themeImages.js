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
  
      description: 'Modern Commercial Retail Shop Front'
    };
  }

  // 2. Land / Plot / Acreage / Site / Farm
  if (query.includes('land') || query.includes('plot') || query.includes('acre') || query.includes('site') || query.includes('parcel') || query.includes('farm')) {
    return {
      icon: '🗺️ Land / Serviced Plot',
      tag: 'Serviced Acreage',
  
      description: 'Scenic Green Land Parcel & Cadastral Acreage'
    };
  }

  // 3. Apartment / Suite / Flat / Condo / Studio
  if (query.includes('apartment') || query.includes('apt') || query.includes('suite') || query.includes('flat') || query.includes('condo') || query.includes('studio') || query.includes('room')) {
    return {
      icon: '🏢 Modern Apartment / Suite',
      tag: 'Residential High-Rise',
  
      description: 'Premium Modern Residential Complex'
    };
  }

  // 4. Warehouse / Industrial / Storage / Logistics
  if (query.includes('warehouse') || query.includes('industrial') || query.includes('factory') || query.includes('logistics') || query.includes('depot') || query.includes('storage')) {
    return {
      icon: '🏭 Industrial Warehouse / Depot',
      tag: 'Industrial Facility',
  
      description: 'Modern High-Ceiling Logistics Facility & Warehouse'
    };
  }

  // 5. Office / Commercial Complex / Skyscraper / Plaza
  if (query.includes('office') || query.includes('commercial') || query.includes('tower') || query.includes('plaza') || query.includes('skyscraper') || query.includes('complex')) {
    return {
      icon: '💼 Commercial Office Tower',
      tag: 'Corporate Complex',
  
      description: 'Sleek Corporate Glass & Steel Skyscraper'
    };
  }

  // 6. Villa / Standalone House / Mansion / Townhouse / Penthouse / Single Family
  if (query.includes('villa') || query.includes('house') || query.includes('mansion') || query.includes('townhouse') || query.includes('penthouse') || query.includes('residence') || query.includes('home')) {
    return {
      icon: '🏡 Executive House / Villa',
      tag: 'Luxury Standalone',
  
      description: 'Executive Luxury Villa with Enclosed Perimeter'
    };
  }

  // Default Fallback
  return {
    icon: '🏢 Standard Property / Unit',
    tag: 'Premium Real Estate',

    description: 'Certified Modern Architectural Real Estate Asset'
  };
};
