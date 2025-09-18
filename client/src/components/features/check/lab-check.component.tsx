import { FC, useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  LinearProgress,
  Paper,
} from '@mui/material';

import { ICheckData, IStudentParsed } from '@@types';
import { useCheckReports, useGroups, useLab, useModels, useStudentsParseFromArchive } from '@api';
import { COLORS, PARAMS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModalControls } from '@hooks';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Action,
  FileSelect,
  LabCrumb,
  LabTask,
  MultiSelect,
  PopoverMenu,
  Select,
  TaskModal,
  TopHeader,
} from '@shared';
import { AppDispatch, cleanCheckNotifications, setCheckStatus } from '@store';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';

import { CheckNotification } from './check-notification';
import { useLabCheckData } from './lab-check.hook';
import { LabCheckFormData, LabCheckSchema } from './lab-check.validation';

export const LabCheck: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const taskControls = useModalControls();

  const [file, setFile] = useState<File | null>(null);
  const [check, setCheck] = useState<boolean>(false);
  const [students, setStudents] = useState<IStudentParsed[]>([]);

  const { control, handleSubmit, setError, setValue } = useForm({
    resolver: yupResolver(LabCheckSchema),
    defaultValues: {
      modelId: [],
      studentIds: [],
      groupId: 1,
    },
  });

  const { mutate: checkReports } = useCheckReports();

  const { id } = useParams();
  const labId = Number(id);

  const { data: lab } = useLab(labId);
  const { data: models } = useModels();
  const { data: groups } = useGroups();
  const { mutate: parseStudentsFromArchive } = useStudentsParseFromArchive();

  useEffect(() => {
    if (!file) {
      return;
    }

    parseStudentsFromArchive(
      { reportsZip: file },
      {
        onSuccess(data) {
          setValue('studentIds', []);
          setStudents(data);
        },
        onError() {
          toast.error('Не удалось извлечь студентов из архива, проверьте содержимое архива');
        },
      }
    );
  }, [file]);

  const checkOnSuccess = () => {
    dispatch(setCheckStatus({ labId, status: 'started' }));
    dispatch(cleanCheckNotifications({ labId }));

    toast.success('Отчеты отправлены на проверку');
  };

  const checkOnError = () => {
    toast.error('Не удалось выполнить проверку. Попробуйте еще раз');
  };

  const onSubmit = (data: LabCheckFormData) => {
    if (!lab) {
      return;
    }

    if (!file) {
      window.alert('Выберите архив с отчетами!');

      return;
    }

    const { modelId, groupId, studentIds } = data;

    if (!modelId.length) {
      setError('modelId', { type: 'custom', message: 'Выберите хотя бы одну модель!' });

      return;
    }

    const studentsFiltered = studentIds
      .map((studentId) => students.find((student) => student.id === studentId) ?? null)
      .filter((item) => item !== null);

    const reqData: ICheckData = {
      modelsId: modelId,
      labId: lab.id,
      reportsZip: file,
      groupId,
      studentsId: studentsFiltered,
    };

    if (check) {
      reqData.checkPrev = check;
    }

    checkReports(reqData, {
      onSuccess: checkOnSuccess,
      onError: checkOnError,
    });
  };

  const { notifications: checkNotifications, status: checkStatus } = useLabCheckData(labId);

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

  if (!lab || !models || !groups) {
    return null;
  }

  return (
    <Box>
      <LabCrumb
        labId={lab.id}
        labName={lab.name}
        courseName={lab.course.name}
        courseId={lab.course.id}
      />

      <Divider flexItem sx={{ my: 2 }} />

      <TopHeader text="Проверка отчетов" subText="Здесь вы можете проверить отчеты студентов." />

      <Divider flexItem sx={{ my: 2 }} />

      <TopHeader text={lab.name} subText={lab.description} />

      <Divider flexItem sx={{ my: 2 }} />

      <Paper sx={{ py: 1, px: 2 }}>
        <Box display="flex" justifyContent="space-between">
          <LabTask filename={lab.filename} filesize={lab.filesize} />

          <PopoverMenu actions={actions} elemId={lab.id} />

          <TaskModal
            onClose={taskControls.handleClose}
            isOpen={taskControls.open}
            task={lab.content}
            title={lab.name}
          />
        </Box>
      </Paper>

      <Divider flexItem sx={{ my: 2 }} />

      <Box display="flex" flexDirection="row">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" justifyContent="center">
            <Box display="flex" flexDirection="column">
              <TopHeader
                text="Модель"
                subText="Выберите модели, которые будут проводить проверку."
              />

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

              <Box sx={{ mt: 2, mb: 1 }}>
                <MultiSelect
                  name="studentIds"
                  control={control}
                  options={students}
                  valueKey="id"
                  labelKey="surname"
                  label="Студенты"
                  disabled={Boolean(!students.length)}
                />
              </Box>

              <FormControlLabel
                control={<Checkbox checked={check} onChange={(e) => setCheck(e.target.checked)} />}
                label="Учитывать предыдущую проверку"
                sx={{
                  fontSize: PARAMS.MEDIUM_FONT_SIZE,
                  color: COLORS.TEXT,
                }}
                disabled={Boolean(!students.length)}
              />
            </Box>

            <Divider flexItem sx={{ my: 2 }} />

            <Box display="flex" flexDirection="row" justifyContent="space-between">
              <Box display="flex" flexDirection="column" flexGrow={1}>
                <TopHeader
                  text="Группа"
                  subText="Выберите группу, к которой причислены студенты."
                />

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
                <TopHeader
                  text="Отчеты"
                  subText="Выберите архив со списком отчетов в формате zip."
                />

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

        <Divider flexItem sx={{ mx: 2 }} orientation="vertical" />

        <Box display="flex" flexDirection="column" sx={{ width: '50%' }}>
          <Box display="flex" flexDirection="column">
            <TopHeader
              text="Ход проверки"
              subText="Здесь отобразится информация о ходе проверке отчетов."
            />

            {checkStatus === 'started' && <LinearProgress color="primary" sx={{ mt: 2 }} />}

            <Divider flexItem sx={{ my: 2 }} />
          </Box>

          {checkNotifications && (
            <Box
              display="flex"
              flexDirection="column"
              sx={{ maxHeight: '55vh', overflow: 'hidden', overflowY: 'auto', pr: 2 }}
              gap={2}
            >
              {checkNotifications.map(({ model, student, status }, index) => (
                <CheckNotification model={model} student={student} status={status} key={index} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
