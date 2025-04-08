import { Providers } from '@@types';
import {
  ModalForm,
  InputDiv,
  HeadingText,
  ErrorDiv,
  ModalBtn,
} from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppDispatch, createModel, RootState } from '@store';
import { FC, useRef, useEffect, useState, ChangeEvent } from 'react';
import Form from 'react-bootstrap/esm/Form';
import Modal from 'react-bootstrap/esm/Modal';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

interface FormInput {
  name: string;
  value: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
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
  top_p: yup.number().min(0.0).max(1.0).required('Обязательный параметр'),
  temperature: yup.number().min(0.0).max(1.0).required('Обязательный параметр'),
  max_tokens: yup.number().min(1).required('Обязательный параметр'),
  key: yup.number().required('Необходимо выбрать элемент'),
});

interface Props {
  isShow: boolean;
  handleClose: () => void;
}

export const ModelAddModal: FC<Props> = ({ isShow, handleClose }) => {
  const { keys } = useSelector((state: RootState) => state.settings);
  const [provider, setProvider] = useState<Providers>(Providers.OpenRouter);
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
      max_tokens: 100000,
      top_p: 1.0,
      temperature: 1.0,
    },
  });

  const onSubmit = (data: FormInput) => {
    dispatch(
      createModel({
        keyId: data.key,
        name: data.name,
        value: data.value,
        provider,
        top_p: data.top_p,
        temperature: data.temperature,
        max_tokens: data.max_tokens,
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
              <HeadingText>Temperature</HeadingText>
              <Form.Control {...register('temperature')} />
              {errors.temperature && <ErrorDiv>{errors.temperature.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Top p</HeadingText>
              <Form.Control {...register('top_p')} />
              {errors.top_p && <ErrorDiv>{errors.top_p.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Max Tokens</HeadingText>
              <Form.Control {...register('max_tokens')} />
              {errors.max_tokens && <ErrorDiv>{errors.max_tokens.message}</ErrorDiv>}
            </InputDiv>
            <InputDiv>
              <HeadingText>Провайдер</HeadingText>
              <Form.Select
                value={provider}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setProvider(e.target.value as Providers)
                }
              >
                <option value={Providers.OpenRouter}>{Providers.OpenRouter}</option>
                <option value={Providers.Ollama}>{Providers.Ollama}</option>
              </Form.Select>
              {errors.key && <ErrorDiv>{errors.key.message}</ErrorDiv>}
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
