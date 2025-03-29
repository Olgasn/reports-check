import Modal from 'react-bootstrap/Modal';
import { FC, useEffect, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from 'react-redux';
import { AppDispatch, createKey } from '@store';
import { ErrorDiv, HeadingText, InputDiv, ModalBtn, ModalForm } from '../KeyEditModal/styled';

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
}

export const KeyAddModal: FC<Props> = ({ isShow, handleClose }) => {
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
    dispatch(createKey(data));

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
          <Modal.Title>Добавление ключа API</Modal.Title>
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
          <ModalBtn onClick={onClickSubmit}>Добавить</ModalBtn>
        </Modal.Footer>
      </Modal>
    </>
  );
};
