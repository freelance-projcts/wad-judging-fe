export type EventGender = "MALE" | "FEMALE" | "MIXED";

export type WadEvent = {
  id: string;
  name: string;
  gender: EventGender;
};

// The add drawer only collects name + gender; the id is generated.
export type EventFormValues = Omit<WadEvent, "id">;

export const EVENT_GENDER_OPTIONS: { label: string; value: EventGender }[] = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Mixed", value: "MIXED" },
];

export const eventGenderLabel = (value: EventGender) =>
  EVENT_GENDER_OPTIONS.find((o) => o.value === value)?.label ?? value;

// Generate the next `EVT-####` id from the rows already in the table.
export const nextEventId = (events: WadEvent[]) => {
  const max = events.reduce((acc, e) => {
    const n = Number(e.id.replace(/\D/g, ""));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 1000);
  return `EVT-${max + 1}`;
};

// Mock rows (replace with API results)
export const MOCK_EVENTS: WadEvent[] = [
  { id: "EVT-1001", name: "Floor Exercise", gender: "MALE" },
  { id: "EVT-1002", name: "Balance Beam", gender: "FEMALE" },
  { id: "EVT-1003", name: "Pommel Horse", gender: "MALE" },
  { id: "EVT-1004", name: "Uneven Bars", gender: "FEMALE" },
  { id: "EVT-1005", name: "Vault", gender: "MIXED" },
  { id: "EVT-1006", name: "Still Rings", gender: "MALE" },
  { id: "EVT-1007", name: "Rhythmic All-Around", gender: "FEMALE" },
  { id: "EVT-1008", name: "Trampoline Synchro", gender: "MIXED" },
];
