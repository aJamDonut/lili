export interface ReactiveProps {
  handler: () => void;
  deep: boolean;
  immediate: boolean;
}

type ReactivePropsOnChange = () => void;

/**
 * Run the onchange function (with correct this context) when props change.
 * @param onChange the callback to run when props change
 * @param deep whether to look deeply into objects for changes
 * @param immediate whether to trigger the handler immediately or not
 * @returns ReactivePropsHandler
 */
export function reactiveProps(onChange: ReactivePropsOnChange, deep: boolean = true, immediate: boolean = true): ReactiveProps {
  return {
    handler() {
      onChange.call(this);
    },
    deep,
    immediate,
  };
}
