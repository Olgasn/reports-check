import { ChangeEvent, FC, useEffect, useId, useMemo, useState } from 'react';

import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';

import { IGroup } from '@@types';
import { useDeleteGroup, useGroups } from '@api';
import { useDebounce, useModalControls } from '@hooks';
import { PopoverMenu, TopHeader } from '@shared';
import { toast } from 'react-toastify';

import { AddGroupModal } from './add-group-modal';
import { EditGroupModal } from './edit-group-modal';
import { getGroupsActions } from './groups.constants';
import { Students } from './students/students.component';

export const Groups: FC = () => {
  const addGroupControls = useModalControls();
  const editGroupControls = useModalControls();

  const { mutate: deleteGroup } = useDeleteGroup();

  const [groupIndex, setGroupIndex] = useState(0);
  const [search, setSearch] = useState('');

  const searchDebounced = useDebounce(search, 2000);

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

  const groupLabelId = useId();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleGroupChange = (e: SelectChangeEvent<number>) => {
    if (!groups) {
      return;
    }

    const index = Number(e.target.value);

    setGroupIndex(index);

    const group = groups[index];

    setGroup(group);
  };

  useEffect(() => {
    handleGroupChange({ target: { value: 0 } } as SelectChangeEvent<number>);
  }, [groups]);

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

      <Box display="flex" flexDirection="row" gap={2}>
        <TextField
          onChange={handleSearchChange}
          label="Фамилия студента"
          size="small"
          sx={{ bgcolor: 'white', flexGrow: 1 }}
        />

        <FormControl>
          <InputLabel id={groupLabelId}>Группа</InputLabel>
          <Select
            labelId={groupLabelId}
            value={groupIndex}
            onChange={handleGroupChange}
            size="small"
            label="Группа"
            sx={{ width: '200px', bgcolor: 'white' }}
          >
            {groups.map(({ id, name }, index) => (
              <MenuItem value={index} key={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      {group && <Students groupId={group.id} search={searchDebounced} />}

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
