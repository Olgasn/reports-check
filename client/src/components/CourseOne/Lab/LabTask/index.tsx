import { FC } from 'react';
import { LabTaskDiv, LabTaskName } from './styled';
import { formatFileSize, getFileIcon } from '@utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  filename: string;
  filesize: number;
}

export const LabTask: FC<Props> = ({ filename, filesize }) => {
  const icon = getFileIcon(filename);
  const size = formatFileSize(filesize);

  return (
    <LabTaskDiv>
      <FontAwesomeIcon icon={icon} />

      <LabTaskName>{filename}</LabTaskName>

      <div>{size}</div>
    </LabTaskDiv>
  );
};
