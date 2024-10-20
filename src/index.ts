// types
/**
 * Event to propagate the last state
 */
type UpdateStateMessage = {
  kind: "update";
  targetId: string;
  hash: string;
  snapshot: any;
};

/**
 * Event to notify is joined to the broadcast
 */
type HiStateMessage = {
  kind: "hi";
  targetId: string;
};

type Message = MessageEvent<UpdateStateMessage | HiStateMessage>;

const INITIAL_HASH_STATE = "0";

type Listener = () => any;

class HashState<T = any> {
  private listeners = new Set<Listener>();

  constructor(
    private state: T,
    private hash: string,
  ) {}

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.state;
  getHash = () => this.hash;
  setSnapshot = (state: T, hash: string) => {
    this.state = state;
    this.hash = hash;
    this.listeners.forEach((listener) => listener());
  };
}

class Increment {
  constructor(
    private value = 0,
    private incrementOperator = (currentValue: number) => currentValue + 1,
  ) {}

  nextValue() {
    this.value = this.incrementOperator(this.value);
    return this.value;
  }
}

const idCursor = new Increment();

export function stateBroadcast<T = any>(channelName: string, initialState?: T) {
  const targetId = `${idCursor.nextValue()}`;
  const state = new HashState<T | null>(
    initialState ?? null,
    INITIAL_HASH_STATE,
  );
  const broadcastChannel = new BroadcastChannel(channelName);

  broadcastChannel.addEventListener("message", (message: Message) => {
    const data = message.data;

    if (data.kind === "hi" && state.getHash() !== INITIAL_HASH_STATE) {
      propagateSnapshot();
    }
    if (data.kind === "update" && data.hash !== state.getHash()) {
      state.setSnapshot(data.snapshot, data.hash);
    }
  });

  broadcastChannel.postMessage({
    targetId: targetId,
    kind: "hi",
  } satisfies HiStateMessage);

  const propagateSnapshot = () => {
    broadcastChannel.postMessage({
      targetId: targetId,
      hash: state.getHash(),
      kind: "update",
      snapshot: state.getSnapshot(),
    } satisfies UpdateStateMessage);
  };

  const setSnapshot = (newState: T) => {
    const newHash = crypto.randomUUID();
    state.setSnapshot(newState, newHash);
    propagateSnapshot();
  };

  return {
    targetId,
    channelName,
    broadcastChannel,
    subscribe: state.subscribe,
    getSnapshot: state.getSnapshot,
    getState: state.getSnapshot,
    setSnapshot: setSnapshot,
    setState: setSnapshot,
  } as const;
}
