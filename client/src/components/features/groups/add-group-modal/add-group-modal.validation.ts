import * as yup from 'yup';
import { InferType } from 'yup';

export const AddGroupSchema = yup.object({
  name: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
});

export type AddGroupFormData = InferType<typeof AddGroupSchema>;
