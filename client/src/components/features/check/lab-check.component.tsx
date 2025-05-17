import { FC, useMemo, useState } from 'react';

import { Box, Button, Checkbox, Divider, FormControlLabel } from '@mui/material';

import { useCheckReports, useGroups, useGroupStudents, useLab, useModels } from '@api';
import { COLORS, PARAMS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModalControls } from '@hooks';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Action,
  FileSelect,
  LabTask,
  MultiSelect,
  PopoverMenu,
  Select,
  TaskModal,
  TopHeader,
} from '@shared';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';

import { LabTaskBox } from './lab-check.styled';
import { LabCheckFormData, LabCheckSchema } from './lab-check.validation';

export const LabCheck: FC = () => {
  const checkOnSuccess = () => toast.success('Отчеты отправлены на проверку');
  const checkOnError = () => toast.error('Не удалос выполнить проверку. Попробуйте еще раз');

  const taskControls = useModalControls();

  const [file, setFile] = useState<File | null>(null);
  const [check, setCheck] = useState(false);

  const { control, handleSubmit, setError } = useForm({
    resolver: yupResolver(LabCheckSchema),
    defaultValues: {
      modelId: [],
      studentsId: [],
      groupId: 1,
    },
  });

  const { mutate: checkReports } = useCheckReports();

  const onSubmit = (data: LabCheckFormData) => {
    if (!lab) {
      return;
    }

    if (!file) {
      window.alert('Выберите архив с отчетами!');

      return;
    }

    const { modelId, groupId, studentsId } = data;

    if (!modelId.length) {
      setError('modelId', { type: 'custom', message: 'Выберите хотя бы одну модель!' });

      return;
    }

    const reqData = {
      modelsId: modelId,
      labId: lab.id,
      reportsZip: file,
      groupId,
      studentsId,
      checkPrev: check,
    };

    checkReports(reqData, {
      onSuccess: checkOnSuccess,
      onError: checkOnError,
    });
  };

  const watchedGroupId = useWatch({
    control,
    name: 'groupId',
  });

  const { id } = useParams();
  const labId = Number(id);

  const { data: lab } = useLab(labId);
  const { data: models } = useModels();
  const { data: groups } = useGroups();
  const { data: groupStudents } = useGroupStudents(watchedGroupId);

  const actions = useMemo(
    (): Action[] => [
      {
        text: 'Просмотр',
        icon: <VisibilityOutlinedIcon />,
        cb: () => taskControls.handleOpen(),
      },
    ],
    []
  );

  if (!lab || !models || !groups || !groupStudents) {
    return null;
  }

  return (
    <Box>
      <TopHeader text="Проверка отчетов" subText="Здесь вы можете проверить отчеты студентов." />

      <Divider flexItem sx={{ my: 2 }} />

      <TopHeader text={lab.name} subText={lab.description} />

      <Divider flexItem sx={{ my: 2 }} />

      <LabTaskBox display="flex" flexDirection="row" justifyContent="space-between">
        <LabTask filename={lab.filename} filesize={lab.filesize} />

        <PopoverMenu actions={actions} elemId={lab.id} />

        <TaskModal
          onClose={taskControls.handleClose}
          isOpen={taskControls.open}
          task={lab.content}
          title={lab.name}
        />
      </LabTaskBox>

      <Divider flexItem sx={{ my: 2 }} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Box display="flex" flexDirection="column">
            <TopHeader text="Модель" subText="Выберите модели, которые будут проводить проверку." />

            <Box sx={{ mt: 2 }}>
              <MultiSelect
                name="modelId"
                control={control}
                options={models}
                valueKey="id"
                labelKey="name"
                label="Модели"
              />
            </Box>
          </Box>

          <Divider flexItem sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column">
            <TopHeader
              text="Студенты"
              subText="Выберите студентов, отчеты которых будут проверены."
            />

            <Box sx={{ mt: 2 }}>
              <MultiSelect
                name="studentsId"
                control={control}
                options={groupStudents ?? []}
                valueKey="id"
                labelKey="name"
                label="Студенты"
              />
            </Box>

            <FormControlLabel
              control={<Checkbox checked={check} onChange={(e) => setCheck(e.target.checked)} />}
              label="Учитывать предыдущую проверку"
              sx={{
                fontSize: PARAMS.MEDIUM_FONT_SIZE,
                color: COLORS.TEXT,
              }}
            />
          </Box>

          <Divider flexItem sx={{ my: 2 }} />

          <Box display="flex" flexDirection="row" justifyContent="space-between">
            <Box display="flex" flexDirection="column" flexGrow={1}>
              <TopHeader text="Группа" subText="Выберите группу, к которой причислены студенты." />

              <Box sx={{ mt: 2 }}>
                <Select
                  name="groupId"
                  control={control}
                  data={groups}
                  valueKey="id"
                  labelKey="name"
                  label="Выберите группу"
                />
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" flexGrow={1} sx={{ ml: 2 }}>
              <TopHeader text="Отчеты" subText="Выберите архив со списком отчетов в формате zip." />

              <Box sx={{ mt: 2 }}>
                <FileSelect
                  onChange={setFile}
                  textFieldSx={{ background: 'white' }}
                  accept=".zip"
                />
              </Box>
            </Box>
          </Box>

          <Divider flexItem sx={{ my: 2 }} />
        </Box>

        <Button variant="contained" sx={{ background: COLORS.SECONDARY }} type="submit">
          Отправить
        </Button>
      </form>
    </Box>
  );
};
