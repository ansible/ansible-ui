import { useFeatureFlags, useFeatureFlag, FeatureFlags } from './useFeatureFlags';
import { awxAPI } from './api/awx-utils';

function FeatureFlagsTest() {
  const { data: flags } = useFeatureFlags();

  return (
    <ul>
      {flags
        ? Object.entries(flags).map(([key, value]) => (
            <li key={key} data-cy={key}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              {key}: {value ? 'true' : 'false'}
            </li>
          ))
        : null}
    </ul>
  );
}

function FeatureFlagTest(props: { flag: keyof FeatureFlags }) {
  const isSet = useFeatureFlag(props.flag);

  return (
    <p>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      {isSet ? 'true' : 'false'}
    </p>
  );
}

describe('useFeatureFlags', () => {
  it('should should return flags object with flags set', () => {
    cy.intercept('GET', awxAPI`/feature_flags_state/`, {
      statusCode: 200,
      body: {
        FEATURE_POLICY_AS_CODE_ENABLED: true,
      },
    });

    cy.mount(<FeatureFlagsTest />);

    cy.get('[data-cy="FEATURE_POLICY_AS_CODE_ENABLED"]').contains('true');
  });

  it('should should return flags object with flags off', () => {
    cy.intercept('GET', awxAPI`/feature_flags_state/`, {
      statusCode: 200,
      body: {
        FEATURE_POLICY_AS_CODE_ENABLED: false,
      },
    });

    cy.mount(<FeatureFlagsTest />);

    cy.get('[data-cy="FEATURE_POLICY_AS_CODE_ENABLED"]').contains('false');
  });
});

describe('useFeatureFlag', () => {
  it('should should return false', () => {
    cy.intercept('GET', awxAPI`/feature_flags_state/`, {
      statusCode: 200,
      body: {
        FEATURE_POLICY_AS_CODE_ENABLED: true,
      },
    });

    cy.mount(<FeatureFlagTest flag="FEATURE_POLICY_AS_CODE_ENABLED" />);

    cy.contains('true');
  });

  it('should should return true', () => {
    cy.intercept('GET', awxAPI`/feature_flags_state/`, {
      statusCode: 200,
      body: {
        FEATURE_POLICY_AS_CODE_ENABLED: false,
      },
    });

    cy.mount(<FeatureFlagTest flag="FEATURE_POLICY_AS_CODE_ENABLED" />);

    cy.contains('false');
  });

  it('should should return false for missing flags', () => {
    cy.intercept('GET', awxAPI`/feature_flags_state/`, {
      statusCode: 200,
      body: {
        FEATURE_SOME_OTHER_FLAG_ENABLED: true,
      },
    });

    cy.mount(<FeatureFlagTest flag="FEATURE_POLICY_AS_CODE_ENABLED" />);

    cy.contains('false');
  });

  it('should should return false for bad API response', () => {
    cy.intercept('GET', awxAPI`/feature_flags_state/`, {
      statusCode: 500,
      body: {},
    });

    cy.mount(<FeatureFlagTest flag="FEATURE_POLICY_AS_CODE_ENABLED" />);

    cy.contains('false');
  });
});
