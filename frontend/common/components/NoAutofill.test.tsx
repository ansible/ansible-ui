import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NoAutofillDiv } from './NoAutofill';

describe('NoAutofillDiv', () => {
  it('should render hidden decoy inputs', () => {
    const { container } = render(<NoAutofillDiv />);
    expect(container.querySelector('#no_name')).toBeInTheDocument();
    expect(container.querySelector('#no_pwd')).toBeInTheDocument();
  });
});
