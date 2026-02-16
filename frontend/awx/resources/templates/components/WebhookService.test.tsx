import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WebhookService } from './WebhookService';

describe('WebhookService', () => {
  it('should render GitHub label when service is github', () => {
    render(<WebhookService service="github" />);

    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('should render GitLab label when service is gitlab', () => {
    render(<WebhookService service="gitlab" />);

    expect(screen.getByText('GitLab')).toBeInTheDocument();
  });

  it('should render Bitbucket Data Center label when service is bitbucket_dc', () => {
    render(<WebhookService service="bitbucket_dc" />);

    expect(screen.getByText('Bitbucket Data Center')).toBeInTheDocument();
  });

  it('should render nothing when service is unknown', () => {
    const { container } = render(<WebhookService service="unknown" />);

    expect(container.firstChild).toBeNull();
  });
});
