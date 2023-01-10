import { CommonSidebar } from '../../common/CommonSidebar';

export function AutomationServersSidebar(props: {
  isNavOpen: boolean;
  setNavOpen: (open: boolean) => void;
}) {
  const { isNavOpen, setNavOpen } = props;
  return <CommonSidebar isNavOpen={isNavOpen} setNavOpen={setNavOpen} />;
}
