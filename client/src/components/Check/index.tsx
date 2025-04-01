import { TopHeader } from '@components/TopHeader';
import { FC, Fragment } from 'react';
import {
  FormBtn,
  FormDesc,
  FormHeading,
  FormItem,
  FormStyled,
  LoaderDiv,
  LoaderTextDiv,
} from './styled';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, checkReports, RootState } from '@store';
import Form from 'react-bootstrap/esm/Form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useFileSelect } from '@hooks/*';
import { CircularProgress } from '@mui/material';
import { CheckInfo } from './CheckInfo';
interface FormInput {
  modelId: number;
}

const schema = yup.object({
  modelId: yup.number().required('Необходимо выбрать элемент'),
});

export const CheckForm: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { results, checkReportsThunk } = useSelector((state: RootState) => state.reports);
  const { models } = useSelector((state: RootState) => state.settings);
  const task = useFileSelect();
  const reports = useFileSelect();

  const { register, handleSubmit } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  const onSubmit = (data: FormInput) => {
    if (!task.file) {
      window.alert('Выберите файл с заданием!');

      return;
    }

    if (!reports.file) {
      window.alert('Выберите архив с отчетами!');

      return;
    }

    dispatch(
      checkReports({
        task: task.file,
        reportsZip: reports.file,
        modelId: data.modelId,
      })
    );
  };

  return (
    <div>
      <TopHeader text="Проверка отчетов" subText="Здесь вы можете проверить отчеты студентов." />

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
          <FormHeading>Задание</FormHeading>
          <FormDesc>Выберите файл с заданием в формате docx, pdf или txt.</FormDesc>
          <Form.Control
            type="file"
            accept=".pdf, .docx, .doc, .txt"
            onChange={task.handleFileChange}
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

      {checkReportsThunk.status === 'pending' && (
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

      {!!results.length && (
        <>
          <hr />

          {results.map((res, ind) => (
            <Fragment key={ind}>
              <CheckInfo data={res} />
              <hr />
            </Fragment>
          ))}
        </>
      )}
    </div>
  );
};
