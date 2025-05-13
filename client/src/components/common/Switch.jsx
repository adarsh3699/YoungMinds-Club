import { useState } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Switch = ({
  enabled: controlledEnabled,
  onChange,
  label,
  description,
  name,
  srLabel,
  size = 'default', // 'small', 'default', 'large'
}) => {
  // For uncontrolled usage
  const [internalEnabled, setInternalEnabled] = useState(false);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledEnabled !== undefined;
  const enabled = isControlled ? controlledEnabled : internalEnabled;
  
  const handleChange = (newValue) => {
    if (!isControlled) {
      setInternalEnabled(newValue);
    }
    
    if (onChange) {
      // Format similar to regular form inputs for consistency
      onChange({
        target: {
          name,
          value: newValue,
          type: 'checkbox',
          checked: newValue
        }
      });
    }
  };
  
  // Size-based styling
  const sizeClasses = {
    small: {
      switch: 'h-5 w-9',
      ring: 'h-3 w-3',
      translate: 'translate-x-4'
    },
    default: {
      switch: 'h-6 w-11',
      ring: 'h-4 w-4',
      translate: 'translate-x-5'
    },
    large: {
      switch: 'h-7 w-14',
      ring: 'h-5 w-5',
      translate: 'translate-x-7'
    }
  };
  
  const currentSize = sizeClasses[size] || sizeClasses.default;
  
  return (
    <div className="flex items-center">
      <HeadlessSwitch
        checked={enabled}
        onChange={handleChange}
        className={classNames(
          enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
          `relative inline-flex ${currentSize.switch} shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
        )}
      >
        <span className="sr-only">{srLabel || label}</span>
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? currentSize.translate : 'translate-x-0',
            `pointer-events-none inline-block ${currentSize.ring} transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`
          )}
        />
      </HeadlessSwitch>
      {(label || description) && (
        <div className="ml-3">
          {label && <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>}
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      )}
    </div>
  );
};

export default Switch; 