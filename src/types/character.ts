export interface SkillLevel {
  level: number;
  VALUE1?: number;
  VALUE2?: number;
  VALUE3?: number;
  VALUE4?: number;
  VALUE5?: number;
  sp: number;
  cd: number;
}

export interface PotentialSwitch {
  target: string;
  value: number;
}

export interface Potential {
  type: string;
  value: string;
  switches?: PotentialSwitch[];
}

export interface Skill {
  name: string;
  base_skill: string;
  chain: number;
  levels: SkillLevel[];
  potential?: any[];
  preview?: string;
  icon?: string;
  range?: string;
}

export interface SpineData {
  animation: string;
  id: string;
  spinePath: string;
  spinePathH: string;
  spineCutscene?: string;
  spineFatedGuest?: string; // Add Fated Guest spine path
  skin: string;
  offset?: {
    y: number;
    scale: number;
  };
}

export interface Stats {
  ATK?: number;
  CR?: number;
  CRDM?: number;
  HP?: number;
  DEF?: number;
  MRES?: number;
  FIRE_DAMGE?: number;
  FIRE_DAMAGE?: number;
  LIGHT_DAMAGE?: number;
  WATER_DAMAGE?: number;
  WIND_DAMAGE?: number;
  DARK_DAMAGE?: number;
  FIRE_DMG?: number;
  LIGHT_DMG?: number;
  WATER_DMG?: number;
  WIND_DMG?: number;
  DARK_DMG?: number;
}

export interface Costume {
  character: Character
  name: string;
  path: string;
  image_url: string;
  skill: Skill;
  permanent: Stats;
  bonding: Stats;
  potential?: Potential[];
  skin?: Skin[];
  spine_data?: SpineData[];
  avatar?: string;
  icon_chibi?: string;
  hidden?: boolean;
}

export interface Skin {
  name: string,
  icon_chibi?: string;
  image_url: string,
  spine_data: SpineData[]
}

export interface ExclusiveGear {
  name: string;
  icon: string;
  "Exclusive Ability": Stats;
  basic_stats_1: Stats;
  basic_stats_2: Stats;
}

export interface Character {
  id: string;
  path: string;
  name: string;
  attribute: 'Fire' | 'Water' | 'Wind' | 'Light' | 'Dark';
  atkType: 'Physical' | 'Magical';
  gender: 'Male' | 'Female';
  star: number;
  collab?: string; // Collaboration event (e.g., "ReZero", "Tensura", "Overlord", etc.)
  max_level_stats: Stats;
  engraving: Stats;
  awakening: Stats;
  costumes: Costume[];
  exclusive_gear?: ExclusiveGear;
}

export interface GameData {
  characters: Character[];
} 