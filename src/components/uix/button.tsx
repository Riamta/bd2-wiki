interface ToggleButtonProps {
  isActive: boolean;
  onToggle: (newState: boolean) => void;
  activeText: string;
  inactiveText: string;
  className?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onToggle,
  activeText,
  inactiveText,
  className
}) => {
  return (
    <button
      onClick={() => onToggle(!isActive)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'text-white bg-blue-600'
          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
      } ${className || ''}`}
    >
      {isActive ? activeText : inactiveText}
    </button>
  );
};

export default ToggleButton;