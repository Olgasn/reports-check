import Modal from 'react-bootstrap/Modal';
import { FC, useEffect, useRef } from 'react';
import { ApiKey } from '@@types';
import { ErrorDiv, HeadingText, InputDiv, ModalBtn, ModalForm } from './styled';
import Form from 'react-bootstrap/Form';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { AppDispatch, editKey } from '@store';

interface FormInput {
  name: string;
  value: string;
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
});

interface Props {
  isShow: boolean;
  handleClose: () => void;
  item: ApiKey;
}

export const KeyEditModal: FC<Props> = ({ isShow, item, handleClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: item.name,
      value: item.value,
    },
  });

  useEffect(() => {
    clearErrors();
    setValue('name', item.name);
    setValue('value', item.value);
  }, [item]);

  const onSubmit = (data: FormInput) => {
    dispatch(editKey({ id: item.id, ...data }));

    handleClose();
  };

  const onClickSubmit = () => {
    if (!formRef.current) {
      return;
    }

    formRef.current.requestSubmit();
  };

  return (
    <>
      <Modal show={isShow} centered onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Изменение ключа API</Modal.Title>
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
          </ModalForm>
        </Modal.Body>

        <Modal.Footer>
          <ModalBtn onClick={handleClose}>Отмена</ModalBtn>
          <ModalBtn onClick={onClickSubmit}>Сохранить</ModalBtn>
        </Modal.Footer>
      </Modal>
    </>
  );
};
