import { useEffect, useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

const DEFAULT_JOB_ID = 'general';

const emptyAssessment = () => ({
  id: `assess-${Date.now()}`,
  title: 'Untitled Assessment',
  jobId: DEFAULT_JOB_ID,
  questions: [],
});

const emptyMcq = () => ({ id: `q-${Date.now()}`, type: 'mcq', text: '', required: false, options: [{ id: `o-${Date.now()}-1`, text: '' }] });

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [working, setWorking] = useState(false);
  const [draft, setDraft] = useState(emptyAssessment());

  useEffect(() => {
    const init = async () => {
      try {
        // Try local first
        const local = localStorage.getItem('assessments');
        if (local) {
          setAssessments(JSON.parse(local));
          return;
        }
        // Fallback to server stub
        const res = await fetch(`/api/assessments/${DEFAULT_JOB_ID}`);
        const data = await res.json();
        const seeded = [{ id: `stub-${Date.now()}`, title: 'General Assessment', jobId: DEFAULT_JOB_ID, questions: (data.sections?.[0]?.questions || []).map((q, idx) => ({ id: `q-${idx}`, type: 'mcq', text: q.label || '', required: !!q.required, options: (q.options || ['Yes','No']).map((t, i) => ({ id: `o-${idx}-${i}`, text: t })) })) }];
        setAssessments(seeded);
        localStorage.setItem('assessments', JSON.stringify(seeded));
      } catch {}
    };
    init();
  }, []);

  const openCreate = () => {
    setEditingIndex(-1);
    setDraft(emptyAssessment());
    setBuilderOpen(true);
  };

  const openEdit = (index) => {
    setEditingIndex(index);
    setDraft(JSON.parse(JSON.stringify(assessments[index])));
    setBuilderOpen(true);
  };

  const addMcq = () => {
    setDraft({ ...draft, questions: [...draft.questions, emptyMcq()] });
  };

  const updateQuestion = (qid, patch) => {
    setDraft({
      ...draft,
      questions: draft.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
    });
  };

  const addOption = (qid) => {
    setDraft({
      ...draft,
      questions: draft.questions.map((q) =>
        q.id === qid ? { ...q, options: [...q.options, { id: `o-${Date.now()}`, text: '' }] } : q
      ),
    });
  };

  const updateOption = (qid, oid, text) => {
    setDraft({
      ...draft,
      questions: draft.questions.map((q) =>
        q.id === qid ? { ...q, options: q.options.map((o) => (o.id === oid ? { ...o, text } : o)) } : q
      ),
    });
  };

  const removeOption = (qid, oid) => {
    setDraft({
      ...draft,
      questions: draft.questions.map((q) =>
        q.id === qid ? { ...q, options: q.options.filter((o) => o.id !== oid) } : q
      ),
    });
  };

  const saveAssessment = async () => {
    if (!draft.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (draft.questions.some((q) => !q.text.trim())) {
      toast.error('Every question needs text');
      return;
    }
    if (draft.questions.some((q) => q.options.length === 0 || q.options.some((o) => !o.text.trim()))) {
      toast.error('Every MCQ needs options with text');
      return;
    }
    setWorking(true);
    try {
      // Save to Mirage (stub) and local
      await fetch(`/api/assessments/${draft.jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      const next = [...assessments];
      if (editingIndex === -1) next.unshift(draft);
      else next[editingIndex] = draft;
      setAssessments(next);
      localStorage.setItem('assessments', JSON.stringify(next));
      setBuilderOpen(false);
      toast.success('Assessment saved');
    } catch (e) {
      toast.error('Failed to save assessment');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">Create and manage job assessments</p>
        </div>
        <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Assessment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assessment Builder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Questions</h4>
                <Button size="sm" onClick={addMcq}>Add MCQ</Button>
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-auto pr-2">
                {draft.questions.map((q) => (
                  <Card key={q.id} className="p-4 space-y-3">
                    <Input
                      placeholder="Question text"
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                    />
                    <div className="space-y-2">
                      {(q.options || []).map((o) => (
                        <div key={o.id} className="flex gap-2">
                          <Input
                            placeholder="Option text"
                            value={o.text}
                            onChange={(e) => updateOption(q.id, o.id, e.target.value)}
                          />
                          <Button variant="outline" onClick={() => removeOption(q.id, o.id)}>Remove</Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => addOption(q.id)}>Add option</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBuilderOpen(false)}>Cancel</Button>
              <Button disabled={working} onClick={saveAssessment}>{working ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ClipboardList className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Assessment Builder</h3>
        <p className="mb-6 max-w-md text-muted-foreground">
          Create assessments with MCQ questions. Start building to add questions and options, like Google Forms.
        </p>
        <Button onClick={openCreate}>Start Building</Button>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((a, idx) => (
          <Card key={a.id} className="p-6 space-y-3">
            <h3 className="mb-2 font-semibold">{a.title}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {a.questions.length} question{a.questions.length === 1 ? '' : 's'}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Job: {a.jobId}</span>
              <Button variant="outline" size="sm" onClick={() => openEdit(idx)}>
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssessmentsPage;
