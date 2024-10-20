# state-broadcast

> State that lives in Broadcast channel. Keep the state between tabs.

`state-broadcast` is a lightweight JavaScript library that simplifies state management across browser tabs. It leverages the BroadcastChannel API to provide a seamless way to keep your application state synchronized in different tabs.

This is particularly useful for scenarios where you need to reflect changes made in one tab instantly in all other open tabs, such as:

- **Real-time updates:** Displaying notifications, messages, or data updates across multiple tabs.
- **User settings synchronization:** Keeping user preferences consistent across different instances of your application.
- **Collaborative features:** Enabling real-time collaboration on shared data or documents.

## Install

```shell
npm install state-broadcast
```

## Usage

Here's a basic example demonstrating how to use `state-broadcast`:

```ts
import { stateBroadcast } from "state-broadcast";

// Create a new broadcast state with an initial value
const counterState = stateBroadcast("my-state", 0);

// Subscribe to state changes
counterState.subscribe(() => {
  console.log("Counter updated:", newValue);
});

counterState.setState(counterState.getSnapshot() + 1);
```

### React Integration

`state-broadcast` can be easily integrated with React applications using the `useSyncExternalStore` hook:

```tsx
import { stateBroadcast } from "state-broadcast";
import { useSyncExternalStore } from "react";

const counterState = stateBroadcast("counter", 0);

export default function Counter() {
  const count = useSyncExternalStore(
    counterState.subscribe,
    counterState.getSnapshot,
  );

  const increment = () => counterState.setState(count + 1);

  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

> HTML demo [react-counter.html](./samples/react-counter.html)

## API

### stateBroadcast

Creates a new broadcast state.

**Syntax**

```ts
stateBroadcast(channelName[, initialState])
```

**Parameters**

- `channelName` `<string>`: The name of the channel.
- `initialState` **Optional** `<any>`: The initial state.

**Sample**

```ts
const state = stateBroadcast("my-state");

state.subscribe(() => {
  console.log("updated state:", state.getSnapshot());
});
```

### StateBroadcast: subscribe() method

**Syntax**

```ts
subscribe(callback);
```

**Parameters**

- `callback` `<function>`: The callback function to be called when the state changes.

**Return Value**

- `void`: No return value.

**Sample**

```ts
const state = stateBroadcast("my-state");

state.subscribe(() => {
  console.log("updated state:", state.getSnapshot());
});
```

### StateBroadcast: getSnapshot() method

> Alias `getState`

**Syntax**

```ts
getSnapshot();
```

**Return Value**

- `any`: The current state.

**Sample**

```ts
const state = stateBroadcast("my-state");

// Long time

console.log(state.getSnapshot()); // { "say": "hello" }
```

### StateBroadcast: setSnapshot() method

> Alias `setState`

**Syntax**

```ts
setSnapshot(newState);
```

**Parameters**

- `newState` `<any>`: The new state to be set.

**Return Value**

- `void`: No return value.

**Sample**

```ts
const state = stateBroadcast("my-state");

state.setSnapshot({ say: "hello" });
```
