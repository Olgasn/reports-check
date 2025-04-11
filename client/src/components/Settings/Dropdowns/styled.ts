import { COLORS } from '@constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled, { css } from 'styled-components';

export const DropdownContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const DropdownBtn = styled(FontAwesomeIcon)`
  color: ${COLORS.TEXT};
  width: 10px;

  &:hover {
    cursor: pointer;
  }
`;

interface DropdownContentProps {
  isRight: boolean;
}

export const DropdownContent = styled.div<DropdownContentProps>`
  ${({ isRight }) => css`
    position: absolute;
    top: 100%;
    left: ${isRight ? 'auto' : '0'};
    right: ${isRight ? '0' : 'auto'};
    margin-top: 4px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 10px 15px;
    width: max-content;
  `}
`;

export const DropdownItems = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
`;

export const DropdownItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'Roboto';
  font-size: 14px;
  color: ${COLORS.TEXT_LIGHTER};

  &:not(:first-child) {
    margin-top: 7px;
  }

  &:hover {
    cursor: pointer;
    color: ${COLORS.TEXT};
  }
`;

export const DropdownIcon = styled(FontAwesomeIcon)`
  margin-right: 5px;
  width: 15px;
`;
