import React from 'react';
import PropTypes from 'prop-types';

import LoadingSpinner from 'uikit/LoadingSpinner';

const ErrorText = () => <div>Error no data</div>;

const ChartLoadGate = ({
  fetchedState: { isLoading, data, error },
  Chart,
  Loader = LoadingSpinner,
  Error = ErrorText,
  onLoad = x => x,
}) => {
  if (isLoading) {
    return <Loader />;
  } else {
    onLoad(data);
    return data ? <Chart data={data} /> : <Error />;
  }
};

ChartLoadGate.propTypes = {
  fetchedState: PropTypes.object,
  Chart: PropTypes.func.isRequired,
  Loader: PropTypes.element,
  ErrorMessage: PropTypes.element,
};

export default ChartLoadGate;
