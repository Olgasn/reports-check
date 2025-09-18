import * as yup from 'yup';
import { InferType } from 'yup';

export const LabCheckSchema = yup.object({
  modelId: yup.array().of(yup.number().required()).required(),
  studentIds: yup.array().of(yup.string().required()).required(),
  groupId: yup.number().required('Необходимо выбрать элемент'),
});

export type LabCheckFormData = InferType<typeof LabCheckSchema>;
