import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import { Action } from '@shared';

import { GetLabParams } from './lab.types';

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
