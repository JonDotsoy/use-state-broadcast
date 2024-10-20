import { expect, it } from "bun:test";
import { stateBroadcast } from ".";

it("should sync state across multiple instances", async () => {
  const state1 = stateBroadcast("test1");
  const state2 = stateBroadcast("test1");
  const state3 = stateBroadcast("test1");

  state1.subscribe(() => {
    console.log("state1", state1.getSnapshot());
  });

  await new Promise((r) => setTimeout(r, 100));
  state1.setSnapshot("hello");
  await new Promise((r) => setTimeout(r, 100));
  state2.setSnapshot("hello world");
  await new Promise((r) => setTimeout(r, 100));

  expect(state1.getSnapshot()).toBe("hello world");
  expect(state2.getSnapshot()).toBe("hello world");
  expect(state3.getSnapshot()).toBe("hello world");
});

it("should work with useSyncExternalStore", async () => {
  const useSyncExternalStore = <T>(
    subscribe: (listener: () => any) => () => void,
    getSnapshot: () => T,
  ) => {
    let state = getSnapshot();
    subscribe(() => {
      state = getSnapshot();
    });
    return {
      state() {
        return state;
      },
    };
  };

  const state1 = stateBroadcast("test1");
  const state2 = stateBroadcast("test1");
  const state3 = stateBroadcast("test1");

  const aliasState1 = useSyncExternalStore(
    state1.subscribe,
    state1.getSnapshot,
  );
  const aliasState2 = useSyncExternalStore(
    state2.subscribe,
    state2.getSnapshot,
  );
  const aliasState3 = useSyncExternalStore(
    state3.subscribe,
    state3.getSnapshot,
  );

  await new Promise((r) => setTimeout(r, 100));
  state1.setSnapshot("hello");
  await new Promise((r) => setTimeout(r, 100));
  state2.setSnapshot("hello world");
  await new Promise((r) => setTimeout(r, 100));

  expect(aliasState1.state()).toBe("hello world");
  expect(aliasState2.state()).toBe("hello world");
  expect(aliasState3.state()).toBe("hello world");
});
