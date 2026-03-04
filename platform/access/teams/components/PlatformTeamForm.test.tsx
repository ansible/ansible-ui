/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { CreatePlatformTeam, EditPlatformTeam } from './PlatformTeamForm';

describe('PlatformTeamForm', () => {
  it('exports the CreatePlatformTeam component', () => {
    expect(CreatePlatformTeam).toBeDefined();
    expect(typeof CreatePlatformTeam).toBe('function');
  });

  it('exports the EditPlatformTeam component', () => {
    expect(EditPlatformTeam).toBeDefined();
    expect(typeof EditPlatformTeam).toBe('function');
  });
});
