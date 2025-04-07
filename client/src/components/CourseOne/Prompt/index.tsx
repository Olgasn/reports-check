import { IPrompt } from '@@types';
import { Action, Dropdowns } from '@components/Settings/Dropdowns';
import { TopHeader } from '@components/TopHeader';
import { FC, useState } from 'react';
import { CourseHeader } from '../styled';
import { BtnOffset, BtnsDiv, PromptInputDiv } from './styled';
import Form from 'react-bootstrap/esm/Form';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FormBtn } from '@components/LabCheck/styled';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { ErrorDiv } from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { useDispatch } from 'react-redux';
import { AppDispatch, createPrompt, editPrompt } from '@store';

interface Props {
  prompt: IPrompt | null;
  courseId: number;
}

interface FormInput {
  content: string;
}

const schema = yup.object({
  content: yup.string().required('Обязательный параметр'),
});

export const Prompt: FC<Props> = ({ prompt, courseId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    register,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      content: '',
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const discardChanging = () => {
    setIsEditing(false);
  };

  const actions: Action[] = [
    {
      text: prompt ? 'Редактировать' : 'Задать',
      icon: faPenToSquare,
      cb: (id: number) => {
        toggleEditing();

        if (prompt) {
          setValue('content', prompt.content);
        }
      },
    },
  ];

  const handleSave = async () => {
    const result = await trigger('content');

    if (!result) {
      return;
    }

    if (prompt) {
      dispatch(editPrompt({ courseId, id: prompt.id, data: { content: getValues('content') } }));
    } else {
      dispatch(createPrompt({ courseId, data: { courseId, content: getValues('content') } }));
    }

    toggleEditing();
  };

  return (
    <div>
      <CourseHeader>
        <TopHeader
          text="Промпт для проверки"
          subText="Задайте здесь промпт, на основании которого производится провека отчетов студентов"
        />

        <Dropdowns actions={actions} itemId={prompt ? prompt.id : -1} />
      </CourseHeader>

      {prompt ? (
        isEditing ? (
          <div>
            <PromptInputDiv>
              <Form.Control {...register('content')} as="textarea" rows={4} readOnly={false} />
              {errors.content && <ErrorDiv>{errors.content.message}</ErrorDiv>}
            </PromptInputDiv>

            <BtnsDiv>
              <FormBtn onClick={handleSave}>Сохранить</FormBtn>

              <BtnOffset>
                <FormBtn onClick={discardChanging}>Отменить</FormBtn>
              </BtnOffset>
            </BtnsDiv>
          </div>
        ) : (
          <PromptInputDiv>
            <Form.Control value={prompt.content} as="textarea" rows={4} readOnly={true} />
          </PromptInputDiv>
        )
      ) : (
        isEditing && (
          <div>
            <PromptInputDiv>
              <Form.Control {...register('content')} as="textarea" rows={4} readOnly={false} />
              {errors.content && <ErrorDiv>{errors.content.message}</ErrorDiv>}
            </PromptInputDiv>

            <BtnsDiv>
              <FormBtn onClick={handleSave}>Сохранить</FormBtn>

              <BtnOffset>
                <FormBtn onClick={discardChanging}>Отменить</FormBtn>
              </BtnOffset>
            </BtnsDiv>
          </div>
        )
      )}
    </div>
  );
};
