import { ICheckItem, ILab } from '@@types';
import { GroupChipDiv, GroupChipText } from '@components/Groups/GroupChip/styled';
import { GroupChipContainer } from '@components/Groups/styled';
import { TopHeader } from '@components/TopHeader';
import { useLabChecks } from '@hooks';
import { Accordion, AccordionSummary, AccordionDetails, Avatar } from '@mui/material';
import { stringAvatar } from '@utils';
import { FC, useState } from 'react';
import {
  CheckGroupDiv,
  CheckItemDiv,
  CheckItemSepDiv,
  ResultsContainerDiv,
  StudentHeadingDiv,
  StudentHeadingText,
} from './styled';
import { FormBtn } from '@components/LabCheck/styled';
import { CheckResultModal } from './CheckResultModal';

interface Props {
  lab: ILab;
}

export const LabCheckResult: FC<Props> = ({ lab }) => {
  const [group, setGroup] = useState(0);
  const checks = useLabChecks(lab.id);
  const results = checks[group];
  const [resultVisible, setResultVisible] = useState(false);
  const [result, setResult] = useState<ICheckItem | null>(null);
  const [stStr, setStStr] = useState('');

  const handleClose = () => {
    setResultVisible(false);
  };

  const handleOpen = (item: ICheckItem, st: string) => () => {
    setResult(item);
    setStStr(st);
    setResultVisible(true);
  };

  return (
    <div>
      <TopHeader text={lab.name} subText={lab.description} />

      <hr />

      <GroupChipContainer>
        {checks.map((check, index) => (
          <GroupChipDiv
            key={check.group.id}
            onClick={() => setGroup(index)}
            isActive={index === group}
          >
            <GroupChipText margin={false}>{check.group.name}</GroupChipText>
          </GroupChipDiv>
        ))}
      </GroupChipContainer>

      <ResultsContainerDiv>
        {results &&
          results.results.map((result) => {
            const { name, surname, middlename } = result.student;
            const studentStr = `${name} ${surname} ${middlename}`;

            return (
              <Accordion key={result.student.id}>
                <AccordionSummary>
                  <StudentHeadingDiv>
                    <Avatar {...stringAvatar(studentStr)} />
                    <StudentHeadingText>{studentStr}</StudentHeadingText>
                    <div>{result.student.num}</div>
                  </StudentHeadingDiv>
                </AccordionSummary>

                <AccordionDetails>
                  <hr />

                  {result.checks.map((check) => {
                    const date = new Date(check.date);

                    const handleClick = handleOpen(check, studentStr);

                    return (
                      <>
                        <CheckItemDiv>
                          <CheckGroupDiv>
                            <div>{date.toLocaleString()}</div>
                            <CheckItemSepDiv>{check.model.name}</CheckItemSepDiv>
                            <div>{check.grade}/10</div>
                          </CheckGroupDiv>

                          <div>
                            <FormBtn onClick={handleClick}>Подробнее</FormBtn>
                          </div>
                        </CheckItemDiv>

                        <hr />
                      </>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            );
          })}
      </ResultsContainerDiv>

      {result && (
        <CheckResultModal
          isShow={resultVisible}
          handleClose={handleClose}
          data={result}
          studentStr={stStr}
        />
      )}
    </div>
  );
};
