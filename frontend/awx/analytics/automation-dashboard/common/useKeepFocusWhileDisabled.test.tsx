import { render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useKeepFocusWhileDisabled } from './useKeepFocusWhileDisabled';

/** Renders the control and the fallback the hook moves the focus between. */
function renderControls() {
  render(
    <>
      <button type="button" id="control">
        Control
      </button>
      <button type="button" id="fallback">
        Fallback
      </button>
      <button type="button" id="other">
        Other
      </button>
    </>
  );
  const get = (id: string) => document.getElementById(id)!;
  return { control: get('control'), fallback: get('fallback'), other: get('other') };
}

function renderFocusHook() {
  return renderHook(
    ({ isDisabled }: { isDisabled: boolean }) =>
      useKeepFocusWhileDisabled(isDisabled, 'control', 'fallback'),
    { initialProps: { isDisabled: false } }
  );
}

describe('useKeepFocusWhileDisabled', () => {
  afterEach(() => document.body.replaceChildren());

  it('moves the focus of the disabled control to the fallback and back afterwards', () => {
    const { control, fallback } = renderControls();
    const { rerender } = renderFocusHook();
    control.focus();

    rerender({ isDisabled: true });
    expect(fallback).toHaveFocus();

    rerender({ isDisabled: false });
    expect(control).toHaveFocus();
  });

  it('does not move the focus when the control does not have it', () => {
    const { other } = renderControls();
    const { rerender } = renderFocusHook();
    other.focus();

    rerender({ isDisabled: true });
    rerender({ isDisabled: false });

    expect(other).toHaveFocus();
  });

  it('does not take the focus back when it moved on from the fallback', () => {
    const { control, other } = renderControls();
    const { rerender } = renderFocusHook();
    control.focus();
    rerender({ isDisabled: true });

    other.focus();
    rerender({ isDisabled: false });

    expect(other).toHaveFocus();
  });
});
