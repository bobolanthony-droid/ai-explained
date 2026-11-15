import { CheckIcon } from './icons';

/**
 * A group of pill-shaped radio buttons inside a card.
 * Real radios underneath, so keyboard and screen readers just work.
 * `value` may be undefined: nothing chosen yet.
 */
export function Choice<T extends string>(props: {
  legend: string;
  name: string;
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="card mt-5">
      <legend className="float-left mb-3 w-full text-lg font-extrabold">{props.legend}</legend>
      <div className="clear-both flex flex-wrap gap-2">
        {props.options.map((o) => {
          const checked = o.value === props.value;
          return (
            <label key={o.value} className="relative cursor-pointer">
              <input
                type="radio"
                className="peer sr-only"
                name={props.name}
                checked={checked}
                onChange={() => props.onChange(o.value)}
              />
              {/* Selected = filled AND a tick (not colour alone). */}
              <span
                className={`flex min-h-11 items-center gap-1 rounded-full border px-4 font-bold peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 ${
                  checked ? 'bg-primary text-primary-ink border-primary' : 'border-line-strong'
                }`}
              >
                {checked && <CheckIcon />}
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
