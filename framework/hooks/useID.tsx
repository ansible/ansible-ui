import { useId } from 'react';

export function useID(props: { id?: string; label?: string; name?: string }) {
  const generatedId = useId();
  return getID(props) || generatedId;
}

export function getID(
  props: { id?: string; label?: string; name?: string; title?: string } | string
) {
  if (typeof props === 'string') {
    return props.toLowerCase().replace(/ /g, '-').replace(/_/g, '-').replace(/\./g, '-');
  }

  if (props.id) {
    return props.id;
  }

  if (props.name) {
    return props.name.toLowerCase().replace(/ /g, '-').replace(/_/g, '-').replace(/\./g, '-');
  }

  if (props.title) {
    return props.title.toLowerCase().replace(/ /g, '-').replace(/_/g, '-').replace(/\./g, '-');
  }

  if (props.label) {
    return props.label.toLowerCase().replace(/ /g, '-').replace(/_/g, '-').replace(/\./g, '-');
  }
}
