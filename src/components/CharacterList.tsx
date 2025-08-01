'use client';

import { Character, Costume, SkillLevel } from '@/types/character';
import CharacterCard from '@/components/CharacterCard';
import CostumeCard, { CostumeWithCharacter } from '@/components/CostumeCard';
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CharacterFilter from '@/components/CharacterFilter';
import BannerCard from '@/components/BannerCard';
import { Banner } from '@/data/gameData';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Extend CostumeWithCharacter to include fatedGuest property
export interface ExtendedCostumeWithCharacter extends CostumeWithCharacter {
  fatedGuest?: boolean;
}

// Function to extract all costumes from characters
export const extractCostumesFromCharacters = (characters: Character[]): ExtendedCostumeWithCharacter[] => {
  const allCostumes: ExtendedCostumeWithCharacter[] = [];

  characters.forEach(character => {
    character.costumes.forEach((costume, index) => {
      if (costume.hidden) return;

      // Check if costume has fated guest skin
      const hasFatedGuestInSpineData = costume.spine_data?.some(data => data.spineFatedGuest) || false;
      const hasFatedGuestInSkins = costume.skin?.some(s => s.spine_data && s.spine_data.some(data => data.spineFatedGuest)) || false;

      allCostumes.push({
        ...costume,
        characterName: character.name,
        characterAttribute: character.attribute,
        characterAtkType: character.atkType,
        characterGender: character.gender,
        characterStar: character.star,
        characterCollab: character.collab,
        costumeIndex: index,
        fatedGuest: hasFatedGuestInSpineData || hasFatedGuestInSkins
      });
    });
  });

  return allCostumes;
};

interface CharacterListProps {
  characters: Character[];
  costumes: ExtendedCostumeWithCharacter[];
  defaultDisplayMode?: 'characters' | 'costumes';
  showDisplayModeToggle?: boolean;
}

export default function CharacterList({ 
  characters, 
  costumes, 
  defaultDisplayMode = 'characters',
  showDisplayModeToggle = true,
}: CharacterListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>(characters);
  const [filteredCostumes, setFilteredCostumes] = useState<ExtendedCostumeWithCharacter[]>(costumes);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedStar, setSelectedStar] = useState('All');
  const [selectedCollabs, setSelectedCollabs] = useState<string[]>([]);
  const [showFatedGuest, setShowFatedGuest] = useState(false);
  const [showOnlyCollab, setShowOnlyCollab] = useState(false);

  // Sort states
  const [sortBy, setSortBy] = useState('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Display mode state
  const [displayMode, setDisplayMode] = useState<'characters' | 'costumes'>(defaultDisplayMode);

  // Function to update URL with current state that properly handles parameter removal
  const updateURLAndRemove = (paramToAdd: Record<string, string> | null, paramsToRemove: string[] = []) => {
    // Always start with fresh URL parameters
    const params = new URLSearchParams(window.location.search);

    // Add parameters if needed
    if (paramToAdd) {
      Object.entries(paramToAdd).forEach(([key, value]) => {
        if (value && value !== 'All' && value !== 'default') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
    }

    // Remove specified parameters
    paramsToRemove.forEach(param => {
      params.delete(param);
    });

    // Create the new URL
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;

    // Update the URL
    router.replace(newURL, { scroll: false });

    // Update session storage
    if (params.toString()) {
      sessionStorage.setItem('homePageParams', params.toString());
    } else {
      sessionStorage.removeItem('homePageParams');
    }
  };

  // Function to initialize state from URL parameters
  const initializeFromURL = () => {
    const search = searchParams.get('search') || '';
    const attribute = searchParams.get('attribute') || 'All';
    const type = searchParams.get('type') || 'All';
    const gender = searchParams.get('gender') || 'All';
    const star = searchParams.get('star') || 'All';
    const collabsParam = searchParams.get('collabs');
    const sortBy = searchParams.get('sortBy') || 'default';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const mode = searchParams.get('mode') as 'characters' | 'costumes' | null;
    const fated = searchParams.get('fated') === 'true';
    const showCollab = searchParams.get('showCollab') === 'true';

    setSearchTerm(search);
    setSelectedAttribute(attribute);
    setSelectedType(type);
    setSelectedGender(gender);
    setSelectedStar(star);
    setSelectedCollabs(collabsParam ? collabsParam.split(',') : []);
    setSortBy(sortBy);
    setSortOrder(sortOrder);
    if (mode) setDisplayMode(mode);
    setShowFatedGuest(fated);
    setShowOnlyCollab(showCollab);

    // Store the current URL parameters in sessionStorage for back navigation
    const currentParams = searchParams.toString();
    if (currentParams) {
      sessionStorage.setItem('homePageParams', currentParams);
    } else {
      sessionStorage.removeItem('homePageParams');
    }
  };

  // Initialize state from URL on component mount
  useEffect(() => {
    initializeFromURL();
  }, []); // Empty dependency array ensures this only runs once on mount

  // Logic to restore parameters from session storage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history.state && window.history.state.idx === 0) {
      const params = sessionStorage.getItem('homePageParams');
      if (params) {
        const searchParams = new URLSearchParams(params);
        const search = searchParams.get('search') || '';
        const attribute = searchParams.get('attribute') || 'All';
        const type = searchParams.get('type') || 'All';
        const gender = searchParams.get('gender') || 'All';
        const star = searchParams.get('star') || 'All';
        const collabsParam = searchParams.get('collabs');
        const sortBy = searchParams.get('sortBy') || 'default';
        const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
        const mode = searchParams.get('mode') as 'characters' | 'costumes' | null;
        const fated = searchParams.get('fated') === 'true';
        const showCollab = searchParams.get('showCollab') === 'true';

        setSearchTerm(search);
        setSelectedAttribute(attribute);
        setSelectedType(type);
        setSelectedGender(gender);
        setSelectedStar(star);
        setSelectedCollabs(collabsParam ? collabsParam.split(',') : []);
        setSortBy(sortBy);
        setSortOrder(sortOrder);
        if (mode) setDisplayMode(mode);
        setShowFatedGuest(fated);
        setShowOnlyCollab(showCollab);
      }
    }
  }, []);

  // Clear all filters function
  const clearAllFiltersAndUpdateURL = () => {
    // Clear all filters from state
    setSearchTerm('');
    setSelectedAttribute('All');
    setSelectedType('All');
    setSelectedGender('All');
    setSelectedStar('All');
    setSelectedCollabs([]);
    setShowOnlyCollab(false);
    setFilteredCharacters(characters);
    setSortBy('default');  // Reset sortBy to default
    setSortOrder('desc');  // Reset sortOrder to desc

    // Clear all URL parameters by replacing with root URL
    router.replace(window.location.pathname, { scroll: false });

    // Also clear from sessionStorage
    sessionStorage.removeItem('homePageParams');
  };

  // Wrapper functions to update state and URL
  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    if (!value) {
      updateURLAndRemove(null, ['search']);
    } else {
      updateURLAndRemove({ search: value });
    }
  };

  // Helper function to remove parameters from URL
  const removeParamFromURL = (paramName: string) => {
    const params = new URLSearchParams(window.location.search);
    params.delete(paramName);
    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newURL, { scroll: false });

    // Update session storage
    if (params.toString()) {
      sessionStorage.setItem('homePageParams', params.toString());
    } else {
      sessionStorage.removeItem('homePageParams');
    }
  };

  const updateSelectedAttribute = (value: string) => {
    setSelectedAttribute(value);
    if (value === 'All') {
      updateURLAndRemove(null, ['attribute']);
    } else {
      updateURLAndRemove({ attribute: value });
    }
  };

  const updateSelectedType = (value: string) => {
    setSelectedType(value);
    if (value === 'All') {
      removeParamFromURL('type');
    } else {
      updateURLAndRemove({ type: value });
    }
  };

  const updateSelectedGender = (value: string) => {
    setSelectedGender(value);
    if (value === 'All') {
      removeParamFromURL('gender');
    } else {
      updateURLAndRemove({ gender: value });
    }
  };

  const updateSelectedStar = (value: string) => {
    setSelectedStar(value);
    if (value === 'All') {
      removeParamFromURL('star');
    } else {
      updateURLAndRemove({ star: value });
    }
  };

  const updateSelectedCollabs = (collabs: string[]) => {
    setSelectedCollabs(collabs);
    if (collabs.length === 0) {
      removeParamFromURL('collabs');
    } else {
      updateURLAndRemove({ collabs: collabs.length > 0 ? collabs.join(',') : '' });
    }
  };

  const updateSortBy = (value: string) => {
    setSortBy(value);

    // Automatically switch to costumes tab if selecting a costume-specific sort option
    const costumeSpecificSorts = ['chain', 'sp', 'cd'];
    if (costumeSpecificSorts.includes(value) && displayMode === 'characters') {
      setDisplayMode('costumes');
      updateURLAndRemove({ sortBy: value, mode: 'costumes' });
    } else {
      updateURLAndRemove({ sortBy: value });
    }
  };

  const updateSortOrder = (value: 'asc' | 'desc') => {
    setSortOrder(value);
    updateURLAndRemove({ sortOrder: value });
  };

  const updateDisplayMode = (value: 'characters' | 'costumes') => {
    setDisplayMode(value);
    updateURLAndRemove({ mode: value });
  };

  const updateShowFatedGuest = (value: boolean) => {
    setShowFatedGuest(value);
    if (!value) {
      removeParamFromURL('fated');
    } else {
      updateURLAndRemove({ fated: value ? 'true' : '' });
    }
  };

  const updateShowOnlyCollab = (value: boolean) => {
    setShowOnlyCollab(value);
    
    // Always use fresh URL parameters
    const params = new URLSearchParams(window.location.search);
    
    if (!value) {
      // If turning off collab filter, explicitly remove showCollab parameter
      params.delete('showCollab');
      params.delete('collabs');
      
      // Update URL directly for more reliability
      const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newURL, { scroll: false });
      
      // Also clear selected collabs state
      setSelectedCollabs([]);
    } else {
      // Set showCollab parameter to true
      params.set('showCollab', 'true');
      
      // Update URL directly
      const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newURL, { scroll: false });
    }
    
    // Update session storage
    if (params.toString()) {
      sessionStorage.setItem('homePageParams', params.toString());
    } else {
      sessionStorage.removeItem('homePageParams');
    }
  };

  // Sort function
  const sortData = (data: any[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    // If sortBy is 'default', return data in original order
    if (sortBy === 'default') {
      return data;
    }

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (displayMode === 'characters') {
        // Sort characters
        switch (sortBy) {
          case 'name':
            aValue = a.name?.toLowerCase() || '';
            bValue = b.name?.toLowerCase() || '';
            break;
          case 'hp':
            aValue = a.max_level_stats?.HP || 0;
            bValue = b.max_level_stats?.HP || 0;
            break;
          case 'atk':
            aValue = a.max_level_stats?.ATK || 0;
            bValue = b.max_level_stats?.ATK || 0;
            break;
          case 'def':
            aValue = a.max_level_stats?.DEF || 0;
            bValue = b.max_level_stats?.DEF || 0;
            break;
          case 'cdmg':
            aValue = a.max_level_stats?.CRDM || 0;
            bValue = b.max_level_stats?.CRDM || 0;
            break;
          case 'cr':
            aValue = a.max_level_stats?.CR || 0;
            bValue = b.max_level_stats?.CR || 0;
            break;
          case 'mres':
            aValue = a.max_level_stats?.MRES || 0;
            bValue = b.max_level_stats?.MRES || 0;
            break;
          default:
            aValue = a.name?.toLowerCase() || '';
            bValue = b.name?.toLowerCase() || '';
        }
      } else {
        // Sort costumes
        switch (sortBy) {
          case 'name':
            aValue = a.characterName?.toLowerCase() || '';
            bValue = b.characterName?.toLowerCase() || '';
            break;
          case 'costume':
            aValue = a.name?.toLowerCase() || '';
            bValue = b.name?.toLowerCase() || '';
            break;
          case 'chain':
            aValue = a.skill?.chain || 0;
            bValue = b.skill?.chain || 0;
            break;
          case 'sp':
            // Get SP from the highest level of skill
            aValue = a.skill?.levels ? Math.max(...a.skill.levels.map((level: SkillLevel) => level.sp || 0)) : 0;
            bValue = b.skill?.levels ? Math.max(...b.skill.levels.map((level: SkillLevel) => level.sp || 0)) : 0;
            break;
          case 'cd':
            // Get CD from the highest level of skill
            aValue = a.skill?.levels ? Math.max(...a.skill.levels.map((level: SkillLevel) => level.cd || 0)) : 0;
            bValue = b.skill?.levels ? Math.max(...b.skill.levels.map((level: SkillLevel) => level.cd || 0)) : 0;
            break;
          default:
            aValue = a.characterName?.toLowerCase() || '';
            bValue = b.characterName?.toLowerCase() || '';
        }
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  };

  // Filter characters useEffect
  useEffect(() => {
    if (!characters) return;
    
    // First, apply search and filters
    const filtered = characters.filter(character => {
      // Name search
      const nameMatch = searchTerm ? character.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;

      // Attribute filter
      const attributeMatch = selectedAttribute === 'All' || character.attribute === selectedAttribute;

      // Attack type filter
      const typeMatch = selectedType === 'All' || character.atkType === selectedType;

      // Gender filter
      const genderMatch = selectedGender === 'All' || character.gender === selectedGender;

      // Star filter
      const starMatch = selectedStar === 'All' || character.star === parseInt(selectedStar);

      // Collab filter with multiple selection
      let collabMatch = true;
      if (selectedCollabs.length > 0) {
        // Check if character has a collab and if it's in the selected collabs list
        collabMatch = Boolean(character.collab) && selectedCollabs.includes(character.collab || '');
      } else if (showOnlyCollab) {
        // Check if character has a collab
        collabMatch = Boolean(character.collab) && character.collab?.trim() !== '';
      }

      return nameMatch && attributeMatch && typeMatch && genderMatch && starMatch && collabMatch;
    });

    // Sort filtered characters
    const sortedCharacters = sortData(filtered, sortBy, sortOrder);
    setFilteredCharacters(sortedCharacters);
  }, [characters, searchTerm, selectedAttribute, selectedType, selectedGender, selectedStar, selectedCollabs, showOnlyCollab, sortBy, sortOrder]);

  // Filter costumes useEffect
  useEffect(() => {
    if (!costumes) return;
    
    // First, apply search and filters
    const filtered = costumes.filter(costume => {
      // Name search
      const nameMatch = searchTerm ?
        (costume.characterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          costume.name.toLowerCase().includes(searchTerm.toLowerCase())) : true;

      // Attribute filter
      const attributeMatch = selectedAttribute === 'All' || costume.characterAttribute === selectedAttribute;

      // Attack type filter
      const typeMatch = selectedType === 'All' || costume.characterAtkType === selectedType;

      // Gender filter
      const genderMatch = selectedGender === 'All' || costume.characterGender === selectedGender;

      // Star filter
      const starMatch = selectedStar === 'All' || costume.characterStar === parseInt(selectedStar);

      // Fated Guest filter
      const fatedGuestMatch = !showFatedGuest || Boolean(costume.fatedGuest);

      // Collab filter with multiple selection
      let collabMatch = true;
      if (selectedCollabs.length > 0) {
        // Check if costume has a character collab and if it's in the selected collabs list
        collabMatch = Boolean(costume.characterCollab) && selectedCollabs.includes(costume.characterCollab || '');
      } else if (showOnlyCollab) {
        // Check if costume has a character collab
        collabMatch = Boolean(costume.characterCollab) && costume.characterCollab?.trim() !== '';
      }

      return nameMatch && attributeMatch && typeMatch && genderMatch && starMatch && fatedGuestMatch && collabMatch;
    });

    // Sort filtered costumes
    const sortedCostumes = sortData(filtered, sortBy, sortOrder);
    setFilteredCostumes(sortedCostumes);
  }, [costumes, searchTerm, selectedAttribute, selectedType, selectedGender, selectedStar, selectedCollabs, showFatedGuest, showOnlyCollab, sortBy, sortOrder]);

  // Group characters by star rating
  const groupedCharacters = {
    5: filteredCharacters.filter(char => char.star === 5),
    4: filteredCharacters.filter(char => char.star === 4),
    3: filteredCharacters.filter(char => char.star === 3)
  };

  // Group costumes by star rating
  const groupedCostumes = {
    5: filteredCostumes.filter(costume => costume.characterStar === 5),
    4: filteredCostumes.filter(costume => costume.characterStar === 4),
    3: filteredCostumes.filter(costume => costume.characterStar === 3)
  };

  const StarSection = ({ starCount, characters }: { starCount: number, characters: Character[] }) => {
    if (characters.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center mr-4">
            <span className="text-yellow-400 mr-2">{starCount}★</span>
            <span className="text-gray-400 text-sm ml-2">({characters.length} characters)</span>
          </h2>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-3">
          {characters.map((character) => (
            <CharacterCard key={character.name} character={character} />
          ))}
        </div>
      </div>
    );
  };

  const CostumeSection = ({ starCount, costumes }: { starCount: number, costumes: ExtendedCostumeWithCharacter[] }) => {
    if (costumes.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center mr-4">
            <span className="text-yellow-400 mr-2">{starCount}★</span>
            <span className="text-gray-400 text-sm ml-2">({costumes.length} costumes)</span>
          </h2>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-3">
          {costumes.map((costume, index) => (
            <CostumeCard key={`${costume.characterName}-${costume.name}-${index}`} costume={costume} sortBy={sortBy} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <CharacterFilter
          characters={characters}
          filteredCharacters={filteredCharacters}
          onFilterChange={setFilteredCharacters}
          searchTerm={searchTerm}
          onSearchChange={updateSearchTerm}
          selectedAttribute={selectedAttribute}
          onAttributeChange={updateSelectedAttribute}
          selectedType={selectedType}
          onTypeChange={updateSelectedType}
          selectedGender={selectedGender}
          onGenderChange={updateSelectedGender}
          selectedStar={selectedStar}
          onStarChange={updateSelectedStar}
          selectedCollabs={selectedCollabs}
          onCollabsChange={updateSelectedCollabs}
          displayMode={displayMode}
          showFatedGuest={showFatedGuest}
          onFatedGuestChange={updateShowFatedGuest}
          showOnlyCollab={showOnlyCollab}
          onShowOnlyCollabChange={updateShowOnlyCollab}
          onClearAllFilters={clearAllFiltersAndUpdateURL}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onDisplayModeChange={updateDisplayMode}
        />

        {/* Display Mode and Sort Controls */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-600/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                {displayMode === 'characters' ? 'Characters' : 'Costumes'}:
              </span>
              <span className="text-green-400 font-bold">
                {displayMode === 'characters' ? filteredCharacters.length : filteredCostumes.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Sort Controls - Using ShadCN components */}
              <div className="flex items-center gap-3">
                <span className="text-gray-300 text-sm font-medium">Sort by:</span>
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={updateSortBy}>
                    <SelectTrigger className="w-[140px] bg-gray-700 text-white border-gray-600 focus:border-green-400 focus:ring-green-400 focus:ring-opacity-20">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectGroup>
                        <SelectItem value="default">Default Order</SelectItem>
                        {displayMode === 'characters' && (
                          <>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="hp">HP</SelectItem>
                            <SelectItem value="atk">ATK</SelectItem>
                            <SelectItem value="def">DEF</SelectItem>
                            <SelectItem value="cdmg">CDMG</SelectItem>
                            <SelectItem value="cr">CR</SelectItem>
                            <SelectItem value="mres">MRES</SelectItem>
                          </>
                        )}
                        {displayMode === 'costumes' && (
                          <>
                            <SelectItem value="costume">Costume Name</SelectItem>
                          </>
                        )}
                        {/* Always show costume-specific sort options */}
                        <SelectItem value="chain">Chain</SelectItem>
                        <SelectItem value="sp">SP</SelectItem>
                        <SelectItem value="cd">CD</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={sortBy === 'default' ? "ghost" : "ghost"}
                    size="icon"
                    onClick={() => updateSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    disabled={sortBy === 'default'}
                    className={`p-0 h-9 w-9 ${sortBy === 'default' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={sortBy === 'default' ? 'No sorting applied' : `Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {sortOrder === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Mode Toggle */}
              {showDisplayModeToggle && (
                <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-600/50">
                  <Button
                    onClick={() => updateDisplayMode('characters')}
                    variant={displayMode === 'characters' ? "default" : "ghost"}
                    className={`px-4 h-8 rounded-md text-sm font-medium ${displayMode === 'characters'
                      ? 'bg-green-600 text-white hover:bg-green-700 hover:text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                  >
                    Characters
                  </Button>
                  <Button
                    onClick={() => updateDisplayMode('costumes')}
                    variant={displayMode === 'costumes' ? "default" : "ghost"}
                    className={`px-4 h-8 rounded-md text-sm font-medium ${displayMode === 'costumes'
                      ? 'bg-green-600 text-white hover:bg-green-700 hover:text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                  >
                    Costumes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections by Star Rating */}
        {displayMode === 'characters' ? (
          // Character Mode
          filteredCharacters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Không tìm thấy nhân vật nào phù hợp với tiêu chí.</p>
              <p className="text-gray-500 text-sm mt-2">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <>
              <StarSection
                starCount={5}
                characters={groupedCharacters[5]}
              />
              <StarSection
                starCount={4}
                characters={groupedCharacters[4]}
              />
              <StarSection
                starCount={3}
                characters={groupedCharacters[3]}
              />
            </>
          )
        ) : (
          // Costume Mode
          filteredCostumes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Không tìm thấy trang phục nào phù hợp với tiêu chí.</p>
              <p className="text-gray-500 text-sm mt-2">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <>
              <CostumeSection
                starCount={5}
                costumes={groupedCostumes[5]}
              />
              <CostumeSection
                starCount={4}
                costumes={groupedCostumes[4]}
              />
              <CostumeSection
                starCount={3}
                costumes={groupedCostumes[3]}
              />
            </>
          )
        )}
      </main>
    </div>
  );
} 