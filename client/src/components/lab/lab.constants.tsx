import { Action } from '@components';
import { GetLabParams } from './lab.types';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

export const getLabActions = (params: GetLabParams): Action[] => [
  {
    text: 'Редактировать',
    icon: <CreateOutlinedIcon />,
    cb: params.editCb,
  },
  {
    text: 'Удалить',
    icon: <DeleteOutlineOutlinedIcon />,
    cb: params.deleteCb,
  },
  {
    text: 'Задание',
    icon: <AssignmentOutlinedIcon />,
    cb: params.openCb,
  },
  {
    text: 'Проверка',
    icon: <TaskOutlinedIcon />,
    cb: params.checkCb,
  },
  {
    text: 'Результаты',
    icon: <AssessmentOutlinedIcon />,
    cb: params.resultCb,
  },
];
