import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ConfirmDeletePanel from "@/components/ui/confirm-delete-panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "@/hooks/use-tasks";
import { useTaskComments } from "@/hooks/use-task-comments";
import { useCalendarConnection } from "@/hooks/use-calendar-connection";
import { useTranslation } from "@/hooks/use-translation";

export interface TaskFormValues extends TaskInput {
  status?: TaskStatus;
}

interface TaskFormModalProps {
  initial: Task | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const toDateInputValue = (value: string | null) => (value ? value.slice(0, 10) : "");

function TaskFormModal({ initial, onClose, onSubmit, onDelete }: TaskFormModalProps) {
  const { t } = useTranslation();
  const { status: calendarStatus } = useCalendarConnection();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startDate, setStartDate] = useState(toDateInputValue(initial?.startDate ?? null));
  const [dueDate, setDueDate] = useState(toDateInputValue(initial?.dueDate ?? null));
  const [priority, setPriority] = useState<TaskPriority | "none">(initial?.priority ?? "none");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "TODO");
  const [syncToCalendar, setSyncToCalendar] = useState(initial?.syncToCalendar ?? false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEdit = initial !== null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError(true);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        priority: priority === "none" ? null : priority,
        syncToCalendar,
        ...(isEdit ? { status } : {}),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    setShowDeleteConfirm(true);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] md:max-w-[700px] rounded-2xl bg-zinc-900/70 p-5 text-white ring-1 ring-white/15 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-white/90">
          {isEdit ? t("kanban.form.edit_title") : t("kanban.form.create_title")}
        </h2>

        <div className={`grid gap-5 ${isEdit ? "md:grid-cols-[1fr_280px]" : ""}`}>
          {showDeleteConfirm ? (
            <ConfirmDeletePanel
              message={t("kanban.form.delete_confirm")}
              onConfirm={async () => {
                if (onDelete) await onDelete();
              }}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-title" className="text-white/70">
                {t("kanban.form.title_label")}
              </Label>
              <Input
                id="task-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (error) setError(false);
                }}
                placeholder={t("kanban.form.title_placeholder")}
                aria-invalid={error}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                autoFocus
              />
              {error && <p className="text-xs text-red-400">{t("kanban.form.title_required")}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-description" className="text-white/70">
                {t("kanban.form.description_label")}
              </Label>
              <Textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("kanban.form.description_placeholder")}
                className="min-h-20 border-white/15 bg-white/5 text-white placeholder:text-white/30"
              />
            </div>

            <div className={`grid gap-3 ${isEdit ? "grid-cols-3" : "grid-cols-2"}`}>
              <div className="space-y-1.5">
                <Label htmlFor="task-start-date" className="text-white/70">
                  {t("kanban.form.start_date_label")}
                </Label>
                <Input
                  id="task-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="border-white/15 bg-white/5 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-due-date" className="text-white/70">
                  {t("kanban.form.due_date_label")}
                </Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="border-white/15 bg-white/5 text-white"
                />
              </div>
              {isEdit && (
                <div className="space-y-1.5">
                  <Label className="text-white/70">{t("kanban.form.status_label")}</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                    <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-zinc-900 text-white">
                      <SelectItem value="TODO">{t("kanban.form.status_todo")}</SelectItem>
                      <SelectItem value="DOING">{t("kanban.form.status_doing")}</SelectItem>
                      <SelectItem value="DONE">{t("kanban.form.status_done")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70">{t("kanban.form.priority_label")}</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority | "none")}>
                <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900 text-white">
                  <SelectItem value="none">{t("kanban.form.priority_none")}</SelectItem>
                  <SelectItem value="Low">{t("kanban.form.priority_low")}</SelectItem>
                  <SelectItem value="Medium">{t("kanban.form.priority_medium")}</SelectItem>
                  <SelectItem value="High">{t("kanban.form.priority_high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              onClick={() => {
                if (calendarStatus.connected) setSyncToCalendar((value) => !value);
              }}
              className={`flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3 ${
                calendarStatus.connected ? "cursor-pointer hover:bg-white/[0.08]" : ""
              }`}
            >
              <div className="space-y-0.5">
                <Label className="text-white/80">{t("kanban.form.sync_calendar_label")}</Label>
                {!calendarStatus.connected && (
                  <p className="text-[11px] text-white/40">{t("kanban.form.sync_calendar_hint_disconnected")}</p>
                )}
              </div>
              <div onClick={(event) => event.stopPropagation()}>
                <Switch
                  id="task-sync-calendar"
                  checked={syncToCalendar}
                  disabled={!calendarStatus.connected}
                  onCheckedChange={setSyncToCalendar}
                  className="border-white/20 data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20 dark:data-[state=unchecked]:bg-white/20"
                  thumbClassName="bg-white dark:bg-white data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-900 dark:data-[state=unchecked]:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {isEdit && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  className="cursor-pointer active:scale-[0.98]"
                  onClick={handleDelete}
                >
                  {t("kanban.form.delete")}
                </Button>
              )}
              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="cursor-pointer text-white/70 active:scale-[0.98] hover:bg-white/10 hover:text-white"
                  onClick={onClose}
                >
                  {t("kanban.form.cancel")}
                </Button>
                <Button type="submit" disabled={submitting} className="cursor-pointer active:scale-[0.98]">
                  {t("kanban.form.save")}
                </Button>
              </div>
            </div>
          </form>
          )}

          {isEdit && initial && (
            <div className="flex flex-col border-t border-white/10 pt-4 md:border-t-0 md:border-l md:pl-5 md:pt-0">
              <TaskComments taskId={initial.id} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function TaskComments({ taskId }: { taskId: number }) {
  const { t } = useTranslation();
  const { comments, addComment, editComment, deleteComment } = useTaskComments(taskId);
  const [newBody, setNewBody] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<number | null>(null);

  const handleSend = async () => {
    const body = newBody.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await addComment(body);
      setNewBody("");
    } finally {
      setSending(false);
    }
  };

  const startEdit = (id: number, body: string) => {
    setEditingId(id);
    setEditingBody(body);
  };

  const saveEdit = async () => {
    const body = editingBody.trim();
    if (!body || editingId === null) return;
    await editComment(editingId, body);
    setEditingId(null);
  };

  const handleDeleteComment = (id: number) => {
    setConfirmDeleteCommentId(id);
  };

  return (
    <div className="flex h-full flex-col space-y-2">
      <Label className="text-white/70">{t("kanban.form.comments_label")}</Label>

      {comments.length === 0 ? (
        <p className="text-xs text-white/40">{t("kanban.form.comments_empty")}</p>
      ) : (
        <div className="max-h-72 flex-1 space-y-2 overflow-y-auto pr-1 md:max-h-[340px] glass-scrollbar">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-white/5 p-2 text-xs text-white/80">
              {confirmDeleteCommentId === comment.id ? (
                <ConfirmDeletePanel
                  message={t("kanban.form.comments_delete_confirm")}
                  onConfirm={async () => {
                    await deleteComment(comment.id);
                    setConfirmDeleteCommentId(null);
                  }}
                  onCancel={() => setConfirmDeleteCommentId(null)}
                />
              ) : editingId === comment.id ? (
                <div className="space-y-1.5">
                  <Textarea
                    value={editingBody}
                    onChange={(event) => setEditingBody(event.target.value)}
                    className="min-h-16 border-white/15 bg-white/5 text-white"
                    autoFocus
                  />
                  <div className="flex justify-end gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 cursor-pointer px-2 text-[11px] text-white/70 hover:bg-white/10 hover:text-white"
                      onClick={() => setEditingId(null)}
                    >
                      {t("kanban.form.comments_cancel")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-6 cursor-pointer px-2 text-[11px]"
                      onClick={saveEdit}
                    >
                      {t("kanban.form.comments_save")}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap">{comment.body}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-white/30">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(comment.id, comment.body)}
                        className="cursor-pointer text-[10px] text-white/40 hover:text-white/70"
                      >
                        {t("kanban.form.comments_edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="cursor-pointer text-[10px] text-white/40 hover:text-red-400"
                      >
                        {t("kanban.form.comments_delete")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <Textarea
          value={newBody}
          onChange={(event) => setNewBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder={t("kanban.form.comments_placeholder")}
          className="min-h-16 border-white/15 bg-white/5 text-white placeholder:text-white/30"
        />
        <Button
          type="button"
          disabled={!newBody.trim() || sending}
          className="w-full cursor-pointer active:scale-[0.98]"
          onClick={handleSend}
        >
          {t("kanban.form.comments_send")}
        </Button>
      </div>
    </div>
  );
}

export default TaskFormModal;
