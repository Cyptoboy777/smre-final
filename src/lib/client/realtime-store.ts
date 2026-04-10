type Listener<T> = (value: T) => void;

export function createRealtimeStore<T>(initialValue: T) {
  let currentValue = initialValue;
  const listeners = new Set<Listener<T>>();

  return {
    getSnapshot: () => currentValue,
    publish: (value: T) => {
      currentValue = value;
      listeners.forEach((listener) => listener(currentValue));
    },
    subscribe: (listener: Listener<T>) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
