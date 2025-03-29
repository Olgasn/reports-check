import {
  ModalForm,
  InputDiv,
  HeadingText,
  ErrorDiv,
  ModalBtn,
} from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppDispatch, createModel, RootState } from '@store';
import { FC, useRef, useEffect } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Modal from 'react-bootstrap/esm/Modal';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

interface FormInput {
  name: string;
  value: string;
  key: number;
}

const schema = yup.object({
  name: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
  value: yup
    .string()
    .required('Обязательный параметр')
    .min(6, 'Значение должен быть не менее 6 символов'),
  key: yup.number().required('Необходимо выбрать элемент'),
});

interface Props {
  isShow: boolean;
  handleClose: () => void;
}

export const ModelAddModal: FC<Props> = ({ isShow, handleClose }) => {
  const { keys } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<AppDispatch>();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      value: '',
    },
  });

  const onSubmit = (data: FormInput) => {
    const key = keys.find((k) => k.id === data.key);

    if (!key) {
      return;
    }

    const model = { key, name: data.name, value: data.value };

    dispatch(createModel(model));

    handleClose();
  };

  const onClickSubmit = () => {
    if (!formRef.current) {
      return;
    }

    formRef.current.requestSubmit();
  };

  useEffect(() => {
    setValue('name', '');
    setValue('value', '');
  }, [isShow]);

  return (
    <>
      <Modal show={isShow} centered onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Добавление модели</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ModalForm onSubmit={handleSubmit(onSubmit)} ref={formRef}>
            <InputDiv>
              <HeadingText>Название</HeadingText>
              <Form.Control {...register('name')} />
              {errors.name && <ErrorDiv>{errors.name.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Значение</HeadingText>
              <Form.Control {...register('value')} />
              {errors.value && <ErrorDiv>{errors.value.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Ключ API</HeadingText>
              <Form.Select {...register('key', { valueAsNumber: true })}>
                {keys.map(({ id, name }) => (
                  <option value={id} key={id}>
                    {name}
                  </option>
                ))}
              </Form.Select>
              {errors.key && <ErrorDiv>{errors.key.message}</ErrorDiv>}
            </InputDiv>
          </ModalForm>
        </Modal.Body>

        <Modal.Footer>
          <ModalBtn onClick={handleClose}>Отмена</ModalBtn>
          <ModalBtn onClick={onClickSubmit}>Добавить</ModalBtn>
        </Modal.Footer>
      </Modal>
    </>
  );
};
