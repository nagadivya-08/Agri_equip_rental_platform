/**
 * Agricultural Equipment Categories for AgriRent Platform
 * Comprehensive metadata for each equipment type, including agricultural details,
 * typical power/specs, best suited crops, key benefits, and related equipment types.
 */

export const EQUIPMENT_TYPES = [
  {
    value: 'tractor',
    label: 'Tractor',
    icon: '🚜',
    category: 'Tractor & Heavy Machinery',
    description:
      'All-purpose primary agricultural machine for pulling implements, heavy-duty tillage, haulage, and powering PTO equipment.',
    typicalPower: '35 - 90 HP (2WD / 4WD)',
    bestSuitedFor:
      'Land preparation, deep ploughing, disc harrowing, trolley haulage, and sowing operations.',
    keyBenefits: [
      'Universal implement compatibility',
      'High pulling power and torque',
      'Suitable for all crop terrains',
    ],
    relatedTypes: ['power_tiller', 'rotavator', 'cultivator', 'trailer'],
  },
  {
    value: 'power_tiller',
    label: 'Power Tiller',
    icon: '🚜',
    category: 'Land Preparation & Puddling',
    description:
      'Walk-behind two-wheel motorized machine with rotary blades, ideal for small farm plots, orchards, and wetland paddy puddling.',
    typicalPower: '8 - 15 HP Diesel',
    bestSuitedFor:
      'Wetland paddy fields, hilly terrains, small vegetable gardens, and narrow inter-row tilling.',
    keyBenefits: [
      'Agile in wet and waterlogged soils',
      'Cost-effective alternative to full-sized tractors',
      'Low fuel consumption',
    ],
    relatedTypes: ['tractor', 'rotavator', 'weeder', 'cultivator'],
  },
  {
    value: 'rotavator',
    label: 'Rotavator',
    icon: '⚙️',
    category: 'Secondary Tillage',
    description:
      'Tractor-drawn rotary tiller with curved blades that pulverizes soil, blends crop residue, and prepares a ready-to-sow seedbed in a single pass.',
    typicalPower: 'Requires 35 - 65 HP Tractor PTO',
    bestSuitedFor:
      'Post-harvest stubble mixing, seedbed preparation for wheat, paddy, cotton, and vegetables.',
    keyBenefits: [
      'Saves 30-35% fuel compared to multiple ploughings',
      'Complete soil pulverization in single pass',
      'Effective stubble and trash incorporation',
    ],
    relatedTypes: ['power_tiller', 'cultivator', 'disc_harrow', 'plough'],
  },
  {
    value: 'plough',
    label: 'Plough',
    icon: '⛏️',
    category: 'Primary Tillage',
    description:
      'Deep soil-inverting implement (MB plough, disc plough, or chisel plough) that cuts, lifts, and turns hardpan soil to bury weeds and expose subsoil to sunlight.',
    typicalPower: 'Requires 35 - 75 HP Tractor',
    bestSuitedFor:
      'Virgin land opening, post-monsoon deep tillage, hard clod breaking, and root aerating.',
    keyBenefits: [
      'Breaks up deep hard soil crusts',
      'Destroys underground pest pupae and perennial weeds',
      'Improves water infiltration capacity',
    ],
    relatedTypes: ['disc_harrow', 'cultivator', 'rotavator', 'tractor'],
  },
  {
    value: 'cultivator',
    label: 'Cultivator',
    icon: '/icons/cultivator.svg',
    category: 'Secondary Tillage & Inter-Cultivation',
    description:
      'Spring-loaded or rigid-tine implement that stirs and pulverizes soil before planting, aerates root zones, and eradicates emerging weeds.',
    typicalPower: 'Requires 30 - 55 HP Tractor (9 to 13 tines)',
    bestSuitedFor:
      'Secondary seedbed aeration, inter-row weeding, and loosening dry crusts in rainfed crops.',
    keyBenefits: [
      'Quick surface coverage for fast seedbeds',
      'Preserves moisture in subsoil',
      'Effective at uprooting wild grasses',
    ],
    relatedTypes: ['rotavator', 'plough', 'disc_harrow', 'weeder'],
  },
  {
    value: 'disc_harrow',
    label: 'Disc Harrow',
    icon: '💿',
    category: 'Secondary Tillage',
    description:
      'Gang of concave steel discs that chop crop residues, break heavy soil clods, and smooth the field surface after primary ploughing.',
    typicalPower: 'Requires 40 - 75 HP Tractor (12 to 20 discs)',
    bestSuitedFor:
      'Dryland farming, cotton/sugarcane trash cutting, and clod breaking in clayey soils.',
    keyBenefits: [
      'Slices tough crop roots and stalks',
      'Uniform soil pulverization',
      'Fast field leveling and finishing',
    ],
    relatedTypes: ['plough', 'rotavator', 'land_leveler', 'cultivator'],
  },
  {
    value: 'land_leveler',
    label: 'Land Leveler',
    icon: '📐',
    category: 'Field Grading & Water Conservation',
    description:
      'Laser-guided or mechanical scraper blade that creates an impeccably flat field grade for uniform water, nutrient, and seed distribution.',
    typicalPower: 'Requires 45 - 75 HP Tractor with Laser Transmitter',
    bestSuitedFor:
      'Paddy basin preparation, precision furrow irrigation, and eliminating water logging spots.',
    keyBenefits: [
      'Reduces irrigation water usage by 25-30%',
      'Increases cultivable area by 3-5%',
      'Promotes uniform crop germination',
    ],
    relatedTypes: ['tractor', 'disc_harrow', 'rotavator', 'cultivator'],
  },
  {
    value: 'seed_drill',
    label: 'Seed Drill',
    icon: '🌱',
    category: 'Sowing & Planting',
    description:
      'Tractor-mounted precision metering implement that deposits seeds and fertilizer at calibrated depths and uniform row spacings, then covers them with soil.',
    typicalPower: 'Requires 35 - 55 HP Tractor (9 to 13 rows)',
    bestSuitedFor:
      'Wheat, pulses, maize, barley, soybean, and mustard sowing.',
    keyBenefits: [
      'Saves 15-20% seed compared to manual broadcasting',
      'Uniform plant stand and emergence',
      'Simultaneous precision fertilizer placement',
    ],
    relatedTypes: ['planter', 'transplanter', 'cultivator', 'rotavator'],
  },
  {
    value: 'planter',
    label: 'Planter',
    icon: '🌿',
    category: 'Sowing & Planting',
    description:
      'Precision pneumatic or mechanical seed placer designed for large-seeded or row crops (cotton, corn, groundnut) with accurate seed-to-seed spacing.',
    typicalPower: 'Requires 40 - 65 HP Tractor (2 to 6 rows)',
    bestSuitedFor:
      'Maize, cotton, groundnut, sunflower, and vegetable row crops.',
    keyBenefits: [
      'Exact seed-to-seed distance and depth control',
      'Optimal canopy sunlight exposure',
      'Reduces subsequent thinning labor',
    ],
    relatedTypes: ['seed_drill', 'transplanter', 'weeder', 'tractor'],
  },
  {
    value: 'transplanter',
    label: 'Transplanter',
    icon: '🌾',
    category: 'Sowing & Planting',
    description:
      'Self-propelled or walk-behind specialized mechanized transplanter for planting mat-nursery paddy seedlings or vegetable nursery plugs into wet soil.',
    typicalPower: '4 - 8 HP Petrol/Diesel (4 to 8 rows)',
    bestSuitedFor:
      'Paddy wetland seedling transplanting, chili, onion, and tomato seedlings.',
    keyBenefits: [
      'Replaces 25-30 manual laborers per acre',
      'Ensures ideal root depth and row spacing',
      'Accelerates crop turnaround and tillering',
    ],
    relatedTypes: ['seed_drill', 'power_tiller', 'water_pump', 'planter'],
  },
  {
    value: 'water_pump',
    label: 'Water Pump',
    icon: '💧',
    category: 'Irrigation & Water Management',
    description:
      'Centrifugal or submersible diesel/electric pump set designed to lift and deliver high-volume irrigation water from wells, canals, or boreholes.',
    typicalPower: '5 - 15 HP Diesel / Electric (3 to 6 inch delivery)',
    bestSuitedFor:
      'Flood irrigation, canal water lifting, powering micro-irrigation systems, and field dewatering.',
    keyBenefits: [
      'Reliable high-discharge water supply',
      'Portable and easy to relocate between borewells',
      'Essential for drought mitigation',
    ],
    relatedTypes: ['sprinkler_system', 'power_sprayer', 'tractor', 'transplanter'],
  },
  {
    value: 'sprinkler_system',
    label: 'Sprinkler System',
    icon: '🚿',
    category: 'Irrigation & Water Management',
    description:
      'Pressurized pipe network with impact or micro-sprinkler nozzles that simulates natural rainfall for efficient, gentle water distribution.',
    typicalPower: '2.5 - 5.0 kg/cm² operating pressure (HDPE quick-connect pipes)',
    bestSuitedFor:
      'Groundnut, wheat, pulses, vegetables, tea, and undulating terrain farms.',
    keyBenefits: [
      'Saves 35-45% water compared to flood irrigation',
      'Prevents soil erosion and fertilizer leaching',
      'Protects crops from frost damage',
    ],
    relatedTypes: ['water_pump', 'power_sprayer', 'drone_sprayer', 'seed_drill'],
  },
  {
    value: 'combine_harvester',
    label: 'Combine Harvester',
    icon: '🌾',
    category: 'Harvesting & Threshing',
    description:
      'All-in-one heavy self-propelled machine that reaps, threshes, cleans, and collects grain crops in a continuous single field operation.',
    typicalPower: '75 - 130 HP Turbocharged (Tracked or Multi-Crop Wheeled)',
    bestSuitedFor:
      'Paddy, wheat, soybean, gram, and maize large-scale harvesting.',
    keyBenefits: [
      'Harvests 1.5 to 2.5 acres per hour',
      'Less than 1.5% grain loss with high threshing efficiency',
      'Protects mature harvest against unseasonal rain storms',
    ],
    relatedTypes: ['reaper', 'thresher', 'baler', 'grain_dryer', 'tractor'],
  },
  {
    value: 'reaper',
    label: 'Reaper',
    icon: '✂️',
    category: 'Harvesting & Threshing',
    description:
      'Front-mounted tractor attachment or walk-behind motorized unit that cuts standing cereal crops cleanly at ground level and lays them in neat windrows.',
    typicalPower: '5 - 10 HP Engine or Tractor Front-PTO mounted',
    bestSuitedFor:
      'Paddy, wheat, ragi, barley, and oat crop cutting.',
    keyBenefits: [
      'Low capital and rental cost for smallholders',
      'Leaves straw intact for valuable cattle feed',
      'Replaces 15-20 manual sickle laborers',
    ],
    relatedTypes: ['thresher', 'combine_harvester', 'power_tiller', 'baler'],
  },
  {
    value: 'thresher',
    label: 'Thresher',
    icon: '🌪️',
    category: 'Harvesting & Threshing',
    description:
      'Stationary motorized drum machine that separates grain seeds from stalks, husks, and chaff using spinning beaters and aspirator fans.',
    typicalPower: '10 - 25 HP Electric Motor or Tractor PTO',
    bestSuitedFor:
      'Wheat, paddy, millet, pulses, mustard, and soybean threshing.',
    keyBenefits: [
      'Clean grain output immediately ready for bagging',
      '99%+ grain recovery rate',
      'Produces fine bhusa (cattle fodder) simultaneously',
    ],
    relatedTypes: ['reaper', 'combine_harvester', 'grain_dryer', 'chaff_cutter'],
  },
  {
    value: 'chaff_cutter',
    label: 'Chaff Cutter',
    icon: '🌿',
    category: 'Feed & Livestock Management',
    description:
      'Rotary knife machine that shreds green and dry fodder into fine, digestible chaff for dairy cattle and livestock feed.',
    typicalPower: '2 - 5 HP Electric Motor or Engine driven',
    bestSuitedFor:
      'Maize stalks, sorghum (jowar), napier grass, sugarcane tops, and wheat straw.',
    keyBenefits: [
      'Increases cattle feed intake and milk yield',
      'Reduces fodder wastage by up to 50%',
      'High chopping throughput with adjustable cut lengths',
    ],
    relatedTypes: ['thresher', 'baler', 'trailer', 'tractor'],
  },
  {
    value: 'rice_mill',
    label: 'Rice Mill',
    icon: '🍚',
    category: 'Post-Harvest Processing',
    description:
      'Stationary or mobile processing unit with de-husking rollers and polishers that turns raw harvested paddy into edible polished rice and bran.',
    typicalPower: '10 - 30 HP Commercial 3-Phase or Diesel',
    bestSuitedFor:
      'Post-harvest paddy dehusking, polishing, bran separation, and broken-rice grading.',
    keyBenefits: [
      'Value addition right at village gate',
      'High whole-grain recovery rate',
      'Extracts valuable cattle bran for dairy feed',
    ],
    relatedTypes: ['grain_dryer', 'thresher', 'combine_harvester', 'trailer'],
  },
  {
    value: 'grain_dryer',
    label: 'Grain Dryer',
    icon: '🔥',
    category: 'Post-Harvest Processing',
    description:
      'Forced hot-air batch or continuous dryer that safely reduces moisture content of harvested grains to 12-14% for long-term spoilage-free storage.',
    typicalPower: '1 - 5 Tonnes / Batch (Biomass / Diesel Burner)',
    bestSuitedFor:
      'Wet monsoon paddy, maize cobs, wheat, oilseeds, and pulses.',
    keyBenefits: [
      'Eliminates mold, aflatoxin, and grain rotting',
      'Maintains high seed germination vigor',
      'Safe grain preservation independent of cloudy weather',
    ],
    relatedTypes: ['rice_mill', 'combine_harvester', 'thresher', 'trailer'],
  },
  {
    value: 'trailer',
    label: 'Trailer',
    icon: '🚛',
    category: 'Haulage & Transportation',
    description:
      'Heavy-duty 2-wheel or 4-wheel tipping trolley that hooks to tractors for transporting manure, harvested crops, seeds, and equipment.',
    typicalPower: '3 - 10 Tonne Payload (Hydraulic Tipping)',
    bestSuitedFor:
      'Field-to-mandi grain haulage, sugarcane transport, farmyard manure and gravel moving.',
    keyBenefits: [
      'Hydraulic fast tipping for rapid unloading',
      'Durable rugged suspension for rural dirt roads',
      'Crucial logistical asset for every harvest season',
    ],
    relatedTypes: ['tractor', 'combine_harvester', 'rice_mill', 'baler'],
  },
  {
    value: 'power_sprayer',
    label: 'Power Sprayer',
    icon: '💧',
    category: 'Crop Protection & Spraying',
    description:
      'High-pressure motorized pump unit (HTP, knapsack, or boom-mounted) for uniform foliar pesticide, fungicide, and liquid fertilizer application.',
    typicalPower: '2 - 6.5 HP Engine or Tractor PTO (20 - 50 Bar pressure)',
    bestSuitedFor:
      'Cotton, chili, orchards, mango groves, paddy, and sugarcane pest control.',
    keyBenefits: [
      'Fine droplet atomization for underside leaf penetration',
      'Long hose reach up to 40-50 feet',
      'Covers multiple acres per hour with high spray volume',
    ],
    relatedTypes: ['drone_sprayer', 'water_pump', 'sprinkler_system', 'weeder'],
  },
  {
    value: 'drone_sprayer',
    label: 'Drone Sprayer',
    icon: '🛸',
    category: 'Precision Agriculture & Spraying',
    description:
      'GPS-guided autonomous multi-rotor agricultural hexacopter equipped with radar obstacle avoidance and centrifugal nozzles for aerial spraying.',
    typicalPower: '10 - 25 Litre Tank (Dual Smart LiPo Batteries)',
    bestSuitedFor:
      'Tall crops (sugarcane, maize), waterlogged paddy fields, fruit orchards, and rapid pest outbreak control.',
    keyBenefits: [
      'Sprays 1 acre in just 7-10 minutes',
      '90% water and 25-30% pesticide chemical savings',
      'Zero farmer exposure to hazardous chemicals',
    ],
    relatedTypes: ['power_sprayer', 'sprinkler_system', 'tractor', 'water_pump'],
  },
  {
    value: 'baler',
    label: 'Baler',
    icon: '📦',
    category: 'Crop Residue Management',
    description:
      'Tractor-drawn machine that collects cut crop straw from windrows, compresses it into dense rectangular or round bales, and binds them with twine.',
    typicalPower: 'Requires 45 - 75 HP Tractor PTO (Round / Square Balers)',
    bestSuitedFor:
      'Paddy straw, wheat straw, sugarcane leaves, and hay baling.',
    keyBenefits: [
      'Stops environmentally destructive stubble burning',
      'Turns residue into sellable fodder or biofuel bales',
      'Clears fields rapidly for next sowing cycle',
    ],
    relatedTypes: ['combine_harvester', 'reaper', 'trailer', 'tractor'],
  },
  {
    value: 'weeder',
    label: 'Weeder',
    icon: '🌿',
    category: 'Crop Care & Maintenance',
    description:
      'Engine-powered rotary weeder or manual cono-weeder designed to churn between crop rows, uproot weeds, and aerate topsoil without harming roots.',
    typicalPower: '2 - 5 HP 2-Stroke / 4-Stroke Engine (2 to 4 rows)',
    bestSuitedFor:
      'SRI paddy, sugarcane, cotton, groundnut, and vegetables.',
    keyBenefits: [
      'Cuts manual weeding labor costs by 70%',
      'Aerates soil enhancing root oxygenation and nutrient uptake',
      'Incorporates weed biomass as green manure',
    ],
    relatedTypes: ['power_tiller', 'cultivator', 'planter', 'power_sprayer'],
  },
  {
    value: 'other',
    label: 'Other Equipment',
    icon: '🔧',
    category: 'Specialized Farm Machinery',
    description:
      'Specialized, hybrid, or custom agricultural tools including post-hole diggers, silage packers, ditchers, and tree pruners.',
    typicalPower: 'Variable / Implement Specific',
    bestSuitedFor:
      'Custom farming tasks, land fencing, orchard maintenance, and trenching.',
    keyBenefits: [
      'Solves unique niche farming challenges',
      'Increases farm mechanization versatility',
      'Custom operational efficiency on demand',
    ],
    relatedTypes: ['tractor', 'trailer', 'water_pump', 'power_tiller'],
  },
];

/**
 * Legacy aliases mapped to canonical equipment types
 */
const ALIAS_MAP = {
  harvester: 'combine_harvester',
  sprayer: 'power_sprayer',
  tiller: 'power_tiller',
  drone: 'drone_sprayer',
};

/**
 * Full list including legacy aliases to support displaying existing records smoothly
 */
export const ALL_EQUIPMENT_TYPES = [
  ...EQUIPMENT_TYPES,
  {
    ...EQUIPMENT_TYPES.find((e) => e.value === 'combine_harvester'),
    value: 'harvester',
    label: 'Combine Harvester',
  },
  {
    ...EQUIPMENT_TYPES.find((e) => e.value === 'power_sprayer'),
    value: 'sprayer',
    label: 'Power Sprayer',
  },
  {
    ...EQUIPMENT_TYPES.find((e) => e.value === 'power_tiller'),
    value: 'tiller',
    label: 'Power Tiller',
  },
  {
    ...EQUIPMENT_TYPES.find((e) => e.value === 'drone_sprayer'),
    value: 'drone',
    label: 'Agricultural Drone',
  },
];

/**
 * Get comprehensive metadata for an equipment type
 * @param {string} typeValue - Raw snake_case or legacy type value
 * @returns {object} Metadata object with description, icon, category, relatedTypes, etc.
 */
export const getEquipmentTypeDetails = (typeValue) => {
  if (!typeValue) return null;
  const cleanVal = String(typeValue).toLowerCase().trim();
  const canonical = ALIAS_MAP[cleanVal] || cleanVal;

  const found = EQUIPMENT_TYPES.find(
    (item) => item.value === canonical || item.value === cleanVal
  );

  if (found) return found;

  // Fallback for unknown type
  return {
    value: cleanVal,
    label: cleanVal
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
    icon: '🚜',
    category: 'Agricultural Machinery',
    description: 'Modern agricultural equipment for farming operations and field management.',
    typicalPower: 'Standard farm equipment specifications',
    bestSuitedFor: 'General agricultural field use',
    keyBenefits: ['Saves manual labor', 'Improves efficiency', 'Reliable field performance'],
    relatedTypes: ['tractor', 'power_tiller'],
  };
};

/**
 * Get clean human-readable title label for an equipment type
 * @param {string} typeValue - Raw snake_case or legacy type value
 * @returns {string} Human-readable label (e.g. "Power Tiller", "Seed Drill")
 */
export const getEquipmentTypeLabel = (typeValue) => {
  if (!typeValue) return 'Equipment';
  const details = getEquipmentTypeDetails(typeValue);
  return details ? details.label : 'Equipment';
};

/**
 * Get full objects for the related equipment types of a given type
 * @param {string} typeValue - Raw snake_case or legacy type value
 * @returns {Array<object>} Array of equipment type metadata objects
 */
export const getRelatedEquipmentTypes = (typeValue) => {
  const details = getEquipmentTypeDetails(typeValue);
  if (!details || !Array.isArray(details.relatedTypes)) {
    return [
      getEquipmentTypeDetails('tractor'),
      getEquipmentTypeDetails('power_tiller'),
    ];
  }

  return details.relatedTypes
    .map((relVal) => getEquipmentTypeDetails(relVal))
    .filter(Boolean);
};

export default EQUIPMENT_TYPES;
