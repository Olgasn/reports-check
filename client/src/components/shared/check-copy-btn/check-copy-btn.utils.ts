import { CheckCopyBtnProps } from './check-copy-btn.types';

export const formatList = (list: string) => {
  return list
    .split('\n')
    .map((adv) => `- ${adv}`)
    .join('\n');
};

export const formatCheckToText = (check: CheckCopyBtnProps) => {
  const date = new Date(check.date);

  const advantages = formatList(check.advantages);
  const disadvantages = formatList(check.disadvantages);

  const text = `
    **Студент: ${check.studentStr}**
    **Оценка: ${check.grade}/10**
    **Модель: ${check.model.name}**
    **Дата: ${date.toLocaleDateString()}**

    **Отзыв:**
    ${check.review}

    **Положительные моменты:**
    ${advantages}

    **Недостатки и моменты, требующие доработки**
    ${disadvantages}
    `;

  return text
    .split('\n')
    .map((line) => line.trimStart())
    .join('\n');
};
