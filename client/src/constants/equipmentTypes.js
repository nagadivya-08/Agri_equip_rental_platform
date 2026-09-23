/**
 * Agricultural Equipment Categories for AgriRent Platform
 * Shared constants for creation, editing, filtering, and displaying equipment types.
 */

export const EQUIPMENT_TYPES = [
  { value: 'tractor', label: 'Tractor' },
  { value: 'power_tiller', label: 'Power Tiller' },
  { value: 'rotavator', label: 'Rotavator' },
  { value: 'plough', label: 'Plough' },
  { value: 'cultivator', label: 'Cultivator' },
  { value: 'disc_harrow', label: 'Disc Harrow' },
  { value: 'land_leveler', label: 'Land Leveler' },
  { value: 'seed_drill', label: 'Seed Drill' },
  { value: 'planter', label: 'Planter' },
  { value: 'transplanter', label: 'Transplanter' },
  { value: 'water_pump', label: 'Water Pump' },
  { value: 'sprinkler_system', label: 'Sprinkler System' },
  { value: 'combine_harvester', label: 'Combine Harvester' },
  { value: 'reaper', label: 'Reaper' },
  { value: 'thresher', label: 'Thresher' },
  { value: 'chaff_cutter', label: 'Chaff Cutter' },
  { value: 'rice_mill', label: 'Rice Mill' },
  { value: 'grain_dryer', label: 'Grain Dryer' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'power_sprayer', label: 'Power Sprayer' },
  { value: 'drone_sprayer', label: 'Drone Sprayer' },
  { value: 'baler', label: 'Baler' },
  { value: 'weeder', label: 'Weeder' },
  { value: 'other', label: 'Other Equipment' },
];

/**
 * Full list including legacy aliases to support displaying existing records smoothly
 */
export const ALL_EQUIPMENT_TYPES = [
  ...EQUIPMENT_TYPES,
  { value: 'harvester', label: 'Combine Harvester' },
  { value: 'sprayer', label: 'Power Sprayer' },
  { value: 'tiller', label: 'Power Tiller' },
  { value: 'drone', label: 'Agricultural Drone' },
];

/**
 * Get clean human-readable title label for an equipment type
 * @param {string} typeValue - Raw snake_case or legacy type value
 * @returns {string} Human-readable label (e.g. "Power Tiller", "Seed Drill")
 */
export const getEquipmentTypeLabel = (typeValue) => {
  if (!typeValue) return 'Equipment';
  const cleanVal = String(typeValue).toLowerCase().trim();
  const matched = ALL_EQUIPMENT_TYPES.find(
    (item) => item.value.toLowerCase() === cleanVal
  );
  if (matched) return matched.label;

  // Fallback: format snake_case to Title Case
  return cleanVal
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default EQUIPMENT_TYPES;
