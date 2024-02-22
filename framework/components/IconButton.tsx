import styled from 'styled-components';

/**
 * A styled button component that represents an icon button.
 *
 * @component
 * @example
 * ```tsx
 * import { IconButton } from './IconButton';
 *
 * function App() {
 *   return (
 *     <IconButton onClick={() => console.log('Button clicked')} type='button'>
 *       <Icon size="md">
 *         <DownloadIcon />
 *       </Icon>
 *     </IconButton>
 *   );
 * }
 * ```
 */
export const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  &:hover {
    opacity: 1;
  }
`;
