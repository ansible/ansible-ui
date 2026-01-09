/* eslint-disable @typescript-eslint/no-unsafe-call*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable @typescript-eslint/no-unsafe-return*/
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { edaAPI } from '../../common/eda-utils';

import {
  LogLevelEnum,
  RestartPolicyEnum,
  ScmTypeEnum,
  StatusEnum,
} from '../../interfaces/generated/eda-api';
import { RulebookActivationPage } from './RulebookActivationPage';

const mockBulkAction = vi.fn();
vi.mock('../../common/useEdaBulkConfirmation', () => ({
  useEdaBulkConfirmation: () => mockBulkAction,
}));

const mockActivationOptions = {
  name: 'Activation Instance',
  description: '',
  renders: ['application/json', 'text/html'],
  parses: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'],
  actions: {
    GET: {
      id: {
        type: 'integer',
        label: 'ID',
      },
      name: {
        type: 'string',
        label: 'Name',
      },
      description: {
        type: 'string',
        label: 'Description',
      },
      is_enabled: {
        type: 'boolean',
        label: 'Is enabled',
      },
      decision_environment: {
        type: 'nested object',
        label: 'Decision environment',
        children: {
          id: {
            type: 'integer',
            required: false,
            read_only: true,
            label: 'ID',
            default: "<class 'rest_framework.fields.empty'>",
          },
          name: {
            type: 'string',
            required: true,
            read_only: false,
            label: 'Name',
            default: "<class 'rest_framework.fields.empty'>",
          },
          description: {
            type: 'string',
            required: false,
            read_only: false,
            label: 'Description',
            default: "<class 'rest_framework.fields.empty'>",
          },
          image_url: {
            type: 'string',
            required: true,
            read_only: false,
            label: 'Image url',
            default: "<class 'rest_framework.fields.empty'>",
          },
          pull_policy: {
            type: 'choice',
            required: false,
            read_only: false,
            label: 'Pull policy',
            help_text: 'Pull policy for the image before running',
            choices: [
              {
                value: 'always',
                display_name: 'Always pull container before running.',
              },
              {
                value: 'missing',
                display_name: 'Only pull the image if not present before running.',
              },
              {
                value: 'never',
                display_name: 'Never pull container before running.',
              },
            ],
            default: "<class 'rest_framework.fields.empty'>",
          },
          organization_id: {
            type: 'field',
            required: false,
            read_only: true,
            label: 'Organization id',
            default: "<class 'rest_framework.fields.empty'>",
          },
        },
      },
      status: {
        type: 'choice',
        label: 'Status',
        choices: [
          {
            value: 'starting',
            display_name: 'starting',
          },
          {
            value: 'running',
            display_name: 'running',
          },
          {
            value: 'pending',
            display_name: 'pending',
          },
          {
            value: 'failed',
            display_name: 'failed',
          },
          {
            value: 'stopping',
            display_name: 'stopping',
          },
          {
            value: 'stopped',
            display_name: 'stopped',
          },
          {
            value: 'deleting',
            display_name: 'deleting',
          },
          {
            value: 'completed',
            display_name: 'completed',
          },
          {
            value: 'unresponsive',
            display_name: 'unresponsive',
          },
          {
            value: 'error',
            display_name: 'error',
          },
          {
            value: 'workers offline',
            display_name: 'workers offline',
          },
        ],
      },
      git_hash: {
        type: 'string',
        label: 'Git hash',
      },
      project: {
        type: 'nested object',
        label: 'Project',
        children: {
          id: {
            type: 'integer',
            required: false,
            read_only: true,
            label: 'ID',
            default: "<class 'rest_framework.fields.empty'>",
          },
          git_hash: {
            type: 'string',
            required: true,
            read_only: false,
            label: 'Git hash',
            default: "<class 'rest_framework.fields.empty'>",
          },
          url: {
            type: 'string',
            required: true,
            read_only: false,
            label: 'Url',
            default: "<class 'rest_framework.fields.empty'>",
          },
          scm_type: {
            type: 'choice',
            required: false,
            read_only: false,
            label: 'Scm type',
            choices: [
              {
                value: 'git',
                display_name: 'Git',
              },
            ],
            default: "<class 'rest_framework.fields.empty'>",
          },
          name: {
            type: 'string',
            required: true,
            read_only: false,
            label: 'Name',
            default: "<class 'rest_framework.fields.empty'>",
          },
          description: {
            type: 'string',
            required: false,
            read_only: false,
            label: 'Description',
            default: "<class 'rest_framework.fields.empty'>",
          },
          organization_id: {
            type: 'field',
            required: false,
            read_only: true,
            label: 'Organization id',
            default: "<class 'rest_framework.fields.empty'>",
          },
        },
      },
      rulebook: {
        type: 'nested object',
        label: 'Rulebook',
        children: {
          id: {
            type: 'integer',
            required: false,
            read_only: true,
            label: 'ID',
            default: "<class 'rest_framework.fields.empty'>",
          },
          name: {
            type: 'string',
            required: true,
            read_only: false,
            label: 'Name',
            default: "<class 'rest_framework.fields.empty'>",
          },
          description: {
            type: 'string',
            required: false,
            read_only: false,
            label: 'Description',
            default: "<class 'rest_framework.fields.empty'>",
          },
          organization_id: {
            type: 'field',
            required: false,
            read_only: true,
            label: 'Organization id',
            default: "<class 'rest_framework.fields.empty'>",
          },
        },
      },
      extra_var: {
        type: 'string',
        label: 'Extra var',
      },
      organization: {
        type: 'nested object',
        label: 'Organization',
        children: {
          id: {
            type: 'integer',
            required: false,
            read_only: true,
            label: 'ID',
            default: "<class 'rest_framework.fields.empty'>",
          },
          name: {
            type: 'string',
            required: true,
            read_only: false,
            label: 'Name',
            help_text: 'The name of this resource.',
            max_length: 512,
            default: "<class 'rest_framework.fields.empty'>",
          },
          description: {
            type: 'string',
            required: false,
            read_only: false,
            label: 'Description',
            help_text: 'The organization description.',
            default: "<class 'rest_framework.fields.empty'>",
          },
        },
      },
      instances: {
        type: 'field',
        label: 'Instances',
        child: {
          type: 'nested object',
          required: true,
          read_only: false,
          children: {
            id: {
              type: 'integer',
              required: false,
              read_only: true,
              label: 'ID',
              default: "<class 'rest_framework.fields.empty'>",
            },
            name: {
              type: 'string',
              required: false,
              read_only: false,
              label: 'Name',
              default: "<class 'rest_framework.fields.empty'>",
            },
            status: {
              type: 'choice',
              required: false,
              read_only: false,
              label: 'Status',
              choices: [
                {
                  value: 'starting',
                  display_name: 'starting',
                },
                {
                  value: 'running',
                  display_name: 'running',
                },
                {
                  value: 'pending',
                  display_name: 'pending',
                },
                {
                  value: 'failed',
                  display_name: 'failed',
                },
                {
                  value: 'stopping',
                  display_name: 'stopping',
                },
                {
                  value: 'stopped',
                  display_name: 'stopped',
                },
                {
                  value: 'deleting',
                  display_name: 'deleting',
                },
                {
                  value: 'completed',
                  display_name: 'completed',
                },
                {
                  value: 'unresponsive',
                  display_name: 'unresponsive',
                },
                {
                  value: 'error',
                  display_name: 'error',
                },
                {
                  value: 'workers offline',
                  display_name: 'workers offline',
                },
              ],
              default: "<class 'rest_framework.fields.empty'>",
            },
            git_hash: {
              type: 'string',
              required: false,
              read_only: false,
              label: 'Git hash',
              default: "<class 'rest_framework.fields.empty'>",
            },
            status_message: {
              type: 'string',
              required: false,
              read_only: false,
              label: 'Status message',
              default: "<class 'rest_framework.fields.empty'>",
            },
            activation_id: {
              type: 'field',
              required: false,
              read_only: true,
              label: 'Activation id',
              default: "<class 'rest_framework.fields.empty'>",
            },
            organization_id: {
              type: 'field',
              required: false,
              read_only: true,
              label: 'Organization id',
              default: "<class 'rest_framework.fields.empty'>",
            },
            started_at: {
              type: 'datetime',
              required: false,
              read_only: true,
              label: 'Started at',
              default: "<class 'rest_framework.fields.empty'>",
            },
            ended_at: {
              type: 'datetime',
              required: false,
              read_only: true,
              label: 'Ended at',
              default: "<class 'rest_framework.fields.empty'>",
            },
            queue_name: {
              type: 'string',
              required: false,
              read_only: true,
              label: 'Queue name',
            },
          },
          default: "<class 'rest_framework.fields.empty'>",
        },
      },
      restart_policy: {
        type: 'choice',
        label: 'Restart policy',
        choices: [
          {
            value: 'always',
            display_name: 'always',
          },
          {
            value: 'on-failure',
            display_name: 'on-failure',
          },
          {
            value: 'never',
            display_name: 'never',
          },
        ],
      },
      restart_count: {
        type: 'integer',
        label: 'Restart count',
        min_value: -2147483648,
        max_value: 2147483647,
      },
      rulebook_name: {
        type: 'string',
        label: 'Rulebook name',
        help_text: 'Name of the referenced rulebook',
      },
      current_job_id: {
        type: 'string',
        label: 'Current job id',
      },
      ruleset_stats: {
        type: 'field',
        label: 'Ruleset stats',
        help_text: 'The stat information about the activation',
      },
      rules_count: {
        type: 'integer',
        label: 'Rules count',
      },
      rules_fired_count: {
        type: 'integer',
        label: 'Rules fired count',
      },
      created_at: {
        type: 'datetime',
        label: 'Created at',
      },
      modified_at: {
        type: 'datetime',
        label: 'Modified at',
      },
      edited_at: {
        type: 'datetime',
        label: 'Edited at',
      },
      created_by: {
        type: 'field',
        label: 'Created by',
      },
      modified_by: {
        type: 'field',
        label: 'Modified by',
      },
      edited_by: {
        type: 'field',
        label: 'Edited by',
      },
      restarted_at: {
        type: 'datetime',
        label: 'Restarted at',
      },
      status_message: {
        type: 'string',
        label: 'Status message',
      },
      awx_token_id: {
        type: 'field',
        label: 'Awx token id',
      },
      eda_credentials: {
        type: 'list',
        label: 'Eda credentials',
        child: {
          type: 'nested object',
          required: true,
          read_only: false,
          children: {
            name: {
              type: 'string',
              required: true,
              read_only: false,
              label: 'Name',
              default: "<class 'rest_framework.fields.empty'>",
            },
            description: {
              type: 'string',
              required: false,
              read_only: false,
              label: 'Description',
              default: "<class 'rest_framework.fields.empty'>",
            },
            inputs: {
              type: 'field',
              required: false,
              read_only: true,
              label: 'Inputs',
              default: "<class 'rest_framework.fields.empty'>",
            },
            credential_type: {
              type: 'nested object',
              required: false,
              read_only: false,
              label: 'Credential type',
              children: {
                id: {
                  type: 'integer',
                  required: false,
                  read_only: true,
                  label: 'ID',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                name: {
                  type: 'string',
                  required: true,
                  read_only: false,
                  label: 'Name',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                namespace: {
                  type: 'string',
                  required: false,
                  read_only: false,
                  label: 'Namespace',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                kind: {
                  type: 'string',
                  required: false,
                  read_only: false,
                  label: 'Kind',
                  default: "<class 'rest_framework.fields.empty'>",
                },
              },
              default: "<class 'rest_framework.fields.empty'>",
            },
            references: {
              type: 'field',
              required: false,
              read_only: false,
              label: 'References',
              default: "<class 'rest_framework.fields.empty'>",
            },
            created_by: {
              type: 'field',
              required: true,
              read_only: false,
              label: 'Created by',
              default: "<class 'rest_framework.fields.empty'>",
            },
            modified_by: {
              type: 'field',
              required: true,
              read_only: false,
              label: 'Modified by',
              default: "<class 'rest_framework.fields.empty'>",
            },
            id: {
              type: 'integer',
              required: false,
              read_only: true,
              label: 'ID',
              default: "<class 'rest_framework.fields.empty'>",
            },
            created_at: {
              type: 'datetime',
              required: false,
              read_only: true,
              label: 'Created at',
              default: "<class 'rest_framework.fields.empty'>",
            },
            modified_at: {
              type: 'datetime',
              required: false,
              read_only: true,
              label: 'Modified at',
              default: "<class 'rest_framework.fields.empty'>",
            },
            managed: {
              type: 'boolean',
              required: false,
              read_only: true,
              label: 'Managed',
              default: "<class 'rest_framework.fields.empty'>",
            },
            organization: {
              type: 'nested object',
              required: true,
              read_only: false,
              label: 'Organization',
              children: {
                id: {
                  type: 'integer',
                  required: false,
                  read_only: true,
                  label: 'ID',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                name: {
                  type: 'string',
                  required: true,
                  read_only: false,
                  label: 'Name',
                  help_text: 'The name of this resource.',
                  max_length: 512,
                  default: "<class 'rest_framework.fields.empty'>",
                },
                description: {
                  type: 'string',
                  required: false,
                  read_only: false,
                  label: 'Description',
                  help_text: 'The organization description.',
                  default: "<class 'rest_framework.fields.empty'>",
                },
              },
              default: "<class 'rest_framework.fields.empty'>",
            },
          },
          default: "<class 'rest_framework.fields.empty'>",
        },
      },
      log_level: {
        type: 'choice',
        label: 'Log level',
        choices: [
          {
            value: 'debug',
            display_name: 'debug',
          },
          {
            value: 'info',
            display_name: 'info',
          },
          {
            value: 'error',
            display_name: 'error',
          },
        ],
      },
      k8s_service_name: {
        type: 'string',
        label: 'K8s service name',
        help_text: 'Service name of the activation',
      },
      event_streams: {
        type: 'list',
        label: 'Event streams',
        child: {
          type: 'nested object',
          required: true,
          read_only: false,
          children: {
            name: {
              type: 'string',
              required: true,
              read_only: false,
              label: 'Name',
              default: "<class 'rest_framework.fields.empty'>",
            },
            test_mode: {
              type: 'boolean',
              required: false,
              read_only: false,
              label: 'Test mode',
              help_text: 'Enable test mode',
              default: "<class 'rest_framework.fields.empty'>",
            },
            additional_data_headers: {
              type: 'string',
              required: false,
              read_only: false,
              label: 'Additional data headers',
              help_text:
                'The additional http headers which will be added to the event data. The headers are comma delimited',
              default: "<class 'rest_framework.fields.empty'>",
            },
            organization: {
              type: 'field',
              required: false,
              read_only: true,
              label: 'Organization',
              default: "<class 'rest_framework.fields.empty'>",
            },
            eda_credential: {
              type: 'nested object',
              required: true,
              read_only: false,
              label: 'Eda credential',
              children: {
                id: {
                  type: 'integer',
                  required: false,
                  read_only: true,
                  label: 'ID',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                name: {
                  type: 'string',
                  required: true,
                  read_only: false,
                  label: 'Name',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                description: {
                  type: 'string',
                  required: false,
                  read_only: false,
                  label: 'Description',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                inputs: {
                  type: 'field',
                  required: false,
                  read_only: true,
                  label: 'Inputs',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                managed: {
                  type: 'boolean',
                  required: false,
                  read_only: false,
                  label: 'Managed',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                credential_type_id: {
                  type: 'field',
                  required: false,
                  read_only: true,
                  label: 'Credential type id',
                  default: "<class 'rest_framework.fields.empty'>",
                },
                organization_id: {
                  type: 'field',
                  required: false,
                  read_only: true,
                  label: 'Organization id',
                  default: "<class 'rest_framework.fields.empty'>",
                },
              },
              default: "<class 'rest_framework.fields.empty'>",
            },
            event_stream_type: {
              type: 'string',
              required: false,
              read_only: false,
              label: 'Event stream type',
              help_text: 'The type of the event stream based on credential type',
              default: "<class 'rest_framework.fields.empty'>",
            },
            uuid: {
              type: 'string',
              required: false,
              read_only: false,
              label: 'Uuid',
              default: "<class 'rest_framework.fields.empty'>",
            },
            created_by: {
              type: 'field',
              required: true,
              read_only: false,
              label: 'Created by',
              default: "<class 'rest_framework.fields.empty'>",
            },
            modified_by: {
              type: 'field',
              required: true,
              read_only: false,
              label: 'Modified by',
              default: "<class 'rest_framework.fields.empty'>",
            },
            id: {
              type: 'integer',
              required: false,
              read_only: true,
              label: 'ID',
              default: "<class 'rest_framework.fields.empty'>",
            },
            owner: {
              type: 'field',
              required: false,
              read_only: true,
              label: 'Owner',
              default: "<class 'rest_framework.fields.empty'>",
            },
            url: {
              type: 'field',
              required: false,
              read_only: true,
              label: 'Url',
              default: "<class 'rest_framework.fields.empty'>",
            },
            created_at: {
              type: 'datetime',
              required: false,
              read_only: true,
              label: 'Created at',
              default: "<class 'rest_framework.fields.empty'>",
            },
            modified_at: {
              type: 'datetime',
              required: false,
              read_only: true,
              label: 'Modified at',
              default: "<class 'rest_framework.fields.empty'>",
            },
            test_content_type: {
              type: 'string',
              required: false,
              read_only: true,
              label: 'Test content type',
              help_text: 'The content type of test data, when in test mode',
              default: "<class 'rest_framework.fields.empty'>",
            },
            test_content: {
              type: 'string',
              required: false,
              read_only: true,
              label: 'Test content',
              help_text: 'The content recieved, when in test mode, stored as a yaml string',
              default: "<class 'rest_framework.fields.empty'>",
            },
            test_error_message: {
              type: 'string',
              required: false,
              read_only: true,
              label: 'Test error message',
              help_text: 'The error message,  when in test mode',
              default: "<class 'rest_framework.fields.empty'>",
            },
            test_headers: {
              type: 'string',
              required: false,
              read_only: true,
              label: 'Test headers',
              help_text: 'The headers recieved, when in test mode, stored as a yaml string',
              default: "<class 'rest_framework.fields.empty'>",
            },
            events_received: {
              type: 'integer',
              required: false,
              read_only: true,
              label: 'Events received',
              help_text: 'The total number of events received by event stream',
              default: "<class 'rest_framework.fields.empty'>",
            },
            last_event_received_at: {
              type: 'datetime',
              required: false,
              read_only: true,
              label: 'Last event received at',
              help_text: 'The date/time when the last event was received',
              default: "<class 'rest_framework.fields.empty'>",
            },
          },
          default: "<class 'rest_framework.fields.empty'>",
        },
      },
      source_mappings: {
        type: 'string',
        label: 'Source mappings',
        help_text: 'Mapping between sources and event streams',
      },
      skip_audit_events: {
        type: 'boolean',
        label: 'Skip audit events',
        help_text: 'Skip audit events for activation',
      },
      log_tracking_id: {
        type: 'string',
        label: 'Log tracking id',
        help_text: 'Log tracking ID of the activation',
      },
    },
    PATCH: {
      name: {
        type: 'string',
        required: true,
        label: 'Name',
        default: "<class 'rest_framework.fields.empty'>",
      },
      description: {
        type: 'string',
        required: false,
        label: 'Description',
        default: "<class 'rest_framework.fields.empty'>",
      },
      is_enabled: {
        type: 'boolean',
        required: false,
        label: 'Is enabled',
        default: "<class 'rest_framework.fields.empty'>",
      },
      decision_environment_id: {
        type: 'integer',
        required: true,
        label: 'Decision environment id',
        default: "<class 'rest_framework.fields.empty'>",
      },
      rulebook_id: {
        type: 'integer',
        required: true,
        label: 'Rulebook id',
        default: "<class 'rest_framework.fields.empty'>",
      },
      extra_var: {
        type: 'string',
        required: false,
        label: 'Extra var',
        default: "<class 'rest_framework.fields.empty'>",
      },
      organization_id: {
        type: 'integer',
        required: true,
        label: 'Organization id',
        default: "<class 'rest_framework.fields.empty'>",
      },
      user: {
        type: 'field',
        required: false,
        label: 'User',
        default: "<class 'rest_framework.fields.empty'>",
      },
      restart_policy: {
        type: 'choice',
        required: false,
        label: 'Restart policy',
        choices: [
          {
            value: 'always',
            display_name: 'always',
          },
          {
            value: 'on-failure',
            display_name: 'on-failure',
          },
          {
            value: 'never',
            display_name: 'never',
          },
        ],
        default: "<class 'rest_framework.fields.empty'>",
      },
      awx_token_id: {
        type: 'integer',
        required: false,
        label: 'Awx token id',
        default: "<class 'rest_framework.fields.empty'>",
      },
      log_level: {
        type: 'choice',
        required: false,
        label: 'Log level',
        choices: [
          {
            value: 'debug',
            display_name: 'debug',
          },
          {
            value: 'info',
            display_name: 'info',
          },
          {
            value: 'error',
            display_name: 'error',
          },
        ],
        default: "<class 'rest_framework.fields.empty'>",
      },
      eda_credentials: {
        type: 'list',
        required: false,
        label: 'Eda credentials',
        child: {
          type: 'integer',
          required: true,
          read_only: false,
          default: "<class 'rest_framework.fields.empty'>",
        },
        default: "<class 'rest_framework.fields.empty'>",
      },
      k8s_service_name: {
        type: 'string',
        required: false,
        label: 'K8s service name',
        default: "<class 'rest_framework.fields.empty'>",
      },
      source_mappings: {
        type: 'string',
        required: false,
        label: 'Source mappings',
        help_text: 'Mapping between sources and event streams',
        default: "<class 'rest_framework.fields.empty'>",
      },
      skip_audit_events: {
        type: 'boolean',
        required: false,
        label: 'Skip audit events',
        help_text: 'Skip audit events for activation',
        default: "<class 'rest_framework.fields.empty'>",
      },
    },
  },
};

const mockWorkersOfflineActivation: EdaRulebookActivation = {
  id: 9,
  name: 'Demo Activation',
  description: '',
  is_enabled: true,
  decision_environment: {
    id: 1,
    name: 'Default Decision Environment',
    description: '',
    image_url:
      'brew.registry.redhat.io/rh-osbs/ansible-automation-platform-26-de-supported-rhel9:latest',
    organization_id: 1,
  },
  status: StatusEnum.WorkersOffline,
  git_hash: '96dcf0bc903780360e13c5614c35662d75157c05',
  project: {
    id: 11,
    git_hash: '96dcf0bc903780360e13c5614c35662d75157c05',
    url: 'https://github.com/ansible/ansible-ui',
    scm_type: ScmTypeEnum.Git,
    name: 'P1',
    description: '',
    organization_id: 1,
  },
  rulebook: {
    id: 97,
    name: 'range_long_running.yml',
    description: '',
    organization_id: 1,
  },
  extra_var: null,
  organization: {
    id: 1,
    name: 'Default',
    description: 'The default organization for Ansible Automation Platform',
  },
  instances: [
    {
      id: 1,
      name: 'Demo Activation',
      status: StatusEnum.WorkersOffline,
      git_hash: '96dcf0bc903780360e13c5614c35662d75157c05',
      status_message:
        "activation 1 is in an unknown state. The workers of its associated queue 'eda-ip-10-0-2-218-ec243bec-dfd5-d89a-4683-d87c33a7ac8b' are failing liveness checks. There may be an issue with the worker node; please contact the administrator.",
      activation_id: 1,
      organization_id: 1,
      started_at: '2025-10-15T16:38:14.437981Z',
      ended_at: null,
      queue_name: 'eda-ip-10-0-2-218-ec243bec-dfd5-d89a-4683-d87c33a7ac8b',
    },
  ],
  restart_policy: RestartPolicyEnum.OnFailure,
  restart_count: 0,
  rulebook_name: 'range_long_running.yml',
  current_job_id: null,
  rules_count: 1,
  rules_fired_count: 6,
  created_at: '2025-10-15T15:15:40.337529Z',
  modified_at: '2025-10-15T17:36:48.529694Z',
  edited_at: 'null',
  restarted_at: null,
  status_message:
    "activation 1 is in an unknown state. The workers of its associated queue 'eda-ip-10-0-2-218-ec243bec-dfd5-d89a-4683-d87c33a7ac8b' are failing liveness checks. There may be an issue with the worker node; please contact the administrator.",
  awx_token_id: null,
  log_level: LogLevelEnum.Error,
  eda_credentials: [],
  k8s_service_name: null,
  event_streams: [],
  source_mappings: '',
  skip_audit_events: false,
  created_by: {
    username: 'admin',
  },
  modified_by: {
    username: 'admin',
  },
  edited_by: {
    username: 'admin',
  },
};

describe('RulebookActivationPage', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    server.use(
      http.get(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(mockWorkersOfflineActivation);
      }),
      http.options(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(mockActivationOptions);
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should render the activation details when data is loaded', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });
    const kebabButton = getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);
    await waitFor(() => {
      expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
    });
    const restartOption = getByText('Restart rulebook activation');
    await user.click(restartOption);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
    });
  });

  it('should call enableActivationsWithWarning when enabling an activation with a copy name pattern', async () => {
    const user = userEvent.setup();

    const copyActivation = {
      ...mockWorkersOfflineActivation,
      is_enabled: false,
      name: 'Activation 1 @ 12:00:00',
    };

    server.use(
      http.get(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(copyActivation);
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: copyActivation.name })).toBeInTheDocument();
    });

    const switchButton = screen.getByRole('switch', { name: 'Click to enable instance' });
    await user.click(switchButton);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
    });
  });

  it('should call disableActivationsWithWarning when disabling an activation with workers offline', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });

    const switchButton = screen.getByRole('switch', { name: 'Click to disable instance' });
    await user.click(switchButton);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
      const lastCall = mockBulkAction.mock.calls.at(-1)?.[0];
      expect(lastCall.alertPrompts).toBeDefined();
      expect(lastCall.alertPrompts[0]).toContain('workers offline');
      expect(lastCall.alertPrompts[0]).toContain('Disabling');
    });
  });

  it('should call deleteActivationsWithWarning when deleting an activation with workers offline', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });

    const kebabButton = screen.getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);
    await waitFor(() => {
      expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
    });

    const deleteOption = screen.getByText('Delete rulebook activation');
    await user.click(deleteOption);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
      const lastCall = mockBulkAction.mock.calls.at(-1)?.[0];
      expect(lastCall.alertPrompts).toBeDefined();
      expect(lastCall.alertPrompts[0]).toContain('workers offline');
      expect(lastCall.alertPrompts[0]).toContain('Deleting');
    });
  });

  it('should call regular disable when disabling an activation without workers offline', async () => {
    const user = userEvent.setup();

    const runningActivation = {
      ...mockWorkersOfflineActivation,
      status: StatusEnum.Running,
      instances: [
        {
          ...mockWorkersOfflineActivation.instances[0],
          status: StatusEnum.Running,
        },
      ],
    };

    server.use(
      http.get(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(runningActivation);
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });

    const switchButton = screen.getByRole('switch', { name: 'Click to disable instance' });
    await user.click(switchButton);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
      const lastCall = mockBulkAction.mock.calls.at(-1)?.[0];
      expect(lastCall.alertPrompts).toBeUndefined();
    });
  });

  it('should call regular delete when deleting an activation without workers offline', async () => {
    const user = userEvent.setup();

    const runningActivation = {
      ...mockWorkersOfflineActivation,
      status: StatusEnum.Running,
      instances: [
        {
          ...mockWorkersOfflineActivation.instances[0],
          status: StatusEnum.Running,
        },
      ],
    };

    server.use(
      http.get(edaAPI`/activations/1/`, () => {
        return HttpResponse.json(runningActivation);
      })
    );

    render(
      <MemoryRouter initialEntries={['/rulebook-activations/1/details']}>
        <Routes>
          <Route path="/rulebook-activations/:id/details" element={<RulebookActivationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Demo Activation' })).toBeInTheDocument();
    });

    const kebabButton = screen.getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);
    await waitFor(() => {
      expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
    });

    const deleteOption = screen.getByText('Delete rulebook activation');
    await user.click(deleteOption);

    await waitFor(() => {
      expect(mockBulkAction).toHaveBeenCalled();
      const lastCall = mockBulkAction.mock.calls.at(-1)?.[0];
      expect(lastCall.alertPrompts).toBeUndefined();
    });
  });
});
