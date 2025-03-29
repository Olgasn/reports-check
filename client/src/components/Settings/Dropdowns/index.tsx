import { FC, useState, useRef, useEffect } from 'react';
import {
  DropdownBtn,
  DropdownContainer,
  DropdownContent,
  DropdownIcon,
  DropdownItem,
  DropdownItems,
} from './styled';
import { faEllipsisVertical, IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface Action {
  text: string;
  icon: IconDefinition;
  cb: (id: number) => void;
}

interface DropdownProps {
  actions: Action[];
  itemId: number;
}

export const Dropdowns: FC<DropdownProps> = ({ actions, itemId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<SVGSVGElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [isRightAligned, setIsRightAligned] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const checkPosition = () => {
      if (!buttonRef.current || !itemsRef.current) {
        return;
      }

      const rect = buttonRef.current.getBoundingClientRect();

      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      const items = itemsRef.current.getBoundingClientRect();
      const dropdownWidth = items.width;

      setIsRightAligned(spaceRight < dropdownWidth && spaceLeft > spaceRight);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);

      checkPosition();

      window.addEventListener('resize', checkPosition);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', checkPosition);
    };
  }, [isOpen]);

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownBtn onClick={toggleDropdown} icon={faEllipsisVertical} ref={buttonRef} />

      {isOpen && (
        <DropdownContent isRight={isRightAligned}>
          <DropdownItems ref={itemsRef}>
            {actions.map(({ text, icon, cb }, index) => (
              <DropdownItem key={index} onClick={() => cb(itemId)}>
                <DropdownIcon icon={icon} />
                <div>{text}</div>
              </DropdownItem>
            ))}
          </DropdownItems>
        </DropdownContent>
      )}
    </DropdownContainer>
  );
};
