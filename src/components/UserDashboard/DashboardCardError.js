import React from 'react';

import { kfWebRoot } from 'common/injectGlobals';
import ExternalLink from 'uikit/ExternalLink';
import { PromptMessageContainer, PromptMessageHeading, PromptMessageContent } from './styles';

import { dashboardCardErrorContainer } from './UserDashboard.module.css';

export default () => {
  return (
    <div className={dashboardCardErrorContainer}>
      <PromptMessageContainer error mb={'8px'}>
        <PromptMessageHeading error mb={10}>
          Oops, something went wrong.
        </PromptMessageHeading>
        <PromptMessageContent>
          Try refreshing the page and if the error persists,{' '}
          <ExternalLink href={`${kfWebRoot}/contact/`} hasExternalIcon={false}>
            contact us
          </ExternalLink>
        </PromptMessageContent>
      </PromptMessageContainer>
    </div>
  );
};
