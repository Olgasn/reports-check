import {
  ModalForm,
  InputDiv,
  HeadingText,
  ErrorDiv,
  ModalBtn,
} from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppDispatch, createStudent } from '@store';
import { FC, useRef } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Modal from 'react-bootstrap/esm/Modal';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';

interface FormInput {
  name: string;
  surname: string;
  middlename: string;
  num: string;
}

const schema = yup.object({
  name: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
  surname: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
  middlename: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
  num: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
});

interface Props {
  isShow: boolean;
  handleClose: () => void;
  groupId: number;
}

export const AddStudentModal: FC<Props> = ({ isShow, handleClose, groupId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  const onSubmit = (data: FormInput) => {
    dispatch(createStudent({ ...data, groupId }));

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
          <Modal.Title>Добавление студента</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ModalForm onSubmit={handleSubmit(onSubmit)} ref={formRef}>
            <InputDiv>
              <HeadingText>Имя</HeadingText>
              <Form.Control {...register('name')} />
              {errors.name && <ErrorDiv>{errors.name.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Фамилия</HeadingText>
              <Form.Control {...register('surname')} />
              {errors.surname && <ErrorDiv>{errors.surname.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Отчество</HeadingText>
              <Form.Control {...register('middlename')} />
              {errors.middlename && <ErrorDiv>{errors.middlename.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Номер</HeadingText>
              <Form.Control {...register('num')} />
              {errors.num && <ErrorDiv>{errors.num.message}</ErrorDiv>}
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
