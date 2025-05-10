import { useDeleteGroup, useGroups } from '@api';
import { PopoverMenu, Students, TopHeader } from '@components';
import { COLORS } from '@constants';
import { useModalControls } from '@hooks';
import { Box, Chip, Divider } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { AddGroupModal } from './add-group-modal';
import { IGroup } from '@@types';
import { getGroupsActions } from './groups.constants';
import { EditGroupModal } from './edit-group-modal';
import { toast } from 'react-toastify';

export const Groups: FC = () => {
  const addGroupControls = useModalControls();
  const editGroupControls = useModalControls();

  const { mutate: deleteGroup } = useDeleteGroup();

  const [groupIndex, setGroupIndex] = useState(-1);
  const [group, setGroup] = useState<IGroup | null>(null);

  const { data: groups } = useGroups();

  const actions = useMemo(
    () =>
      getGroupsActions({
        addCb: () => {
          addGroupControls.handleOpen();
        },
        editCb: () => {
          editGroupControls.handleOpen();
        },
        deleteCb: () => {
          if (!group) {
            return;
          }

          const confirmed = window.confirm('Вы действительно хотите удалить группу?');

          if (!confirmed) {
            return;
          }

          deleteGroup(group.id, {
            onSuccess: () => toast.success('Группа успешно удалена'),
            onError: () => toast.error('Не удалось удалить группу'),
          });
        },
      }),
    [group]
  );

  if (!groups) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <TopHeader text="Учебные группы" subText="Здесь вы можете создавать учебные группы." />

        <PopoverMenu actions={actions} elemId={-1} />
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      <Box display="flex" flexDirection="row" gap={1}>
        {groups.map((group, index) => (
          <Chip
            label={group.name}
            key={group.id}
            sx={{
              background: index === groupIndex ? COLORS.SECONDARY : undefined,
              color: index === groupIndex ? 'white' : undefined,
            }}
            onClick={() => {
              setGroupIndex(index);
              setGroup(group);
            }}
          />
        ))}
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      {group && <Students groupId={group.id} />}

      <AddGroupModal isShow={addGroupControls.open} handleClose={addGroupControls.handleClose} />

      {group && (
        <EditGroupModal
          isShow={editGroupControls.open}
          handleClose={editGroupControls.handleClose}
          item={group}
        />
      )}
    </Box>
  );
};
