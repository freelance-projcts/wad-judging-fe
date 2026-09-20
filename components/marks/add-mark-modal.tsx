"use client";

import { Alert, App, Button, Form, Input, InputNumber, Modal, Spin, Tabs } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { listMarks, submitMarks } from "@/lib/api/marks";
import { listEditRequests } from "@/lib/api/edit-requests";
import { ApiError } from "@/lib/api/client";
import { TINTS } from "@/constants/brand";
import {
  MARK_POSITIONS,
  eventRounds,
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

  const rounds = eventRounds(event);
  const [activeRound, setActiveRound] = useState(String(rounds[0]));

  const marksQuery = useQuery({
    queryKey: ["marks", performanceId, event?.id, student?.id],
    queryFn: () =>
      listMarks({ performanceId, eventId: event!.id, studentId: student!.id }),
    enabled: open && Boolean(event) && Boolean(student) && Boolean(performanceId),
  });

  const existingByRound = new Map<number, MarkEntry>(
    (marksQuery.data ?? []).map((entry) => [entry.round, entry]),
  );

  // A judge can only resubmit an already-recorded round once an admin has
  // approved their edit request for that exact mark entry - fetched fresh
  // whenever the modal opens so a just-approved request is picked up.
  // GET /edit-requests already scopes non-admins to their own requests.
  const editRequestsQuery = useQuery({
    queryKey: ["edit-requests"],
    queryFn: listEditRequests,
    enabled: open && !canEditSubmitted,
  });
  const approvedMarkEntryIds = new Set(
    (editRequestsQuery.data ?? [])
      .filter((r) => r.status === "APPROVED")
      .map((r) => r.markEntryId),
  );
  const isRoundEditable = (round: number) => {
    const entry = existingByRound.get(round);
    return canEditSubmitted || !entry || approvedMarkEntryIds.has(entry.id);
  };

  // Jump back to Round 1 whenever a fresh fetch for this student/event lands
  // (i.e. a different row was opened) — adjusted during render, not an effect.
  const [lastDataAt, setLastDataAt] = useState<number | null>(null);
  if (open && marksQuery.dataUpdatedAt !== lastDataAt) {
    setLastDataAt(marksQuery.dataUpdatedAt);
    setActiveRound(String(rounds[0]));
  }

  useEffect(() => {
    if (!open) return;
    const values: FormValues = {};
    for (const round of rounds) {
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
      // A used approval is deleted server-side (consumed) - refetch so this
      // round shows locked again instead of staying editable from stale data.
      queryClient.invalidateQueries({ queryKey: ["edit-requests"] });
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
    const editableRounds = rounds.filter(
      (round) => isRoundEditable(round) && isRoundTouched(values[roundKey(round)]),
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

  // Every round's fields live in one Form, so a validation error on a round
  // the user isn't currently looking at would otherwise fail silently -
  // jump to it and say so instead of leaving "Save marks" appear to do nothing.
  const handleFinishFailed: ({
    errorFields,
  }: {
    errorFields: { name: (string | number)[] }[];
  }) => void = ({ errorFields }) => {
    const firstErrorRound = errorFields[0]?.name[0];
    if (typeof firstErrorRound === "string" && firstErrorRound !== roundKey(Number(activeRound))) {
      const round = rounds.find((r) => roundKey(r) === firstErrorRound);
      if (round !== undefined) setActiveRound(String(round));
    }
    message.error("Please fix the highlighted fields before saving.");
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
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleFinish}
          onFinishFailed={handleFinishFailed}
        >
          <Tabs
            activeKey={activeRound}
            onChange={setActiveRound}
            items={rounds.map((round) => {
              const entry = existingByRound.get(round);
              const locked = !isRoundEditable(round);
              const unlockedByApproval =
                !canEditSubmitted && Boolean(entry) && approvedMarkEntryIds.has(entry!.id);
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
                    ) : unlockedByApproval ? (
                      <Alert
                        type="info"
                        showIcon
                        message="Edit request approved — update the scores and save."
                      />
                    ) : null}

                    {MARK_POSITIONS.map(({ key, label }, index) => {
                      const tint = TINTS[index % TINTS.length];
                      return (
                      <div
                        key={key}
                        className="flex items-center gap-3 rounded-xl p-3"
                        style={{ backgroundColor: tint.bg }}
                      >
                        <span
                          className="flex w-8 mb-6! shrink-0 items-center justify-center self-stretch font-bold"
                          style={{ color: tint.color }}
                        >
                          {label}
                        </span>
                        <div className="min-w-0 flex-1">
                          <Form.Item
                            name={[roundKey(round), key]}
                            dependencies={roundFieldNames(round)}
                            rules={[
                              () => ({
                                validator(_, value) {
                                  // A locked round's fields are prefilled from a
                                  // pre-existing entry the user can't edit here -
                                  // never block the form on data outside their
                                  // control (see: a locked round always looks
                                  // "touched" from its real scores, but its
                                  // supervisor was never stored by the backend).
                                  if (locked || !isRoundTouched(form.getFieldValue(roundKey(round)))) {
                                    return Promise.resolve();
                                  }
                                  return value === null || value === undefined
                                    ? Promise.reject(new Error("Score is required."))
                                    : Promise.resolve();
                                },
                              }),
                            ]}
                            className="mb-0"
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
                        </div>
                        <div className="min-w-0 flex-1">
                          <Form.Item
                            name={[roundKey(round), `${key}Supervisor`]}
                            dependencies={roundFieldNames(round)}
                            rules={[
                              () => ({
                                validator(_, value) {
                                  if (locked || !isRoundTouched(form.getFieldValue(roundKey(round)))) {
                                    return Promise.resolve();
                                  }
                                  return !value || !String(value).trim()
                                    ? Promise.reject(new Error("Supervisor is required."))
                                    : Promise.resolve();
                                },
                              }),
                            ]}
                            className="mb-0"
                          >
                            <Input placeholder="Supervisor" disabled={locked} />
                          </Form.Item>
                        </div>
                      </div>
                      );
                    })}
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
