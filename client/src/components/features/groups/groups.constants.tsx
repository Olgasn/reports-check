import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import { GroupActions } from './groups.types';

export const getGroupsActions = (data: GroupActions) => [
  {
    text: 'Редактировать',
    icon: <CreateOutlinedIcon />,
    cb: data.editCb,
  },
  {
    text: 'Удалить',
    icon: <DeleteOutlineOutlinedIcon />,
    cb: data.deleteCb,
  },
  {
    text: 'Добавить',
    icon: <AddCircleOutlineOutlinedIcon />,
    cb: data.addCb,
  },
];
