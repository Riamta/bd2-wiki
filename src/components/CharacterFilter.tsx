import { Character } from '@/types/character';
import Image from 'next/image';
import { Gender, GenderIcon } from '@/components/Icons/GenderIcon';

interface CharacterFilterProps {
  characters: Character[];
  filteredCharacters: Character[];
  onFilterChange: (filtered: Character[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedAttribute: string;
  onAttributeChange: (attribute: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedGender: string;
  onGenderChange: (gender: string) => void;
  selectedStar: string;
  onStarChange: (star: string) => void;
  selectedCollabs: string[];
  onCollabsChange: (collabs: string[]) => void;
  displayMode: 'characters' | 'costumes';
  showFatedGuest: boolean;
  onFatedGuestChange: (value: boolean) => void;
  showOnlyCollab: boolean;
  onShowOnlyCollabChange: (value: boolean) => void;
  onClearAllFilters: () => void; 
  sortBy?: string;  // Thêm sortBy
  sortOrder?: 'asc' | 'desc';  // Thêm sortOrder
  onDisplayModeChange: (mode: 'characters' | 'costumes') => void; // Thêm prop mới
}

export default function CharacterFilter({
  characters,
  filteredCharacters,
  onFilterChange,
  searchTerm,
  onSearchChange,
  selectedAttribute,
  onAttributeChange,
  selectedType,
  onTypeChange,
  selectedGender,
  onGenderChange,
  selectedStar,
  onStarChange,
  selectedCollabs,
  onCollabsChange,
  displayMode,
  showFatedGuest,
  onFatedGuestChange,
  showOnlyCollab,
  onShowOnlyCollabChange,
  onClearAllFilters,
  sortBy = 'default',
  sortOrder = 'desc',
  onDisplayModeChange, // Thêm prop mới
}: CharacterFilterProps) {
  const attributes = ['Fire', 'Water', 'Wind', 'Light', 'Dark']; // No 'All'
  const types = ['Physical', 'Magical']; // No 'All'
  const genders = ['Male', 'Female']; // Only Male and Female, no All
  const stars = ['3', '4', '5']; // No 'All'

  const attributeIcons = {
    Fire: { src: '/images/elementals/fire.webp', alt: 'Fire' },
    Water: { src: '/images/elementals/water.webp', alt: 'Water' },
    Wind: { src: '/images/elementals/wind.webp', alt: 'Wind' },
    Light: { src: '/images/elementals/light.webp', alt: 'Light' },
    Dark: { src: '/images/elementals/dark.webp', alt: 'Dark' },
  };

  const attackTypeIcons = {
    Physical: { src: '/images/attack_type/icon_atk.svg', alt: 'Physical' },
    Magical: { src: '/images/attack_type/icon_matk.svg', alt: 'Magical' },
  };

  const starIcons = {
    '3': <span className="text-yellow-400 text-xl">★★★</span>,
    '4': <span className="text-yellow-400 text-xl">★★★★</span>,
    '5': <span className="text-yellow-400 text-xl">★★★★★</span>,
  };

  // Dynamically get collab options from characters
  const collabs = ['All', ...Array.from(new Set(characters
    .map(char => char.collab)
    .filter((collab): collab is string => !!collab) // Remove undefined/null values with type guard
  )).sort()];

  const handleSearch = (value: string) => {
    onSearchChange(value);
    applyFilters(value, selectedAttribute, selectedType, selectedGender, selectedStar, selectedCollabs, showOnlyCollab);
  };

  const handleAttributeFilter = (attribute: string) => {
    onAttributeChange(attribute);
    applyFilters(searchTerm, attribute, selectedType, selectedGender, selectedStar, selectedCollabs, showOnlyCollab);
  };

  const handleTypeFilter = (type: string) => {
    onTypeChange(type);
    applyFilters(searchTerm, selectedAttribute, type, selectedGender, selectedStar, selectedCollabs, showOnlyCollab);
  };

  const handleGenderFilter = (gender: string) => {
    onGenderChange(gender);
    applyFilters(searchTerm, selectedAttribute, selectedType, gender, selectedStar, selectedCollabs, showOnlyCollab);
  };

  const handleStarFilter = (star: string) => {
    onStarChange(star);
    applyFilters(searchTerm, selectedAttribute, selectedType, selectedGender, star, selectedCollabs, showOnlyCollab);
  };

  const handleCollabFilter = (collab: string) => {
    let newCollabs = [...selectedCollabs];

    if (newCollabs.includes(collab)) {
      // Remove if already selected
      newCollabs = newCollabs.filter(c => c !== collab);
    } else {
      // Add if not selected
      newCollabs.push(collab);
    }

    onCollabsChange(newCollabs);
    applyFilters(searchTerm, selectedAttribute, selectedType, selectedGender, selectedStar, newCollabs, showOnlyCollab);
  };

  // Remove the local clearAllFilters function as we'll use the prop instead

  const applyFilters = (
    search: string,
    attribute: string,
    type: string,
    gender: string,
    star: string,
    collabs: string[],
    onlyCollab: boolean = showOnlyCollab
  ) => {
    let filtered = characters;

    if (search) {
      filtered = filtered.filter(char =>
        char.name.toLowerCase().includes(search.toLowerCase()) ||
        char.costumes.some(costume =>
          costume.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    if (attribute !== 'All') {
      filtered = filtered.filter(char => char.attribute === attribute);
    }

    if (type !== 'All') {
      filtered = filtered.filter(char => char.atkType === type);
    }

    if (gender !== 'All') {
      filtered = filtered.filter(char => char.gender === gender);
    }

    if (star !== 'All') {
      filtered = filtered.filter(char => char.star === parseInt(star));
    }

    // Apply collab filtering with proper logic
    if (onlyCollab) {
      // First show only characters with any collab
      filtered = filtered.filter(char => char.collab && char.collab.trim() !== '');
      
      // Then if specific collabs are selected, filter by those
      if (collabs.length > 0) {
        filtered = filtered.filter(char => char.collab && collabs.includes(char.collab));
      }
    }

    onFilterChange(filtered);
  };

  const applyCurrentFilters = () => {
    applyFilters(searchTerm, selectedAttribute, selectedType, selectedGender, selectedStar, selectedCollabs, showOnlyCollab);
  };

  const hasActiveFilters = searchTerm || selectedAttribute !== 'All' || selectedType !== 'All' ||
    selectedGender !== 'All' || selectedStar !== 'All' || showOnlyCollab || selectedCollabs.length > 0 ||
    sortBy !== 'default';

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 mb-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        {hasActiveFilters && (
          <button
            onClick={onClearAllFilters}
            className="text-sm text-green-400 hover:text-green-300 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or costume..."
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Attribute Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attribute
            </label>
            <div className="flex gap-2">
              {attributes.map((attribute) => (
                <button
                  key={attribute}
                  onClick={() => {
                    console.log(`Clicked on attribute: ${attribute}, current selected: ${selectedAttribute}`);
                    const newValue = selectedAttribute === attribute ? 'All' : attribute;
                    console.log(`Setting attribute to: ${newValue}`);
                    handleAttributeFilter(newValue);
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 border-2
                    ${selectedAttribute === attribute
                      ? 'border-red-500'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}
                  `}
                  aria-label={attribute}
                >
                  <Image src={attributeIcons[attribute as keyof typeof attributeIcons].src} alt={attributeIcons[attribute as keyof typeof attributeIcons].alt} width={24} height={24} className="object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Special Filters Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Special
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Collab Toggle Button */}
              <button
                onClick={() => {
                  const newShowOnlyCollab = !showOnlyCollab;
                  console.log(`Toggling Show Collab from ${showOnlyCollab} to ${newShowOnlyCollab}`);
                  
                  if (!newShowOnlyCollab) {
                    // Turning off: reset collab filter first
                    console.log('Resetting collab filter and clearing selection');
                    onCollabsChange([]);
                    // Apply filters
                    applyFilters(searchTerm, selectedAttribute, selectedType, selectedGender, selectedStar, [], false);
                    // Update URL param last
                    onShowOnlyCollabChange(false);
                  } else {
                    // Turning on: apply show only collab filter
                    console.log('Applying collab filter');
                    applyFilters(searchTerm, selectedAttribute, selectedType, selectedGender, selectedStar, selectedCollabs, true);
                    // Update URL param last
                    onShowOnlyCollabChange(true);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${showOnlyCollab
                  ? 'text-white bg-blue-600'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
              >
                {showOnlyCollab ? 'Hide Collab' : 'Show Collab'}
              </button>

              {/* Fated Guest Filter - Always visible */}
                <button
                onClick={() => {
                  if (displayMode === 'characters') {
                    onDisplayModeChange('costumes');
                  }
                  onFatedGuestChange(!showFatedGuest);
                }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${showFatedGuest
                    ? 'text-white bg-pink-600'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                    }`}
                >
                  Fated Guest
                </button>
            </div>

            {/* Collab Selection */}
            {showOnlyCollab && (
              <div className="mt-3">
                <CollabFilter
                  collabs={collabs.filter(collab => collab !== 'All')}
                  selectedCollab={selectedCollabs}
                  onCollabChange={handleCollabFilter}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Attack Type & Gender Filter */}
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              {/* Attack Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attack Type
                </label>
                <div className="flex gap-2">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeFilter(selectedType === type ? 'All' : type)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 border-2
                        ${selectedType === type
                          ? 'border-blue-500'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}
                      `}
                      aria-label={type}
                    >
                      <Image src={attackTypeIcons[type as keyof typeof attackTypeIcons].src} alt={attackTypeIcons[type as keyof typeof attackTypeIcons].alt} width={24} height={24} className="object-contain" />
                    </button>
                  ))}
                </div>
              </div>
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <div className="flex gap-2">
                  {genders.map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handleGenderFilter(selectedGender === gender ? 'All' : gender)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 border-2 text-lg
                        ${selectedGender === gender
                          ? 'text-white border-teal-400'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}
                      `}
                      aria-label={gender}
                    >
                      <GenderIcon gender={gender as Gender} size={24} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Star Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Star Rating
              </label>
              <div className="flex gap-2">
                {stars.map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarFilter(selectedStar === star ? 'All' : star)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 border-2 ${selectedStar === star
                      ? 'border-blue-500 text-white'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                      }`}
                  >
                    {`${star}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs border border-green-400/30">
                Search: "{searchTerm}"
              </span>
            )}
            {selectedAttribute !== 'All' && (
              <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs border border-red-400/30">
                {selectedAttribute}
              </span>
            )}
            {selectedType !== 'All' && (
              <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-400/30">
                {selectedType}
              </span>
            )}
            {selectedGender !== 'All' && (
              <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs border border-purple-400/30">
                {selectedGender}
              </span>
            )}
            {selectedStar !== 'All' && (
              <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-400/30">
                {selectedStar}★
              </span>
            )}
            {showOnlyCollab && (
              <span className="bg-orange-600/20 text-orange-400 px-2 py-1 rounded text-xs border border-orange-400/30">
                {selectedCollabs.length > 0 ? `Collabs: ${selectedCollabs.length}` : 'Collab only'}
              </span>
            )}
            {displayMode === 'costumes' && showFatedGuest && (
              <span className="bg-pink-600/20 text-pink-400 px-2 py-1 rounded text-xs border border-pink-400/30">
                Fated Guest
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Collaboration Filter Component
const CollabFilter = ({
  collabs,
  selectedCollab,
  onCollabChange
}: {
  collabs: string[];
  selectedCollab: string[];
  onCollabChange: (collab: string) => void;
}) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/50">
      <p className="text-xs text-gray-300 mb-2">Select collaborations (multiple allowed):</p>
      <div className="flex flex-wrap gap-2">
        {collabs.map((collab) => (
          <CollabButton
            key={collab}
            collab={collab}
            isSelected={selectedCollab.includes(collab)}
            onClick={() => onCollabChange(collab)}
          />
        ))}
      </div>
    </div>
  );
};

const CollabButton = ({
  collab,
  isSelected,
  onClick
}: {
  collab: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isSelected
          ? 'text-white bg-gray-800/70 border border-blue-600 scale-105'
          : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600'
        }
      `}
    >
      {collab}
    </button>
  );
};