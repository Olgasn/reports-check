import * as yup from 'yup';
import { InferType } from 'yup';

export const PromptSchema = yup.object({
  content: yup.string().required('Обязательный параметр'),
});

export type PromptFormData = InferType<typeof PromptSchema>;
