import Anser from 'anser';

export function Ansi(props: { input: string }) {
  const data = Anser.ansiToJson(props.input, ansiOptions);
  return (
    <>
      {data.map((entry, index) => {
        const className = entry.fg ? `${entry.fg}-fg` : undefined;
        return (
          <span key={index} className={className}>
            {entry.content}
          </span>
        );
      })}
    </>
  );
}
const ansiOptions = {
  json: true,
  remove_empty: true,
  use_classes: true,
};
