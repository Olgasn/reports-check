import * as yup from 'yup';
import { InferType } from 'yup';

export const AddModalSchema = yup.object({
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
});

export type AddModalFormData = InferType<typeof AddModalSchema>;
