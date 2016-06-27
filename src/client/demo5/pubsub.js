const LISTENNERS = {};

export function subscribe(event, handler) {
  LISTENNERS[event] = handler;
}

export function dispatch(event, data) {
  if (LISTENNERS[event]) {
    LISTENNERS[event](data);
  }
}
