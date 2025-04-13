import { ICheckItem } from '@@types';
import { ModalBtn } from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { FC } from 'react';
import Modal from 'react-bootstrap/esm/Modal';
import { BoldSpan, DataContainerDiv, RegularSpan, TextDiv } from './styled';

interface Props {
  isShow: boolean;
  handleClose: () => void;
  data: ICheckItem;
  studentStr: string;
}

export const CheckResultModal: FC<Props> = ({ isShow, handleClose, data, studentStr }) => {
  const date = new Date(data.date);

  return (
    <Modal show={isShow} centered onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Результат студента {studentStr}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <DataContainerDiv>
          <TextDiv>
            <BoldSpan>Оценка:</BoldSpan> <RegularSpan>{data.grade}/10</RegularSpan>
          </TextDiv>
          <TextDiv>
            <BoldSpan>Модель:</BoldSpan> <RegularSpan>{data.model.name}</RegularSpan>
          </TextDiv>
          <TextDiv>
            <BoldSpan>Дата:</BoldSpan> <RegularSpan>{date.toLocaleString()}</RegularSpan>
          </TextDiv>
        </DataContainerDiv>

        <hr />

        <TextDiv>
          <p>
            <BoldSpan>Отзыв</BoldSpan>
          </p>

          <RegularSpan>{data.review}</RegularSpan>
        </TextDiv>

        <hr />

        <TextDiv>
          <p>
            <BoldSpan>Положительные моменты</BoldSpan>
          </p>

          {data.advantages.split('\n').map((adv, ind) => (
            <div key={ind}>
              <BoldSpan>{ind + 1}.</BoldSpan> <RegularSpan>{adv}</RegularSpan>
            </div>
          ))}
        </TextDiv>

        <hr />

        <TextDiv>
          <p>
            <BoldSpan>Отрицательные моменты</BoldSpan>
          </p>

          {data.disadvantages.split('\n').map((adv, ind) => (
            <div key={ind}>
              <BoldSpan>{ind + 1}.</BoldSpan> <RegularSpan>{adv}</RegularSpan>
            </div>
          ))}
        </TextDiv>
      </Modal.Body>

      <Modal.Footer>
        <ModalBtn onClick={handleClose}>Закрыть</ModalBtn>
      </Modal.Footer>
    </Modal>
  );
};
