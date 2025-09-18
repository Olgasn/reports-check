import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

export const getModelsActions = (editCb: (id: number) => void, deleteCb: (id: number) => void) => [
  {
    text: 'Редактировать',
    icon: <CreateOutlinedIcon />,
    cb: editCb,
  },
  {
    text: 'Удалить',
    icon: <DeleteOutlineOutlinedIcon />,
    cb: deleteCb,
  },
];
