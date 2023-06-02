/** Common Toolbar Filter Properties */
export interface ToolbarFilterCommon {
  /** The key is use to uniquly identify the filter.
   * It is used to track state of the filter and to store the filter value in the browser querystring. */
  key: string;

  /** The label to show for the filter. */
  label: string;

  /** Indicated if the filter should be pinned outside of the filter select. */
  isPinned?: boolean;

  /** Query used by the useView hook to perform the filtering. */
  query: string;

  /** The placeholder for the filter. */
  placeholder?: string;
}
