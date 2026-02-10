import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LabelsCell } from './LabelsCell';

describe('LabelsCell', () => {
  describe('with string labels', () => {
    it('should render labels', () => {
      render(<LabelsCell labels={['label1', 'label2', 'label3']} />);

      expect(screen.getByText('label1')).toBeInTheDocument();
      expect(screen.getByText('label2')).toBeInTheDocument();
      expect(screen.getByText('label3')).toBeInTheDocument();
    });

    it('should render LabelGroup for empty array', () => {
      const { container } = render(<LabelsCell labels={[]} />);
      // Component renders without errors
      expect(container).toBeInTheDocument();
    });

    it('should limit displayed labels with numLabels', () => {
      render(<LabelsCell labels={['a', 'b', 'c', 'd', 'e']} numLabels={2} />);

      expect(screen.getByText('a')).toBeInTheDocument();
      expect(screen.getByText('b')).toBeInTheDocument();
    });

    it('should render with noWrap prop', () => {
      render(<LabelsCell labels={['label1']} noWrap />);
      expect(screen.getByText('label1')).toBeInTheDocument();
    });
  });

  describe('with labelsWithLinks', () => {
    const labelsWithLinks = [
      { name: 'Link1', link: '/path1' },
      { name: 'Link2', link: '/path2' },
    ];

    it('should render labels with links', () => {
      render(
        <MemoryRouter>
          <LabelsCell labelsWithLinks={labelsWithLinks} />
        </MemoryRouter>
      );

      expect(screen.getByText('Link1')).toBeInTheDocument();
      expect(screen.getByText('Link2')).toBeInTheDocument();
    });

    it('should render links with correct hrefs', () => {
      render(
        <MemoryRouter>
          <LabelsCell labelsWithLinks={labelsWithLinks} />
        </MemoryRouter>
      );

      const link1 = screen.getByText('Link1').closest('a');
      const link2 = screen.getByText('Link2').closest('a');

      expect(link1).toHaveAttribute('href', '/path1');
      expect(link2).toHaveAttribute('href', '/path2');
    });

    it('should render clickable labels for links', () => {
      render(
        <MemoryRouter>
          <LabelsCell labelsWithLinks={labelsWithLinks} />
        </MemoryRouter>
      );

      // Labels with links should be rendered as links
      const link = screen.getByText('Link1').closest('a');
      expect(link).toBeInTheDocument();
    });
  });
});
