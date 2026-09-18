"use client";

import { Alert, App, Button, Form, Input, InputNumber, Modal, Spin, Tabs } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { listMarks, submitMarks } from "@/lib/api/marks";
import { ApiError } from "@/lib/api/client";
import {
  MARK_POSITIONS,
  ROUNDS,
  isRoundTouched,
  markEntryScore,
  markEntrySupervisor,
  roundFormToInput,
  type MarkEntry,
  type RoundFormValues,
  type Student,
  type WadEvent,
} from "./types";

type AddMarkModalProps = {
  open: boolean;
  student: Student | null;
  event: WadEvent | null;
  performanceId: string;
  /** Admins may resubmit an already-recorded round directly; judges need an approved edit request. */
  canEditSubmitted: boolean;
  onClose: () => void;
};

type FormValues = Record<string, RoundFormValues>;

const roundKey = (round: number) => `r${round}`;

export const AddMarkModal = ({
  open,
  student,
  event,
  performanceId,
  canEditSubmitted,
  onClose,
}: AddMarkModalProps) => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<FormValues>();

  const [activeRound, setActiveRound] = useState(String(ROUNDS[0]));

  const marksQuery = useQuery({
    queryKey: ["marks", performanceId, event?.id, student?.id],
    queryFn: () =>
      listMarks({ performanceId, eventId: event!.id, studentId: student!.id }),
    enabled: open && Boolean(event) && Boolean(student) && Boolean(performanceId),
  });

  const existingByRound = new Map<number, MarkEntry>(
    (marksQuery.data ?? []).map((entry) => [entry.round, entry]),
  );

  // Jump back to Round 1 whenever a fresh fetch for this student/event lands
  // (i.e. a different row was opened) — adjusted during render, not an effect.
  const [lastDataAt, setLastDataAt] = useState<number | null>(null);
  if (open && marksQuery.dataUpdatedAt !== lastDataAt) {
    setLastDataAt(marksQuery.dataUpdatedAt);
    setActiveRound(String(ROUNDS[0]));
  }

  useEffect(() => {
    if (!open) return;
    const values: FormValues = {};
    for (const round of ROUNDS) {
      const entry = existingByRound.get(round);
      const roundValues: RoundFormValues = {};
      for (const { key } of MARK_POSITIONS) {
        roundValues[key] = entry ? markEntryScore(entry, key) : null;
        roundValues[`${key}Supervisor`] = entry ? markEntrySupervisor(entry, key) : null;
      }
      values[roundKey(round)] = roundValues;
    }
    form.setFieldsValue(values);
    // existingByRound is derived fresh from marksQuery.data each render — depend on that instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, marksQuery.data, form]);

  const submitMutation = useMutation({
    mutationFn: submitMarks,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["marks", performanceId, event?.id, student?.id],
      });
      message.success("Marks saved.");
      onClose();
    },
    onError: (err) =>
      message.error(err instanceof ApiError ? err.message : "Could not save marks."),
  });

  // A round only needs to be filled in (and submitted) once the judge has
  // actually started entering it — Round 2 can stay untouched if the
  // competition hasn't reached it yet.
  const roundFieldNames = (round: number) =>
    MARK_POSITIONS.flatMap(({ key }) => [
      [roundKey(round), key],
      [roundKey(round), `${key}Supervisor`],
    ]);

  const handleFinish = (values: FormValues) => {
    const editableRounds = ROUNDS.filter(
      (round) =>
        (canEditSubmitted || !existingByRound.has(round)) &&
        isRoundTouched(values[roundKey(round)]),
    );
    if (editableRounds.length === 0) {
      message.warning("Enter marks for at least one round before saving.");
      return;
    }
    submitMutation.mutate({
      studentId: student!.id,
      eventId: event!.id,
      performanceId,
      rounds: editableRounds.map((round) =>
        roundFormToInput(round, values[roundKey(round)] ?? {}),
      ),
    });
  };

  return (
    <Modal
      title={student ? `Marks — ${student.fullName}` : "Marks"}
      open={open}
      onCancel={onClose}
      width={480}
      destroyOnHidden
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={submitMutation.isPending} onClick={form.submit}>
            Save marks
          </Button>
        </div>
      }
    >
      {event ? <p className="-mt-2 mb-4 text-sm text-slate-500">{event.name}</p> : null}

      {marksQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : marksQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load existing marks."
          description={
            marksQuery.error instanceof ApiError ? marksQuery.error.message : undefined
          }
        />
      ) : (
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
          <Tabs
            activeKey={activeRound}
            onChange={setActiveRound}
            items={ROUNDS.map((round) => {
              const locked = !canEditSubmitted && existingByRound.has(round);
              return {
                key: String(round),
                label: `Round ${round}`,
                forceRender: true,
                children: (
                  <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                    {locked ? (
                      <Alert
                        type="warning"
                        showIcon
                        message="Already submitted — use Send Edit Request to change this round."
                      />
                    ) : null}

                    {MARK_POSITIONS.map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center gap-3 rounded-xl bg-blue-50 p-3"
                      >
                        <span className="flex w-8 shrink-0 items-center justify-center self-stretch font-bold text-blue-600">
                          {label}
                        </span>
                        <Form.Item
                          name={[roundKey(round), key]}
                          dependencies={roundFieldNames(round)}
                          rules={[
                            () => ({
                              validator(_, value) {
                                if (!isRoundTouched(form.getFieldValue(roundKey(round)))) {
                                  return Promise.resolve();
                                }
                                return value === null || value === undefined
                                  ? Promise.reject(new Error("Score is required."))
                                  : Promise.resolve();
                              },
                            }),
                          ]}
                          className="mb-0 flex-1"
                        >
                          <InputNumber
                            min={0}
                            max={10}
                            step={0.1}
                            precision={2}
                            placeholder="Score"
                            style={{ width: "100%" }}
                            disabled={locked}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[roundKey(round), `${key}Supervisor`]}
                          dependencies={roundFieldNames(round)}
                          rules={[
                            () => ({
                              validator(_, value) {
                                if (!isRoundTouched(form.getFieldValue(roundKey(round)))) {
                                  return Promise.resolve();
                                }
                                return !value || !String(value).trim()
                                  ? Promise.reject(new Error("Supervisor is required."))
                                  : Promise.resolve();
                              },
                            }),
                          ]}
                          className="mb-0 flex-1"
                        >
                          <Input placeholder="Supervisor" disabled={locked} />
                        </Form.Item>
                      </div>
                    ))}
                  </div>
                ),
              };
            })}
          />
        </Form>
      )}
    </Modal>
  );
};
