import { ILab } from '@@types';
import { TopHeader } from '@components/TopHeader';
import { AppDispatch, RootState } from '@store';
import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/esm/Form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useFileSelect } from '@hooks';
import {
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
import { CircularProgress } from '@mui/material';

interface Props {
  lab: ILab;
}

interface FormInput {
  modelId: number;
}

const schema = yup.object({
  modelId: yup.number().required('Необходимо выбрать элемент'),
});

export const LabCheck: FC<Props> = ({ lab }) => {
  const [taskVisible, setTaskVisible] = useState(false);

  const handleTaskClose = () => {
    setTaskVisible(false);
  };

  const handleTaskOpen = () => {
    setTaskVisible(true);
  };

  const dispatch = useDispatch<AppDispatch>();
  const { models } = useSelector((state: RootState) => state.settings);

  const { register, handleSubmit } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  const reports = useFileSelect();

  const onSubmit = (data: FormInput) => {
    if (!reports.file) {
      window.alert('Выберите архив с отчетами!');

      return;
    }
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
          <FormDesc>Выберите модель, которая будет проводить проверку.</FormDesc>
          <Form.Select {...register('modelId', { valueAsNumber: true })}>
            {models.map(({ id, name }) => (
              <option value={id} key={id}>
                {name}
              </option>
            ))}
          </Form.Select>
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

      {false && (
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
      )}
    </div>
  );
};
