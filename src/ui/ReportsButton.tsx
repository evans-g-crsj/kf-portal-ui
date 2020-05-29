/* eslint-disable react/prop-types */
import React, { FunctionComponent, useEffect } from 'react';
import { Button, Dropdown, Menu, message as antdMessage, notification } from 'antd';
import { Sqon } from '../store/sqon';
import { RootState } from '../store/rootState';
import { connect, ConnectedProps } from 'react-redux';
import { ClickParam } from 'antd/lib/menu';
import { DownloadOutlined } from '@ant-design/icons';
import { DispatchReport, ReportConfig } from '../store/reportTypes';
import { reInitializeState, fetchReportIfNeeded } from '../store/actionCreators/report';
import { MessageType as AntdMessageType } from 'antd/lib/message';
import {
  selectIsReportLoading,
  selectReportError,
  selectReportMessage,
} from '../store/selectors/report';

function identity<T>(arg: T): T {
  return arg;
}

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  sqon: Sqon;
  generatorMenuItems: Function;
  className?: string;
};

const DownloadButton: FunctionComponent<Props> = (props) => {
  const {
    isLoading,
    sqon,
    fetchReportIfNeeded,
    error,
    message,
    reInitializeState,
    generatorMenuItems,
    className = '',
  } = props;

  const handleClick = async (e: ClickParam) => {
    const reportName = e.key;
    await fetchReportIfNeeded({ sqon, name: reportName });
  };

  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Error',
        description: 'An error occurred. The table can not be exported. Please try again.',
        duration: null,
        onClose: () => reInitializeState(),
      });
    }
  }, [error, reInitializeState]);

  useEffect(() => {
    let hideWhenDurationUnknown: AntdMessageType | null;
    if (message) {
      if (message.duration > 0) {
        antdMessage[message.type](message.content, message.duration);
      } else {
        hideWhenDurationUnknown = antdMessage[message.type](message.content, message.duration);
      }
    }
    return () => {
      hideWhenDurationUnknown && hideWhenDurationUnknown();
    };
  }, [message]);

  const menuItems = generatorMenuItems();

  return (
    <Dropdown
      overlay={<Menu onClick={handleClick}>{menuItems.map(identity)}</Menu>}
      disabled={error !== null}
    >
      <Button
        type={'primary'}
        loading={isLoading}
        icon={<DownloadOutlined />}
        className={className}
      >
        Download
      </Button>
    </Dropdown>
  );
};

const mapState = (state: RootState) => ({
  isLoading: selectIsReportLoading(state),
  message: selectReportMessage(state),
  error: selectReportError(state),
});

const mapDispatch = (dispatch: DispatchReport) => ({
  fetchReportIfNeeded: (params: ReportConfig) => dispatch(fetchReportIfNeeded(params)),
  reInitializeState: () => dispatch(reInitializeState()),
});

const connector = connect(mapState, mapDispatch);

const Connected = connector(DownloadButton);

export default Connected;
