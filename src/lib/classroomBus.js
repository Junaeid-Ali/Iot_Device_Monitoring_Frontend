// classroomBus: simple pub/sub to manage simulated live metrics per classroom
// Exports: subscribe(classroomId, cb) -> unsubscribe
//          setSwitchState(classroomId, boolean)
//          getSwitchState(classroomId)

import { getDummyLiveData } from "./dummyData";

const subscribers = new Map(); // classroomId -> Set(callbacks)
const switchStates = new Map(); // classroomId -> boolean
const intervals = new Map(); // classroomId -> intervalId

function publish(classroomId, payload) {
  const subs = subscribers.get(classroomId);
  if (!subs) return;
  for (const cb of subs) cb(payload);
}

function startGenerating(classroomId) {
  // avoid duplicate
  if (intervals.has(classroomId)) return;
  // publish immediately then at interval
  const send = () => {
    const data = getDummyLiveData(classroomId);
    publish(classroomId, data);
  };
  send();
  const id = setInterval(send, 5000); // every 5 seconds
  intervals.set(classroomId, id);
}

function stopGenerating(classroomId) {
  const id = intervals.get(classroomId);
  if (id) {
    clearInterval(id);
    intervals.delete(classroomId);
  }
  // publish an OFF state payload
  publish(classroomId, { classroom: classroomId, time: new Date().toISOString(), power: 0, current: 0, voltage: 0, offline: true });
}

export function setSwitchState(classroomId, state) {
  switchStates.set(classroomId, !!state);
  if (classroomId === 1) return; // for classroom 1 backend controls it
  if (state) startGenerating(classroomId);
  else stopGenerating(classroomId);
}

export function getSwitchState(classroomId) {
  return !!switchStates.get(classroomId);
}

export function subscribe(classroomId, cb) {
  if (!subscribers.has(classroomId)) subscribers.set(classroomId, new Set());
  subscribers.get(classroomId).add(cb);
  // return unsubscribe
  const unsub = () => {
    const set = subscribers.get(classroomId);
    if (!set) return;
    set.delete(cb);
    if (set.size === 0) subscribers.delete(classroomId);
  };
  return unsub;
}

// initialize default switch states (off) for classrooms 2..30
for (let i = 2; i <= 30; i++) {
  switchStates.set(i, false);
}

export default {
  subscribe,
  setSwitchState,
  getSwitchState,
};
