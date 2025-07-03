import styled from 'styled-components';

const Wrapper = styled.div`
  border-radius: 1em;
  background-color: var(--pf-t--global--background--color--primary--default);
  font-size: 0.6rem;
  width: max-content;
  padding: 0em 1em;
  margin-left: auto;
  margin-right: -0.3em;
  color: var(--pf-t--global--text--color--regular);
`;

export function JobEventEllipsis() {
  return <Wrapper>...</Wrapper>;
}
