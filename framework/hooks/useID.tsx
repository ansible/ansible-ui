export function useID(props: { id?: string; label?: string; name?: string }) {
  return getID(props);
}

export function getID(props: { id?: string; label?: string; name?: string } | string) {
  if (typeof props === 'string') {
    return props.toLowerCase().replace(/ /g, '-').replace(/_/g, '-').replace(/\./g, '-');
  }
  if (props.id) {
    return props.id;
  }
  if (props.name) {
    return props.name.toLowerCase().replace(/ /g, '-').replace(/_/g, '-').replace(/\./g, '-');
  }
  if (props.label) {
    return props.label.toLowerCase().replace(/ /g, '-').replace(/_/g, '-').replace(/\./g, '-');
  }
  return undefined;
}
