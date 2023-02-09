import Anser from 'anser';

export function Ansi(props: { input: string }) {
  const data = Anser.ansiToJson(props.input, ansiOptions);
  return (
    <>
      {data.map((entry, index) => {
        let className = undefined;
        if (entry.fg) className = `${entry.fg}-fg`;
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
