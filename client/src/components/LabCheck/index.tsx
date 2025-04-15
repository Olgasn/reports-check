import { IGroup, ILab, IStudent } from '@@types';
import { TopHeader } from '@components/TopHeader';
import { AppDispatch, checkReports, RootState } from '@store';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/esm/Form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useFileSelect, useGroups, useGroupStudents } from '@hooks';
import {
  CheckResultsDiv,
  FormBtn,
  FormDesc,
  FormHeading,
  FormItem,
  FormStyled,
  LabTaskWrapper,
  LoaderDiv,
  LoaderTextDiv,
} from './styled';
import { LabTask } from '@components/CourseOne/Lab/LabTask';
import { TaskModal } from '@components/CourseOne/Lab/TaskModal';
import { Action, Dropdowns } from '@components/Settings/Dropdowns';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material';
import { CheckInfo } from './CheckInfo';
import { ErrorDiv } from '@components/Settings/KeysSettings/KeyEditModal/styled';

interface Props {
  lab: ILab;
  groups: IGroup[];
}

interface FormInput {
  modelId: number[];
  studentsId: number[];
  groupId: number;
}

const schema = yup.object({
  modelId: yup.array().of(yup.number().required()).required(),
  studentsId: yup.array().of(yup.number().required()).required(),
  groupId: yup.number().required('Необходимо выбрать элемент'),
});

export const LabCheck: FC<Props> = ({ lab, groups }) => {
  const [taskVisible, setTaskVisible] = useState(false);

  const handleTaskClose = () => {
    setTaskVisible(false);
  };

  const handleTaskOpen = () => {
    setTaskVisible(true);
  };

  const dispatch = useDispatch<AppDispatch>();
  const { models } = useSelector((state: RootState) => state.settings);
  const { results, checkReportsThunk } = useSelector((state: RootState) => state.reports);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      modelId: [],
      studentsId: [],
      groupId: 1,
    },
  });

  const watchedGroupId = useWatch({
    control,
    name: 'groupId',
  });

  const students = useGroupStudents(watchedGroupId);
  const reports = useFileSelect();

  const onSubmit = (data: FormInput) => {
    if (!reports.file) {
      window.alert('Выберите архив с отчетами!');

      return;
    }

    const { modelId, groupId, studentsId } = data;

    if (!modelId.length) {
      setError('modelId', { type: 'custom', message: 'Выберите хотя бы одну модель!' });

      return;
    }

    dispatch(
      checkReports({
        modelsId: modelId,
        labId: lab.id,
        reportsZip: reports.file,
        groupId,
        studentsId,
      })
    );
  };

  const actions: Action[] = [
    {
      text: 'Просмотр',
      icon: faEye,
      cb: () => {
        handleTaskOpen();
      },
    },
  ];

  return (
    <div>
      <TopHeader text="Проверка отчетов" subText="Здесь вы можете проверить отчеты студентов." />

      <hr />

      <TopHeader text={lab.name} subText={lab.description} />

      <LabTaskWrapper>
        <LabTask filename={lab.filename} filesize={lab.filesize} />

        <Dropdowns actions={actions} itemId={1} />
      </LabTaskWrapper>

      <TaskModal
        isShow={taskVisible}
        handleClose={handleTaskClose}
        content={lab.content}
        name={lab.name}
      />

      <hr />

      <FormStyled onSubmit={handleSubmit(onSubmit)}>
        <FormItem>
          <FormHeading>Модель</FormHeading>
          <FormDesc>Выберите модели, которые будут проводить проверку.</FormDesc>

          <Controller
            name="modelId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="model-multiple-chip-label">Модели</InputLabel>
                <Select
                  {...field}
                  multiple
                  labelId="model-multiple-chip-label"
                  input={<OutlinedInput label="Модели" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => {
                        const model = models.find((m) => m.id === value);
                        return <Chip key={value} label={model?.name || value} />;
                      })}
                    </Box>
                  )}
                >
                  {models.map(({ id, name }) => (
                    <MenuItem key={id} value={id}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.modelId && <ErrorDiv>{errors.modelId.message}</ErrorDiv>}
              </FormControl>
            )}
          />
        </FormItem>

        <hr />

        <FormItem>
          <FormHeading>Группа</FormHeading>
          <FormDesc>
            Выберите группу, к которой причислены студенты (Если студентов нет в базе, они будут
            зачислены в указанную группу).
          </FormDesc>
          <Form.Select {...register('groupId', { valueAsNumber: true })}>
            {groups.map(({ id, name }) => (
              <option value={id} key={id}>
                {name}
              </option>
            ))}
          </Form.Select>
        </FormItem>

        <hr />

        <FormItem>
          <FormHeading>Студенты</FormHeading>
          <FormDesc>Выберите студенты, отчеты которых будут проверены.</FormDesc>

          <Controller
            name="studentsId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="students-multiple-chip-label">Студенты</InputLabel>
                <Select
                  {...field}
                  multiple
                  labelId="students-multiple-chip-label"
                  input={<OutlinedInput label="Студенты" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => {
                        const student = students.find((m) => m.id === value);

                        return <Chip key={value} label={student?.name || value} />;
                      })}
                    </Box>
                  )}
                >
                  {students.map(({ id, name, surname, middlename }) => (
                    <MenuItem key={id} value={id}>
                      {name} {surname} {middlename}
                    </MenuItem>
                  ))}
                </Select>
                {errors.studentsId && <ErrorDiv>{errors.studentsId.message}</ErrorDiv>}
              </FormControl>
            )}
          />
        </FormItem>

        <hr />

        <FormItem>
          <FormHeading>Отчеты</FormHeading>
          <FormDesc>Выберите архив со списком отчетов в формате zip.</FormDesc>
          <Form.Control type="file" accept=".zip" onChange={reports.handleFileChange} />
        </FormItem>

        <hr />

        <FormBtn>Проверить</FormBtn>
      </FormStyled>

      {checkReportsThunk.status === 'pending' ? (
        <>
          <hr />

          <LoaderDiv>
            <LoaderTextDiv>
              <FormHeading>Выполняется проверка</FormHeading>
              <FormDesc margin>Подождите, пожалуйста, пока выполняется проверка отчетов.</FormDesc>
            </LoaderTextDiv>
            <CircularProgress color="inherit" />
          </LoaderDiv>

          <hr />
        </>
      ) : (
        <>
          <hr />

          <CheckResultsDiv>
            {results.map((r) => (
              <CheckInfo data={r} key={r.id} />
            ))}
          </CheckResultsDiv>
        </>
      )}
    </div>
  );
};
