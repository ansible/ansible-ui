import Anser from 'anser';
import './Ansi.css';

/** Ansi displays input with ansi colors using patternfly theme colors */
export function Ansi(props: { input: string }) {
  const data = Anser.ansiToJson(props.input, ansiOptions);
  return (
    <>
      {data.map((entry, index) => (
        <span key={index} className={entry.fg ? `${entry.fg}-fg` : undefined}>
          {entry.content}
        </span>
      ))}
    </>
  );
}

const ansiOptions = { json: true, remove_empty: true, use_classes: true };
