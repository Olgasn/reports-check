import { ICheck } from '@@types';
import { FC } from 'react';
import { CheckCellDiv, CheckInfoDiv, ReportDiv } from './styled';
import { Accordion, AccordionSummary, Typography, AccordionDetails } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

interface Props {
  data: ICheck;
}

export const CheckInfo: FC<Props> = ({ data }) => {
  const studentStr = `${data.student.name} ${data.student.surname} ${data.student.middlename}`;

  return (
    <CheckInfoDiv>
      <Accordion>
        <AccordionSummary
          aria-controls="panel1-content"
          id="panel1-header"
          expandIcon={<FontAwesomeIcon icon={faAngleDown} />}
        >
          <Typography component="span">
            <CheckCellDiv>
              {studentStr} {data.student.num} {data.grade}/10
            </CheckCellDiv>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {data.review}

          <hr />

          {data.advantages.split('\n').map((adv, ind) => (
            <div key={ind}>
              {ind + 1}. {adv}
            </div>
          ))}

          <hr />

          {data.disadvantages.split('\n').map((adv, ind) => (
            <div key={ind}>
              {ind + 1}. {adv}
            </div>
          ))}
        </AccordionDetails>
      </Accordion>
    </CheckInfoDiv>
  );
};
