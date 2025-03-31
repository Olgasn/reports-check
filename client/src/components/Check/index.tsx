import { TopHeader } from '@components/TopHeader';
import { FC } from 'react';
import { FormBtn, FormDesc, FormHeading, FormItem, FormStyled } from './styled';
import { useSelector } from 'react-redux';
import { RootState } from '@store';
import Form from 'react-bootstrap/esm/Form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useFileSelect } from '@hooks/*';
interface FormInput {
  modelId: number;
}

const schema = yup.object({
  modelId: yup.number().required('Необходимо выбрать элемент'),
});

export const CheckForm: FC = () => {
  const { models } = useSelector((state: RootState) => state.settings);
  const task = useFileSelect();
  const reports = useFileSelect();

  const { register, handleSubmit } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  const onSubmit = (data: FormInput) => {
    const model = models.find((m) => m.id === data.modelId);

    if (!model) {
      return;
    }

    if (!task.file) {
      window.alert('Выберите файл с заданием!');

      return;
    }

    if (!reports.file) {
      window.alert('Выберите архив с отчетами!');

      return;
    }
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
    </div>
  );
};
