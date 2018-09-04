import React from 'react';
import { compose } from 'recompose';
import { Trans } from 'react-i18next';
import { withTheme } from 'emotion-theming';
import { injectState } from 'freactal';

import { MatchBox } from '@arranger/components/dist/Arranger';
import graphql from 'services/arranger';
import { ModalFooter } from './Modal';
import { TealActionButton } from 'uikit/Button';
import { Paragraph } from 'uikit/Core';
import { FileRepoH3 as H3 } from 'uikit/Headings';
import { TableHeader } from 'uikit/Table';

const UploadButton = withTheme(({ theme, ...props }) => <TealActionButton {...props} />);

const enhance = compose(withTheme, injectState);

const UploadIdsModal = ({
  api,
  theme,
  state: { loggedInUser },
  effects: { addUserSet, unsetModal },
  setSQON,
  ...props
}) => (
  <MatchBox
    {...props}
    instructionText={
      <Paragraph>
        Type or copy-and-paste a list of comma delimited identifiers, or choose a file of
        identifiers to upload
      </Paragraph>
    }
    placeholderText={`e.g. File Id\ne.g. Sample Id\ne.g. Participant Id`}
    entitySelectText={<Paragraph>Select the entity to upload</Paragraph>}
    entitySelectPlaceholder={'Select an Entity'}
    matchedTabTitle={'Matched'}
    unmatchedTabTitle={'Unmatched'}
    matchTableColumnHeaders={{
      inputId: <TableHeader>Input Id</TableHeader>,
      matchedEntity: <TableHeader>Matched Entity</TableHeader>,
      entityId: <TableHeader>Entity Id</TableHeader>,
    }}
    browseButtonText={<Trans>Browse</Trans>}
    matchHeaderText={
      <H3 mb="0.8em">
        <Trans>Matching files in the Kids First Data Repository</Trans>
      </H3>
    }
    ButtonComponent={UploadButton}
  >
    {({ hasResults, saveSet }) => (
      <ModalFooter
        {...{
          handleSubmit: async () => {
            const { type, setId, size, nextSQON } = await saveSet({
              userId: loggedInUser.egoId,
              api: graphql(api),
              dataPath: 'data.saveSet',
            });
            await addUserSet({ type, setId, size, api });
            setSQON(nextSQON);
            unsetModal();
          },
          submitText: 'Upload',
          submitDisabled: !hasResults,
        }}
      />
    )}
  </MatchBox>
);

export default enhance(UploadIdsModal);
