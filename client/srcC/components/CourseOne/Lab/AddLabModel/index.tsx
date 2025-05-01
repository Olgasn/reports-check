import {
  ModalForm,
  InputDiv,
  HeadingText,
  ErrorDiv,
  ModalBtn,
} from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { FC, useRef } from 'react';
import Modal from 'react-bootstrap/esm/Modal';
import Form from 'react-bootstrap/esm/Form';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { AppDispatch, createLab } from '@store';
import { useFileSelect } from '@hooks';

interface FormInput {
  name: string;
  description: string;
}

const schema = yup.object({
  name: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
  description: yup
    .string()
    .required('Обязательный параметр')
    .max(255, 'Значение должен быть не менее 255 символов'),
});

interface Props {
  isShow: boolean;
  handleClose: () => void;
  courseId: number;
}

export const AddLabModal: FC<Props> = ({ isShow, handleClose, courseId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const task = useFileSelect();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (data: FormInput) => {
    if (!task.file) {
      window.alert('Вы не выбрали файл с заданием!');

      return;
    }

    const lab = { ...data, courseId, task: task.file };

    dispatch(createLab({ courseId, data: lab }));

    task.resetFile();

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
          <Modal.Title>Добавление лабораторной</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ModalForm onSubmit={handleSubmit(onSubmit)} ref={formRef}>
            <InputDiv>
              <HeadingText>Название</HeadingText>
              <Form.Control {...register('name')} />
              {errors.name && <ErrorDiv>{errors.name.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Описание</HeadingText>
              <Form.Control
                {...register('description')}
                as="textarea"
                rows={5}
                style={{ resize: 'none' }}
              />
              {errors.description && <ErrorDiv>{errors.description.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Задание</HeadingText>
              <Form.Control
                type="file"
                accept=".pdf, .docx, .doc, .txt"
                onChange={task.handleFileChange}
              />
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
