import {
  ModalForm,
  InputDiv,
  HeadingText,
  ErrorDiv,
  ModalBtn,
} from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { FC, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/esm/Modal';
import Form from 'react-bootstrap/esm/Form';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { AppDispatch, updateLab } from '@store';
import { useFileSelect } from '@hooks';
import { ILab } from '@@types';

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
  item: ILab;
}

export const EditLabModal: FC<Props> = ({ isShow, handleClose, courseId, item }) => {
  const dispatch = useDispatch<AppDispatch>();
  const task = useFileSelect();
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
      description: '',
    },
  });

  useEffect(() => {
    setValue('name', item.name);
    setValue('description', item.description);
  }, [item]);

  const onSubmit = (data: FormInput) => {
    const lab = { ...data, courseId, task: task.file };

    dispatch(
      updateLab({
        id: item.id,
        data: lab,
        courseId,
      })
    );

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
          <Modal.Title>Редактирование лабораторной</Modal.Title>
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
          <ModalBtn onClick={onClickSubmit}>Сохранить</ModalBtn>
        </Modal.Footer>
      </Modal>
    </>
  );
};
