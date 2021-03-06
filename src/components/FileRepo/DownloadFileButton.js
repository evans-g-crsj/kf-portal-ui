import React from 'react';
import { compose } from 'recompose';
import { injectState } from 'freactal';

import theme from 'theme/defaultTheme';
import IconWithLoading from 'icons/IconWithLoading';
import DownloadIcon from 'icons/DownloadIcon';
import LoadingOnClick from 'components/LoadingOnClick';
import { GEN3 } from 'common/constants';
import { downloadFileFromFence } from 'services/fence';
import { getFilesById } from 'services/arranger';
import { withApi } from 'services/api';
import { getAppElement } from 'services/globalDomNodes';

const getGen3UUIDs = async kfId => {
  const fileData = await getFilesById({ ids: [kfId], fields: ['latest_did'] });
  return fileData.map(file => file.node.latest_did);
};

//TODO: Needs to be made aware of multiple data repositories, only downloads from Gen3 right now.
const downloadFile = async ({ kfId, api }) => {
  let files = await getGen3UUIDs(kfId);
  let fileUuid = files && files.length > 0 ? files[0] : null;
  if (!fileUuid) throw new Error('Error retrieving File ID for the selected Row.');
  return await downloadFileFromFence({ fileUuid, api, fence: GEN3 });
};

const DownloadFileButton = compose(
  injectState,
  withApi,
)(({ kfId, fence, effects: { setToast }, api, render, onSuccess, onError }) => (
  <LoadingOnClick
    onClick={() =>
      downloadFile({ kfId, fence, api })
        .then(url => {
          const a = document.createElement('a');
          a.href = url;
          if (onSuccess) {
            onSuccess(url);
          }

          a.download = url.split('/').slice(-1);
          a.style.display = 'none';

          // firefox would not trigger download unless the element is present in the dom
          const appRoot = getAppElement();
          appRoot.appendChild(a);
          a.click();
          appRoot.removeChild(a);
        })
        .catch(err => {
          if (onError) {
            onError(err);
          }
          setToast({
            id: `${Date.now()}`,
            action: 'error',
            component: (
              <div style={{ display: 'flex' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '16px' }}>Failed!</div>
                  Unable to download file
                  <div
                    style={{
                      color: 'red',
                      marginBottom: '20px',
                      padding: '20px',
                    }}
                  >
                    <span>
                      Your account does not have the required permission to download this file.
                    </span>
                  </div>
                </div>
              </div>
            ),
          });
        })
    }
    render={
      render
        ? render
        : ({ onClick, loading }) => (
            <IconWithLoading
              {...{ loading }}
              spinnerProps={{ color: 'grey' }}
              Icon={() => (
                <DownloadIcon
                  {...{ onClick }}
                  width={13}
                  fill={theme.lightBlue}
                  style={{ cursor: 'pointer' }}
                />
              )}
            />
          )
    }
  />
));

export default DownloadFileButton;
