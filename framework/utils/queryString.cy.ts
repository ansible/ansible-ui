import {
  DateRangeFilterPresets,
  IFilterState,
  IToolbarFilter,
  ToolbarFilterType,
  IView,
} from '@ansible/ansible-ui-framework';
import { paramsToSearchObj, filtersToSearchObj, buildQueryString } from './queryString';
import { PageAsyncSelectOptionsFn } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';

describe('queryString', () => {
  describe('paramsToSearchObj', () => {
    it('should return URLSearchParams', () => {
      expect(paramsToSearchObj({})).instanceOf(URLSearchParams);
    });

    it('should add params to string', () => {
      const params = {
        page: '3',
        page_size: '10',
      };
      expect(paramsToSearchObj(params).toString()).to.equal('page=3&page_size=10');
    });

    it('should expand arrays into repeated params', () => {
      const params = {
        page: '3',
        name: ['alpha', 'beta'],
      };
      expect(paramsToSearchObj(params).toString()).to.equal('page=3&name=alpha&name=beta');
    });
  });

  describe('filtersToSearchObj', () => {
    const nameFilter: IToolbarFilter = {
      type: ToolbarFilterType.SingleText,
      comparison: 'contains',
      key: 'name',
      label: 'Name',
      query: 'name',
    };
    const descriptionFilter: IToolbarFilter = {
      type: ToolbarFilterType.SingleText,
      comparison: 'contains',
      key: 'description',
      label: 'Description',
      query: 'description',
    };
    const searchFilter: IToolbarFilter = {
      key: 'keyword',
      label: 'Keyword',
      type: ToolbarFilterType.SingleText,
      query: 'search',
      comparison: 'contains',
    };
    const labelsFilter: IToolbarFilter = {
      type: ToolbarFilterType.AsyncMultiSelect,
      key: 'labels',
      label: 'Labels',
      query: 'labels__name',
      placeholder: 'Select labels',
      queryOptions: (() => {}) as unknown as PageAsyncSelectOptionsFn<string>,
      queryLabel: (l) => l,
      useAndOperator: true,
    };
    const dateRangeFilter: IToolbarFilter = {
      type: ToolbarFilterType.DateRange,
      key: 'range',
      label: 'Date Range',
      options: [],
      query: 'range',
    };
    const ONE_HOUR = 60 * 60 * 1000;

    it('should return URLSearchParams', () => {
      expect(filtersToSearchObj([nameFilter], {})).instanceOf(URLSearchParams);
    });

    it('should build simple string', () => {
      const filters = [nameFilter];
      const state: IFilterState = {
        name: ['template'],
      };

      expect(filtersToSearchObj(filters, state).toString()).to.equal('name=template');
    });

    it('should only add filters set in filterState', () => {
      const filters = [nameFilter, descriptionFilter];
      const state: IFilterState = {
        name: ['template'],
      };

      expect(filtersToSearchObj(filters, state).toString()).to.equal('name=template');
    });

    it('should include search filter', () => {
      const filters = [nameFilter, searchFilter];
      const state: IFilterState = {
        keyword: ['foo', 'bar'],
      };

      expect(filtersToSearchObj(filters, state).toString()).to.equal('search=foo&search=bar');
    });

    it('should support multiple values', () => {
      const filters = [nameFilter, descriptionFilter];
      const state: IFilterState = {
        name: ['foo', 'bar', 'baz'],
        description: ['one'],
      };

      expect(filtersToSearchObj(filters, state).toString()).to.equal(
        'or__name=foo&or__name=bar&or__name=baz&description=one'
      );
    });

    it('should support label filters', () => {
      const filters = [labelsFilter];
      const state: IFilterState = {
        labels: ['one', 'two'],
      };

      expect(filtersToSearchObj(filters, state).toString()).to.equal(
        'chain__labels__name=one&chain__labels__name=two'
      );
    });

    it('should support date range LastHour', () => {
      const filters = [dateRangeFilter];
      const state: IFilterState = {
        range: [DateRangeFilterPresets.LastHour],
      };
      const start = new Date(getNow().getTime() - ONE_HOUR);

      expect(filtersToSearchObj(filters, state).toString()).to.equal(
        `range__gte=${encodeURIComponent(start.toISOString())}`
      );
    });

    it('should support date range Last24Hours', () => {
      const filters = [dateRangeFilter];
      const state: IFilterState = {
        range: [DateRangeFilterPresets.Last24Hours],
      };
      const start = new Date(getNow().getTime() - 24 * ONE_HOUR);

      expect(filtersToSearchObj(filters, state).toString()).to.equal(
        `range__gte=${encodeURIComponent(start.toISOString())}`
      );
    });

    it('should support date range LastWeek', () => {
      const filters = [dateRangeFilter];
      const state: IFilterState = {
        range: [DateRangeFilterPresets.LastWeek],
      };
      const start = new Date(getNow().getTime() - 7 * 24 * ONE_HOUR);

      expect(filtersToSearchObj(filters, state).toString()).to.equal(
        `range__gte=${encodeURIComponent(start.toISOString())}`
      );
    });

    it('should support date range LastMonth', () => {
      const filters = [dateRangeFilter];
      const state: IFilterState = {
        range: [DateRangeFilterPresets.LastMonth],
      };
      const start = new Date(getNow().getTime() - 30 * 24 * ONE_HOUR);

      expect(filtersToSearchObj(filters, state).toString()).to.equal(
        `range__gte=${encodeURIComponent(start.toISOString())}`
      );
    });

    it('should support special behavior for activity stream', () => {
      const filter: IToolbarFilter = {
        type: ToolbarFilterType.SingleText,
        comparison: 'contains',
        key: 'name',
        label: 'Name',
        query: 'object1__in',
      };
      const state: IFilterState = {
        name: ['foo+bar'],
      };

      expect(filtersToSearchObj([filter], state).toString()).to.equal(
        'or__object1__in=foo%2Cbar&or__object2__in=foo%2Cbar'
      );
    });

    it('should url encode string', () => {
      const filters = [nameFilter];
      const state: IFilterState = {
        name: ['template & stuff'],
      };

      // note URLQueryParams encodes the space character as `+` not '%20'
      // (see https://dev.devbf.com/posts/when-to-use-or-20-for-spaces-in-urls-2d9fa/)
      expect(filtersToSearchObj(filters, state).toString()).to.equal('name=template+%26+stuff');
    });
  });

  describe('buildQueryString', () => {
    const nameFilter: IToolbarFilter = {
      type: ToolbarFilterType.SingleText,
      comparison: 'contains',
      key: 'name',
      label: 'Name',
      query: 'name',
    };

    it('should assemble full query string', () => {
      const qs = buildQueryString(
        {
          page: 1,
          perPage: 10,
          sort: 'name',
          sortDirection: 'asc',
          filterState: {
            name: ['template'],
          },
        } as unknown as IView,
        [nameFilter],
        { description: 'foo' }
      );

      expect(qs).to.equal('?description=foo&name=template&order_by=name&page=1&page_size=10');
    });

    it('should ignore empty queryParams', () => {
      const qs = buildQueryString(
        {
          page: 1,
          perPage: 10,
          sort: 'name',
          sortDirection: 'asc',
          filterState: {
            name: ['template'],
          },
        } as unknown as IView,
        [nameFilter],
        {}
      );

      expect(qs).to.equal('?name=template&order_by=name&page=1&page_size=10');
    });

    it('should ignore empty filters', () => {
      const qs = buildQueryString(
        {
          page: 1,
          perPage: 10,
          sort: 'name',
          sortDirection: 'asc',
          filterState: {
            name: ['template'],
          },
        } as unknown as IView,
        [],
        { description: 'foo' }
      );

      expect(qs).to.equal('?description=foo&order_by=name&page=1&page_size=10');
    });

    it('should assemble pagination data with empty filters and queryParams', () => {
      const qs = buildQueryString(
        {
          page: 1,
          perPage: 10,
          sort: 'name',
          sortDirection: 'asc',
          filterState: {
            name: ['template'],
          },
        } as unknown as IView,
        [],
        {}
      );

      expect(qs).to.equal('?order_by=name&page=1&page_size=10');
    });
  });
});

function getNow() {
  const now = new Date(Date.now());
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
}
