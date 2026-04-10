import '@testing-library/jest-dom/vitest';
import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useGettingStartedWithAAPQSDeveloper } from './hooks/Automation developer/useGettingStartedWithAAPQSDev';
import { useTemplatesQS } from './hooks/Automation operator/useTemplatesQS';
import { useCreateOrganizationQS } from './hooks/Platform Admin/useCreateOrganizationQS';
import { useCreateTeamsQS } from './hooks/Platform Admin/useCreateTeamsQS';
import { useCreateUsersQS } from './hooks/Platform Admin/useCreateUsersQS';
import { useGettingStartedWithAAPQSAdmin } from './hooks/Platform Admin/useGettingStartedWithAAPQSAdmin';
import { useReviewRolesQS } from './hooks/Platform Admin/useReviewRolesQS';
import { useAnsibleLightspeedQS } from './hooks/useAnsibleLightspeedQS';
import { useBuildDecisionEnvironmentsQS } from './hooks/useBuildDecisionEnvironmentsQS';
import { useBuildExecutionEnvironmentsQS } from './hooks/useBuildExecutionEnvironmentQS';
import { useCreateInventoryQS } from './hooks/useCreateInventoryQS';
import { useCreateJobTemplateQS } from './hooks/useCreateJobTemplateQS';
import { useCreateProjectQS } from './hooks/useCreateProjectQS';
import { QuickStartsPage } from './Quickstarts';
import { useFindingContentQuickStart } from './useFindingContentQuickStart';
import { useQuickStarts } from './useQuickStarts';

vi.mock('../../main/GatewayServices', () => ({
  useHasHubService: () => true,
}));

vi.mock('@patternfly/quickstarts', () => ({
  QuickStartCatalogPage: () => <div data-testid="qs-catalog" />,
}));

describe('QuickStartsPage', () => {
  it('should render page with heading and description', () => {
    render(
      <MemoryRouter>
        <QuickStartsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Quick Starts')).toBeInTheDocument();
    expect(
      screen.getByText('Learn Ansible automation with hands-on quickstarts.')
    ).toBeInTheDocument();
  });
});

describe('useQuickStarts', () => {
  it('should return all expected quick starts with correct metadata', () => {
    const { result } = renderHook(() => useQuickStarts());
    const quickStarts = result.current;

    expect(quickStarts.length).toBeGreaterThanOrEqual(22);

    const expectedNames = [
      'create-organization',
      'creating-a-team',
      'create-users',
      'review-roles',
      'getting started with Ansible Automation Platform - Platform Administrator',
      'dynamic-inventory',
      'create-project',
      'create-inventory',
      'getting started with Ansible Automation Platformr',
      'creating-a-job-template',
      'creating-a-rulebook-activation',
      'getting started with Ansible Automation Platform - Ansible Operator',
      'view-environment',
      'execute-an-inventory',
      'execute-project',
      'viewing-a-rulebook-activation',
      'launch-a-job-template',
      'build-decision-environment',
      'build-execution-environment',
      'ansible-lightspeed',
      'automation-mesh',
      'finding-content-in-ansible-automation-platform',
    ];

    for (const name of expectedNames) {
      const found = quickStarts.find((qs) => qs.metadata.name === name);
      expect(found, `Quick start "${name}" should exist`).toBeDefined();
    }

    for (const qs of quickStarts) {
      expect(qs.spec.displayName).toBeTruthy();
      expect(qs.spec.durationMinutes).toBeGreaterThan(0);
      expect(qs.spec.description).toBeTruthy();
    }
  });

  it('should return quick starts with correct display names', () => {
    const { result } = renderHook(() => useQuickStarts());
    const quickStarts = result.current;

    const expectedTitles = [
      'Building a decision environment',
      'Building an automation execution environment',
      'Create organization',
      'Create teams',
      'Create users',
      'Creating a dynamic inventory',
      'Creating a project',
      'Creating a rulebook activation',
      'Creating an inventory',
      'Creating and running a job or workflow template',
      'Environments',
      'Finding content in Ansible Automation Platform',
      'Getting started with Ansible Automation Platform - Ansible Operator',
      'Getting started with Ansible Automation Platform - Automation Developer',
      'Getting started with Ansible Automation Platform - Platform Administrator',
      'Inventories',
      'Projects',
      'Review roles',
      'Rulebook activations',
      'Setting up Ansible Lightspeed',
      'Setting up automation mesh',
      'Templates',
    ];

    const actualTitles = quickStarts
      .map((qs) => qs.spec.displayName)
      .sort((a, b) => a.localeCompare(b));
    for (const title of expectedTitles) {
      expect(actualTitles, `Title "${title}" should exist`).toContain(title);
    }
  });

  it('should return quick starts with correct descriptions', () => {
    const { result } = renderHook(() => useQuickStarts());
    const quickStarts = result.current;

    const descriptionSnippets: Record<string, string> = {
      'build-decision-environment': 'Build a decision environment.',
      'build-execution-environment': 'Build, view, and sync an environment.',
      'create-organization': 'Create an organization.',
      'creating-a-team': 'Create a team and associate organizations and roles',
      'create-users': 'Create a user and associate organizations, teams, and roles',
      'create-project': 'Create a project.',
      'ansible-lightspeed': 'Set up Ansible Lightspeed with IBM watsonx',
      'automation-mesh': 'Automate at scale in a cloud-native way',
    };

    for (const [name, snippet] of Object.entries(descriptionSnippets)) {
      const qs = quickStarts.find((q) => q.metadata.name === name);
      expect(qs, `Quick start "${name}" should exist`).toBeDefined();
      expect(qs!.spec.description).toContain(snippet);
    }
  });
});

describe('Finding Content quick start - detailed content validation', () => {
  it('should have correct metadata', () => {
    const { result } = renderHook(() => useFindingContentQuickStart());
    const qs = result.current;

    expect(qs.spec.displayName).toBe('Finding content in Ansible Automation Platform');
    expect(qs.spec.durationMinutes).toBe(5);
    expect(qs.spec.prerequisites).toHaveLength(1);
    expect(qs.spec.prerequisites![0]).toContain('Ansible Automation Platform subscription');
  });

  it('should have 4 tasks with correct titles', () => {
    const { result } = renderHook(() => useFindingContentQuickStart());
    const qs = result.current;

    expect(qs.spec.tasks).toHaveLength(4);

    const expectedTaskTitles = [
      'Filter content by repository type in the Collections view',
      'Filter content by tag in the Collections view',
      'Filter content by Namespace in the Collections view',
      'Filter content by keyword in the Collections view',
    ];

    for (let i = 0; i < expectedTaskTitles.length; i++) {
      expect(qs.spec.tasks![i].title).toBe(expectedTaskTitles[i]);
    }
  });

  it('should have task 1 with correct instruction content', () => {
    const { result } = renderHook(() => useFindingContentQuickStart());
    const task = result.current.spec.tasks![0];

    expect(task.description).toContain('From the navigation panel, select Automation Content');
    expect(task.description).toContain('Repository');
    expect(task.description).toContain('Scroll through the filtered results');
    expect(task.description).toContain('admonition tip');
    expect(task.review?.instructions).toContain('Did you complete the task successfully?');
  });

  it('should have task 2 with correct instruction content', () => {
    const { result } = renderHook(() => useFindingContentQuickStart());
    const task = result.current.spec.tasks![1];

    expect(task.description).toContain('From the navigation panel, select Automation Content');
    expect(task.description).toContain('Tag');
    expect(task.description).toContain('admonition tip');
    expect(task.review?.instructions).toContain(
      'list of collection titles that correspond to the tag'
    );
    expect(task.review?.failedTaskHelp).toContain("This task isn't verified yet");
  });

  it('should have task 3 with correct instruction content', () => {
    const { result } = renderHook(() => useFindingContentQuickStart());
    const task = result.current.spec.tasks![2];

    expect(task.description).toContain('From the navigation panel, select Automation Content');
    expect(task.description).toContain('Namespace');
    expect(task.description).toContain('Enter the namespace you want to search for');
    expect(task.review?.instructions).toContain(
      'list of collection titles that correspond to the namespace'
    );
  });

  it('should have task 4 with correct instruction content', () => {
    const { result } = renderHook(() => useFindingContentQuickStart());
    const task = result.current.spec.tasks![3];

    expect(task.description).toContain('From the navigation panel, select Automation Content');
    expect(task.description).toContain('keyword');
    expect(task.description).toContain('magnifying glass icon');
    expect(task.review?.instructions).toContain(
      'list of collection titles that correspond to your search term'
    );
  });
});

describe('High Priority Quick Starts - metadata validation', () => {
  it('should have correct metadata for Getting Started - Platform Administrator', () => {
    const { result } = renderHook(() => useGettingStartedWithAAPQSAdmin());
    const qs = result.current;

    expect(qs.spec.displayName).toBe(
      'Getting started with Ansible Automation Platform - Platform Administrator'
    );
    expect(qs.spec.durationMinutes).toBe(20);
    expect(qs.spec.tasks!.length).toBeGreaterThanOrEqual(1);
  });

  it('should have correct metadata for Getting Started - Automation Developer', () => {
    const { result } = renderHook(() => useGettingStartedWithAAPQSDeveloper());
    const qs = result.current;

    expect(qs.spec.displayName).toBe(
      'Getting started with Ansible Automation Platform - Automation Developer'
    );
    expect(qs.spec.tasks!.length).toBeGreaterThanOrEqual(1);
  });

  it('should have correct metadata for Creating and running a job template', () => {
    const { result } = renderHook(() => useCreateJobTemplateQS());
    const qs = result.current;

    expect(qs.spec.displayName).toBe('Creating and running a job or workflow template');
    expect(qs.spec.durationMinutes).toBe(10);
    expect(qs.spec.tasks!.length).toBeGreaterThanOrEqual(1);

    const allText = [
      qs.spec.displayName,
      qs.spec.description,
      qs.spec.introduction,
      ...(qs.spec.tasks?.map((t) => `${t.title} ${t.description}`) ?? []),
    ]
      .join(' ')
      .toLowerCase();
    expect(allText).toContain('template');
  });

  it('should have correct metadata for Setting up Ansible Lightspeed', () => {
    const { result } = renderHook(() => useAnsibleLightspeedQS());
    const qs = result.current;

    expect(qs.spec.displayName).toBe('Setting up Ansible Lightspeed');

    const allText = [qs.spec.displayName, qs.spec.description, qs.spec.introduction]
      .join(' ')
      .toLowerCase();
    expect(allText).toContain('lightspeed');
  });
});

describe('Quick start content validation', () => {
  describe('Platform Admin quick starts mention Access Management keywords', () => {
    it('should contain organization, user, or team keywords', () => {
      const hooks = [useCreateOrganizationQS, useCreateTeamsQS, useCreateUsersQS];

      for (const hook of hooks) {
        const { result } = renderHook(() => hook());
        const qs = result.current;

        const allText = [
          qs.spec.displayName,
          qs.spec.description,
          qs.spec.introduction,
          ...(qs.spec.tasks?.map((t) => `${t.title} ${t.description}`) ?? []),
        ]
          .join(' ')
          .toLowerCase();

        const hasAccessKeyword =
          allText.includes('access management') ||
          allText.includes('organization') ||
          allText.includes('user') ||
          allText.includes('team');

        expect(
          hasAccessKeyword,
          `${qs.spec.displayName} should reference Access Management concepts`
        ).toBe(true);
      }
    });
  });

  describe('Automation Execution quick starts mention relevant sections', () => {
    it('should contain project, inventory, or template keywords', () => {
      const hookConfigs = [
        { hook: useCreateProjectQS, keywords: ['project', 'playbook'] },
        { hook: useCreateInventoryQS, keywords: ['inventory', 'host'] },
        { hook: useTemplatesQS, keywords: ['template', 'job'] },
      ];

      for (const { hook, keywords } of hookConfigs) {
        const { result } = renderHook(() => hook());
        const qs = result.current;

        const allText = [
          qs.spec.displayName,
          qs.spec.description,
          qs.spec.introduction,
          ...(qs.spec.tasks?.map((t) => `${t.title} ${t.description}`) ?? []),
        ]
          .join(' ')
          .toLowerCase();

        const hasKeyword = keywords.some((kw) => allText.includes(kw));
        expect(
          hasKeyword,
          `${qs.spec.displayName} should mention one of: ${keywords.join(', ')}`
        ).toBe(true);
      }
    });
  });

  describe('Environment quick starts mention building', () => {
    it('should contain environment keyword', () => {
      const hooks = [useBuildDecisionEnvironmentsQS, useBuildExecutionEnvironmentsQS];

      for (const hook of hooks) {
        const { result } = renderHook(() => hook());
        const qs = result.current;

        const allText = [
          qs.spec.displayName,
          qs.spec.description,
          qs.spec.introduction,
          ...(qs.spec.tasks?.map((t) => `${t.title} ${t.description}`) ?? []),
        ]
          .join(' ')
          .toLowerCase();

        expect(allText).toContain('environment');
      }
    });
  });

  describe('Quick starts with prerequisites have prerequisite data', () => {
    it('should define prerequisites for quick starts that require them', () => {
      const hooksWithPrereqs = [useCreateTeamsQS, useCreateUsersQS];

      for (const hook of hooksWithPrereqs) {
        const { result } = renderHook(() => hook());
        const qs = result.current;

        expect(
          qs.spec.prerequisites,
          `${qs.spec.displayName} should have prerequisites`
        ).toBeDefined();
        expect(qs.spec.prerequisites!.length).toBeGreaterThan(0);
        expect(qs.spec.prerequisites!.some((p) => p.includes('Ansible Automation Platform'))).toBe(
          true
        );
      }
    });
  });

  describe('Multi-task quick starts have multiple tasks defined', () => {
    it('should have more than one task for multi-task quick starts', () => {
      const { result } = renderHook(() => useReviewRolesQS());
      const qs = result.current;

      expect(qs.spec.tasks).toBeDefined();
      expect(qs.spec.tasks!.length).toBeGreaterThan(1);
    });
  });
});
