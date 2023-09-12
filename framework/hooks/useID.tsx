export function useID(props: { id?: string; label?: string; name?: string }) {
  if (props.id) {
    return props.id;
  }
  if (props.name) {
    return props.name.toLowerCase().split('.').join('-');
  }
  if (props.label) {
    return props.label.toLowerCase().split(' ').join('-');
  }
  return undefined;
}
