import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircleFilled } from '@ant-design/icons';
import { Row, Typography } from 'antd';
import chunk from 'lodash/chunk';
import { toKebabCase } from 'utils';
import './style.css';

const { Text } = Typography;

const CHUNK_SIZE = 2;

const ResearchInterest = ({ interests }) => {
  const chunks = chunk(interests, CHUNK_SIZE);
  return chunks.map((chunk, index) => {
    const [interestLeft, interestRight] = chunk;
    return (
      <Row
        type={'flex'}
        justify={'space-around'}
        align={'middle'}
        key={toKebabCase(`${index}${interestLeft} ${interestRight}`)}
        className={'ri-row'}
      >
        <div className={'ri-ro-text-wrapper ri-text-wrapper'}>
          <Text>
            <CheckCircleFilled className={'ri-icon'} />
            {interestLeft}
          </Text>
        </div>
        <div className={'ri-ro-text-wrapper ri-text-wrapper'}>
          {Boolean(interestRight) && (
            <Text>
              <CheckCircleFilled className={'ri-icon'} />
              {interestRight}
            </Text>
          )}
        </div>
      </Row>
    );
  });
};

ResearchInterest.propTypes = {
  interests: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ResearchInterest;
