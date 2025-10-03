import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, LayoutGrid, List } from 'lucide-react';
// Removed TS-only RootState import
import { setCandidates } from '@/store/candidatesSlice';
import { setCandidatesSearch, setCandidatesStageFilter } from '@/store/uiSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import KanbanBoard from '@/components/KanbanBoard';

const CandidatesPage = () => {
  const dispatch = useDispatch();
  const candidates = useSelector(( state) => state.candidates.items);
  const search = useSelector(( state) => state.ui.candidatesSearch);
  const stageFilter = useSelector(( state) => state.ui.candidatesStageFilter);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('kanban');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/candidates?pageSize=1000');
      const data = await response.json();
      dispatch(setCandidates(data.candidates));
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || candidate.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">
            Manage your candidate pipeline ({candidates.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name or email..."
            value={search}
            onChange={(e) => dispatch(setCandidatesSearch(e.target.value))}
            className="pl-9"
          />
        </div>
        <Select
          value={stageFilter}
          onValueChange={( value) => dispatch(setCandidatesStageFilter(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screen">Screening</SelectItem>
            <SelectItem value="tech">Technical</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading candidates...</div>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard candidates={filteredCandidates} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          List view coming soon...
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
