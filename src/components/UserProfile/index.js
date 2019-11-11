import * as React from 'react';
import { get } from 'lodash';
import { css } from 'react-emotion';
import { compose, lifecycle, withState, withPropsOnChange, withHandlers } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { injectState } from 'freactal';
import { withTheme } from 'emotion-theming';

import { getProfile, updateProfile } from 'services/profiles';
import { ROLES } from 'common/constants';

import BasicInfoForm from 'components/forms/BasicInfoForm';
import { Container, EditButton, ProfileImage } from './ui';
import AboutMe from './AboutMe';
import Settings from './Settings';
import RoleIconButton from '../RoleIconButton';
import Row from 'uikit/Row';
import { H1 } from 'uikit/Headings';
import Error from '../Error';
import inRange from 'lodash/inRange';
import { extractErrorMessage } from 'utils';

import { flexColumn } from '../../theme/tempTheme.module.css';
import { secondaryNav } from 'uikit/SecondaryNav/SecondaryNav.module.css';

export const userProfileBackground = (
  loggedInUser,
  { showBanner = true, gradientDirection = 'right' } = {},
) => {
  const role = ROLES.find(x => x.type === get(loggedInUser, 'roles[0]', '')) || {};
  const banner = get(role, 'banner', '');
  const profileColors = get(role, 'profileColors', {});
  return css`
    background-position-x: right;
    background-repeat: no-repeat;
    background-image: ${showBanner ? `url(${banner}), ` : ``}
      linear-gradient(
        to ${gradientDirection},
        ${profileColors.gradientDark} 33%,
        ${profileColors.gradientMid} 66%,
        ${profileColors.gradientLight}
      );
  `;
};

const fetchProfile = async ({ loggedInUser, userID, api, setProfile, setError }) => {
  if (loggedInUser && userID === loggedInUser._id) {
    setProfile(loggedInUser);
    return;
  }

  try {
    const profile = await getProfile(api)(userID);
    setProfile(profile);
  } catch (error) {
    setError(error);
  }
};

export default compose(
  injectState,
  withRouter,
  withState('profile', 'setProfile', null),
  withState('error', 'setError', null),
  withTheme,
  lifecycle({
    async componentDidMount() {
      const {
        state: { loggedInUser },
        match: {
          params: { userID },
        },
        setProfile,
        setError,
        api,
      } = this.props;
      fetchProfile({ loggedInUser, userID, setProfile, setError, api });
    },
  }),
  withState('interests', 'setInterests', ({ profile }) => (profile || {}).interests || []),
  withPropsOnChange(['profile'], ({ profile, state: { loggedInUser } }) => {
    return {
      canEdit: loggedInUser && profile && profile._id === loggedInUser._id,
    };
  }),
  withPropsOnChange(
    ['match'],
    async ({
      match: {
        params: { userID },
      },
      setProfile,
      state: { loggedInUser },
      api,
      setError,
    }) => {
      fetchProfile({ loggedInUser, userID, setProfile, setError, api });
    },
  ),
  withHandlers({
    submit: ({ profile, effects: { setUser }, api }) => async values => {
      await updateProfile(api)({
        user: {
          ...profile,
          ...values,
        },
      }).then(async updatedProfile => {
        await setUser({ ...updatedProfile, api });
      });
    },
  }),
)(
  ({
    state: { loggedInUser },
    effects: { setModal },
    profile,
    theme,
    canEdit,
    submit,
    location: { hash },
    api,
    error,
  }) => {
    if (error && error.response) {
      const errorStatus = error.response.status;
      const text = inRange(errorStatus, 400, 405) ? extractErrorMessage(error.response) : undefined;
      return <Error text={text} />;
    } else if (!profile) {
      return <div>Loading...</div>;
    } else if (Object.keys(profile).length === 0) {
      return <Error text={'404: Page not found.'} />;
    }

    return (
      <div
        className={css`
          flex: 1;
        `}
      >
        <div
          className={css`
            ${userProfileBackground(profile)};
            min-height: 330px;
            align-items: center;
            display: flex;
            justify-content: center;
          `}
        >
          <Container row alignItems="center">
            <Row width="65%" pr={50} alignItems="center">
              <ProfileImage email={profile.email || ''} />
              <div
                className={css`
                  width: 49%;
                  align-items: flex-start;
                  ${flexColumn};
                  padding: 0 15px;
                `}
              >
                <RoleIconButton loggedInUser={loggedInUser} />

                <H1 lineHeight="31px" mb="10px" mt="16px" color={theme.white}>
                  {`${profile.firstName} ${profile.lastName}`}
                </H1>

                <div
                  className={css`
                    font-size: 14px;
                    color: #fff;
                    line-height: 28px;
                    ${flexColumn};
                  `}
                >
                  <span
                    className={css`
                      font-size: 1.4em;
                    `}
                  >
                    {profile.jobTitle}
                  </span>
                  <span>{profile.institution}</span>
                  <span>{profile.department}</span>
                  <span>
                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                  </span>
                  <span
                    css={`
                      margin-top: 5px;
                    `}
                  >
                    {canEdit && (
                      <EditButton
                        onClick={() => {
                          setModal({
                            title: 'Edit Basic Information',
                            component: <BasicInfoForm {...{ api }} />,
                          });
                        }}
                      />
                    )}
                  </span>
                </div>
              </div>
            </Row>
          </Container>
        </div>
        <div
          className={css`
            display: flex;
            justify-content: center;
            align-items: flex-start;
            background: #fff;
            box-shadow: 0px 0px 4.9px 0.1px #bbbbbb;
            border: solid 1px #e0e1e6;
          `}
        >
          <Container>
            <ul className={secondaryNav}>
              <li>
                <Link
                  to="#aboutMe"
                  className={hash === '#aboutMe' || hash !== '#settings' ? 'active' : ''}
                >
                  About Me
                </Link>
              </li>
              {canEdit && (
                <li>
                  <Link to="#settings" className={hash === '#settings' ? 'active' : ''}>
                    Settings
                  </Link>
                </li>
              )}
            </ul>
          </Container>
        </div>
        {(hash === '#aboutMe' || hash !== '#settings') && (
          <AboutMe profile={profile} canEdit={canEdit} submit={submit} />
        )}
        {hash === '#settings' && <Settings profile={profile} submit={submit} />}
      </div>
    );
  },
);
