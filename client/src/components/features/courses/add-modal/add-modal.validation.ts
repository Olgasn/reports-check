import * as yup from 'yup';
import { InferType } from 'yup';

export const AddModalSchema = yup.object({
  name: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
  description: yup
    .string()
    .required('Обязательный параметр')
    .max(255, 'Значение должен быть не менее 255 символов'),
});

export type AddModalFormData = InferType<typeof AddModalSchema>;
