import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Archive, ArchiveRestore } from 'lucide-react';
// Removed TS-only RootState import
import { setJobs, updateJob, addJob } from '@/store/jobsSlice';
import { setJobsSearch, setJobsStatusFilter } from '@/store/uiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';

const JobsPage = () => {
  const dispatch = useDispatch();
  const jobs = useSelector(( state) => state.jobs.items);
  const search = useSelector(( state) => state.ui.jobsSearch);
  const statusFilter = useSelector(( state) => state.ui.jobsStatusFilter);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', tags: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs?pageSize=100');
      const data = await response.json();
      dispatch(setJobs(data.jobs));
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveToggle = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update job');

      const job = jobs.find(j => j.id === jobId);
      if (job) {
        dispatch(updateJob({ ...job, status: newStatus }));
      }

      toast.success('Job status updated');
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Manage your open positions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <Input
                  placeholder="e.g. Senior Frontend Engineer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-') })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <Input
                  placeholder="auto-generated"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  placeholder="React, Node.js, Remote"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!form.title.trim()) {
                  toast.error('Title is required');
                  return;
                }
                try {
                  const res = await fetch('/api/jobs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: form.title.trim(),
                      slug: form.slug.trim(),
                      status: 'active',
                      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                    }),
                  });
                  if (!res.ok) throw new Error('Failed to create job');
                  const job = await res.json();
                  dispatch(addJob(job));
                  await fetchJobs();
                  setIsOpen(false);
                  setForm({ title: '', slug: '', tags: '' });
                  toast.success('Job created');
                } catch (e) {
                  toast.error('Failed to create job');
                }
              }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title or tags..."
            value={search}
            onChange={(e) => dispatch(setJobsSearch(e.target.value))}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={( value) => dispatch(setJobsStatusFilter(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading jobs...</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-6 transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.location}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleArchiveToggle(job.id, job.status)}
                  className="shrink-0"
                >
                  {job.status === 'active' ? (
                    <Archive className="h-4 w-4" />
                  ) : (
                    <ArchiveRestore className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                  {job.status}
                </Badge>
                <span className="text-muted-foreground">{job.type}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">No jobs found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
