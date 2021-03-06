import React, { Fragment, useState } from 'react';
import { compose } from 'recompose';

import Query from '@kfarranger/components/dist/Query';

import { withApi } from 'services/api';
import Column from 'uikit/Column';

import { aggsConfig } from './aggsConfig';

import Tabs from 'components/Tabs';
import Tab from './Tab';

import styles from './AggregationSidebar.module.css';

const FilterTabs = ({
  typesAggsConfig,
  data,
  type,
  setSQON,
  api,
  sqon,
  onValueChange = () => {},
  projectId,
  containerRef,
  graphqlField,
  translateSQONValue,
  ...props
}) => {
  const [selectedTab, setSelectedTab] = useState('CLINICAL');
  return (
    <Fragment>
      <Tabs
        selectedTab={selectedTab}
        options={[
          { id: 'CLINICAL', display: 'Clinical Filters' },
          { id: 'FILE', display: 'File Filters' },
        ]}
        onTabSelect={setSelectedTab}
      />
      <div className={styles.aggsListWrapper}>
        <div className={styles.scrollY}>
          <Column
            w="100%"
            style={selectedTab === 'FILE' ? { display: 'block' } : { display: 'none' }}
          >
            <Tab
              type="FILE"
              {...{
                setSQON,
                aggs: typesAggsConfig.FILE,
                api,
                containerRef,
                sqon,
                onValueChange,
                projectId,
                graphqlField,
                translateSQONValue,
                ...props,
              }}
            />
          </Column>
          <Column
            w="100%"
            style={selectedTab === 'CLINICAL' ? { display: 'block' } : { display: 'none' }}
          >
            <Tab
              type="CLINICAL"
              {...{
                setSQON,
                aggs: typesAggsConfig.CLINICAL,
                api,
                containerRef,
                sqon,
                onValueChange,
                projectId,
                graphqlField,
                translateSQONValue,
                ...props,
              }}
            />
          </Column>
        </div>
      </div>
    </Fragment>
  );
};

const FiltersPanel = ({
  api,
  sqon,
  containerRef,
  setSQON = () => {},
  onValueChange = () => {},
  projectId,
  graphqlField,
  translateSQONValue,
  effects,
  ...props
}) => (
  <Query
    renderError
    shouldFetch={true}
    api={api}
    projectId={projectId}
    name={`aggsIntrospection`}
    query={`
      query dataTypes {
        __schema {
          types {
            name
            fields {
              name
              type {
                name
              }
            }
          }
        }
      }
    `}
    render={({ loading, data }) => {
      if (!data) return null;
      const containerRef = React.createRef();
      const typesAggsConfig = aggsConfig(data, graphqlField);

      return (
        <FilterTabs
          {...{
            setSQON,
            typesAggsConfig,
            api,
            containerRef,
            data,
            sqon,
            onValueChange,
            projectId,
            graphqlField,
            translateSQONValue,
            ...props,
          }}
        />
      );
    }}
  />
);

export default compose(withApi)(FiltersPanel);
