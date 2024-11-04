import { isPageActionHidden } from './PageActionUtils';
import { IPageAction, PageActionSelection } from './PageAction';

describe('isPageActionHidden', () => {
  it('should be false if no selection', () => {
    const action = {};
    expect(isPageActionHidden(action as IPageAction<object>, {})).to.equal(false);
  });

  describe('PageActionSelection.None type', () => {
    it('should be false if isHidden not given', () => {
      const action = {
        selection: PageActionSelection.None,
      };
      expect(isPageActionHidden(action as IPageAction<object>, {})).to.equal(false);
    });

    it('should call isHidden if provided', () => {
      const action = {
        selection: PageActionSelection.None,
        isHidden: () => true,
      };
      cy.spy(action, 'isHidden');
      expect(isPageActionHidden(action as unknown as IPageAction<object>, {})).to.equal(true);
      expect(action.isHidden).to.be.calledOnce;
    });
  });

  describe('PageActionSelection.Single type', () => {
    it('should be false if isHidden not given', () => {
      const action = {
        selection: PageActionSelection.Single,
      };
      expect(isPageActionHidden(action as IPageAction<object>, {})).to.equal(false);
    });

    it('should call isHidden if provided', () => {
      const action = {
        selection: PageActionSelection.Single,
        isHidden: () => true,
      };
      cy.spy(action, 'isHidden');
      expect(isPageActionHidden(action as unknown as IPageAction<object>, {})).to.equal(true);
      expect(action.isHidden).to.be.calledOnce;
    });

    it('should return true if no item selected', () => {
      const action = {
        selection: PageActionSelection.Single,
        isHidden: () => false,
      };
      expect(isPageActionHidden(action as unknown as IPageAction<object>, undefined)).to.equal(
        true
      );
    });
  });
});
