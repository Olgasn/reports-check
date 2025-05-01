import { TopHeader } from '@components/TopHeader';
import { useGroups } from '@hooks';
import { FC, useState } from 'react';
import { GroupChipContainer, GroupDiv, GroupItemsDiv } from './styled';
import { GroupChip } from './GroupChip';
import { Action, Dropdowns } from '@components/Settings/Dropdowns';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { AddGroupModal } from './AddGroupModal';
import { useSelector } from 'react-redux';
import { RootState } from '@store';
import { Students } from './Students';

export const Groups: FC = () => {
  const [addModal, setAddModal] = useState(false);
  const { group } = useSelector((state: RootState) => state.groups);
  const groups = useGroups();

  const handleAddOpen = () => {
    setAddModal(true);
  };

  const handleAddClose = () => {
    setAddModal(false);
  };

  const actions: Action[] = [
    {
      icon: faPlus,
      text: 'Добавить',
      cb: () => {
        handleAddOpen();
      },
    },
  ];

  return (
    <div>
      <TopHeader text="Учебные группы" subText="Здесь вы можете создавать учебные группы." />

      <hr />

      <GroupChipContainer>
        <GroupDiv>
          {groups.map((group) => (
            <GroupChip group={group} key={group.id} />
          ))}
        </GroupDiv>
        <GroupItemsDiv>
          <Dropdowns itemId={-1} actions={actions} />
        </GroupItemsDiv>
      </GroupChipContainer>

      <hr />

      {group && <Students groupId={group.id} />}

      <AddGroupModal isShow={addModal} handleClose={handleAddClose} />
    </div>
  );
};
