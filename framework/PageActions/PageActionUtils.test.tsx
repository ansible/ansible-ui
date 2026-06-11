import { describe, expect, it, vi } from 'vitest';
import { IPageAction, PageActionSelection } from './PageAction';
import { isPageActionHidden } from './PageActionUtils';

describe('isPageActionHidden', () => {
  it('should be false if no selection', () => {
    const action = {};
    expect(isPageActionHidden(action as IPageAction<object>, {})).toBe(false);
  });

  describe('PageActionSelection.None type', () => {
    it('should be false if isHidden not given', () => {
      const action = {
        selection: PageActionSelection.None,
      };
      expect(isPageActionHidden(action as IPageAction<object>, {})).toBe(false);
    });

    it('should call isHidden if provided', () => {
      const isHiddenSpy = vi.fn().mockReturnValue(true);
      const action = {
        selection: PageActionSelection.None,
        isHidden: isHiddenSpy,
      };
      expect(isPageActionHidden(action as unknown as IPageAction<object>, {})).toBe(true);
      expect(isHiddenSpy).toHaveBeenCalledOnce();
    });
  });

  describe('PageActionSelection.Single type', () => {
    it('should be false if isHidden not given', () => {
      const action = {
        selection: PageActionSelection.Single,
      };
      expect(isPageActionHidden(action as IPageAction<object>, {})).toBe(false);
    });

    it('should call isHidden if provided', () => {
      const isHiddenSpy = vi.fn().mockReturnValue(true);
      const action = {
        selection: PageActionSelection.Single,
        isHidden: isHiddenSpy,
      };
      expect(isPageActionHidden(action as unknown as IPageAction<object>, {})).toBe(true);
      expect(isHiddenSpy).toHaveBeenCalledOnce();
    });

    it('should return true if no item selected', () => {
      const action = {
        selection: PageActionSelection.Single,
        isHidden: () => false,
      };
      expect(isPageActionHidden(action as unknown as IPageAction<object>, undefined)).toBe(true);
    });
  });
});
