/**
 * Narrative Arc Loader
 * Loads and exposes narrative arcs from JSON config for API and UI use
 */

import narrativeArcsConfig from './config/narrative-arcs.json';

export interface NarrativeArc {
  id: string;
  name: string;
  description: string;
  category?: string;
  when_to_use: string[];
  presenting_issues: string[];
  key_language: string[];
}

export interface ArcCategory {
  category: string;
  arcs: NarrativeArc[];
}

/**
 * Get all narrative arcs
 */
export function getAllNarrativeArcs(): NarrativeArc[] {
  return narrativeArcsConfig.arcs as NarrativeArc[];
}

/**
 * Get narrative arc by ID
 */
export function getNarrativeArcById(arcId: string): NarrativeArc | null {
  const arcs = narrativeArcsConfig.arcs as NarrativeArc[];
  return arcs.find(arc => arc.id === arcId) || null;
}

/**
 * Get narrative arcs grouped by category for UI display
 */
export function getNarrativeArcsByCategory(): ArcCategory[] {
  const arcs = narrativeArcsConfig.arcs as NarrativeArc[];
  
  // Group arcs by category
  const categoryMap = new Map<string, NarrativeArc[]>();
  
  arcs.forEach(arc => {
    const category = arc.category || 'other';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(arc);
  });
  
  // Convert to array with readable category names
  const categoryNames: Record<string, string> = {
    'clinical': 'Clinical Arcs',
    'dream': 'DREAM Arcs',
    'foundation': 'Foundation Arcs',
    'other': 'Other Arcs'
  };
  
  return Array.from(categoryMap.entries()).map(([category, arcs]) => ({
    category: categoryNames[category] || category,
    arcs
  }));
}

/**
 * Get clinical arcs only (excludes DREAM-specific arcs)
 */
export function getClinicalArcs(): NarrativeArc[] {
  const arcs = narrativeArcsConfig.arcs as NarrativeArc[];
  return arcs.filter(arc => arc.category !== 'dream');
}

/**
 * Get DREAM arcs only
 */
export function getDreamArcs(): NarrativeArc[] {
  const arcs = narrativeArcsConfig.arcs as NarrativeArc[];
  return arcs.filter(arc => arc.category === 'dream');
}
