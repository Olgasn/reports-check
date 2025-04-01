import { CheckResult } from '@@types';
import { FC } from 'react';
import { CheckInfoDiv, TextBold, TextRegular } from './styled';

interface Props {
  data: CheckResult;
}

export const CheckInfo: FC<Props> = ({ data }) => {
  return (
    <CheckInfoDiv>
      <div>
        <TextBold>Студент:</TextBold> <TextRegular>{data.student}</TextRegular>
      </div>
      <div>
        <TextBold>Оценка:</TextBold> <TextRegular>{data.grade}</TextRegular>
      </div>
      <div>
        <TextBold>Отзыв:</TextBold> <TextRegular>{data.review}</TextRegular>
      </div>
      <div>
        <TextBold>Плюсы</TextBold>
        {data.advantages.map((adv, index) => (
          <div key={index}>
            <TextBold>{index + 1}.</TextBold> <TextRegular>{adv}</TextRegular>
          </div>
        ))}
      </div>
      <div>
        <TextBold>Недостатки</TextBold>
        {data.disadvantages.map((dis, index) => (
          <div key={index}>
            <TextBold>{index + 1}.</TextBold> <TextRegular>{dis}</TextRegular>
          </div>
        ))}
      </div>
    </CheckInfoDiv>
  );
};
