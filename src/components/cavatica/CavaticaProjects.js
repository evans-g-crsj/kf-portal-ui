import * as React from 'react';
import { compose, lifecycle, withState } from 'recompose';
import { injectState } from 'freactal';
import { css } from 'react-emotion';
import { withTheme } from 'emotion-theming';
import styled from 'react-emotion';

import { getProjects as getCavaticaProjects } from 'services/cavatica';

import CavaticaAddProject from './CavaticaAddProject';

import CheckIcon from 'icons/CircleCheckIcon';

import { TableHeader } from 'uikit/Table';
import { Paragraph, Box } from 'uikit/Core';
import { FilterInput } from 'uikit/Input';

const enhance = compose(
  injectState,
  withTheme,
  withState('projectSearchValue', 'setProjectSearchValue', ''),
  withState('projectList', 'setProjectList', []),
  withState('selectedProject', 'setSelectedProject', null),
  lifecycle({
    async componentDidMount() {
      const { setProjectList } = this.props;

      getCavaticaProjects().then(projects => {
        setProjectList(projects);
      });
    },
  }),
);

const styles = theme => css`
  border: solid 1px ${theme.greyScale5};

  .header,
  .footer {
    background-color: ${theme.greyScale10};
    color: ${theme.greyScale9};
  }

  .header {
    display: flex;
    padding: 5px;
    justify-content: space-between;
  }

  .body {
    display: flex;
    flex-direction: column;
  }

  .footer {
    padding: 10px;
    display: flex;
    justify-content: space-between;
  }
`;

const ProjectSelector = styled.div`
  border: none;
  overflow-y: auto;
  overflow-x: none;
  cursor: default;

  height: 9em;

  div.projectOption {
    ${props => props.theme.row};
    padding: 8px;
    border-bottom: solid 1px ${props => props.theme.greyScale5};
    font-size: 14px;
    color: ${props => props.theme.primary};
  }

  div.projectOption:hover,
  div.selected {
    background-color: ${props => props.theme.optionSelected};
    color: black;
  }

  div.checkSymbol {
    width: 20px;
    padding-top: 2px;
    margin-bottom: -2px;
    display: flex;
    align-items: center;
  }
`;

const ProjectHeader = styled(TableHeader)`
  line-height: 2.55;
  text-transform: uppercase;
`;

const CavaticaProjects = ({
  theme,
  projectSearchValue,
  setProjectSearchValue,
  projectList,
  setProjectList,
  selectedProject,
  setSelectedProject,
  addingProject,
  setAddingProject,
  getGen3Ids,
  ...props
}) => {
  return (
    <div css={styles(theme)}>
      <div className="header">
        <ProjectHeader>Cavatica Projects:</ProjectHeader>{' '}
        {
          <Box position="relative">
            <FilterInput
              value={projectSearchValue}
              placeholder="Search projects"
              onChange={e => {
                setProjectSearchValue(e.target.value);
              }}
            />
          </Box>
        }
      </div>
      <div className="body">
        <ProjectSelector onChange={e => {}}>
          {projectList &&
            projectList.map &&
            projectList
              .filter(project => {
                if (project.id === selectedProject) return true;
                return projectSearchValue !== '' ? project.name.includes(projectSearchValue) : true;
              })
              .map(project => {
                const selected = selectedProject === project.id;
                return (
                  <div
                    key={project.id}
                    className={`projectOption ${selected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedProject(project.id);
                      props.onSelectProject(project);
                    }}
                  >
                    <div className="checkSymbol">
                      {selected && <CheckIcon width={14} height={14} fill={theme.active} />}
                    </div>
                    <Paragraph>{project.name}</Paragraph>
                  </div>
                );
              })}
        </ProjectSelector>
      </div>
      <div className="footer">
        <CavaticaAddProject
          setSelectedProject={setSelectedProject}
          onSuccess={() => {
            getCavaticaProjects().then(projects => {
              setProjectList(projects);
            });
          }}
          {...props}
        />
      </div>
    </div>
  );
};

export default enhance(CavaticaProjects);
