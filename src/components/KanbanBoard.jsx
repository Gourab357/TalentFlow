import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDispatch } from 'react-redux';
import { Mail, Phone } from 'lucide-react';
import { updateCandidateStage } from '@/store/candidatesSlice';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const stages = [
  { id: 'applied', label: 'Applied', color: 'bg-muted/40' },
  { id: 'screen', label: 'Screening', color: 'bg-muted/40' },
  { id: 'tech', label: 'Technical', color: 'bg-muted/40' },
  { id: 'offer', label: 'Offer', color: 'bg-muted/40' },
  { id: 'hired', label: 'Hired', color: 'bg-muted/40' },
  { id: 'rejected', label: 'Rejected', color: 'bg-muted/40' },
];

const KanbanBoard = ({ candidates }) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);

  const candidatesByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = candidates.filter(c => c.stage === stage.id);
    return acc;
  }, {});

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);
    
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    dispatch(updateCandidateStage({
      id: draggableId,
      stage: destination.droppableId,
    }));
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex min-w-[300px] flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{stage.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {candidatesByStage[stage.id].length}
                </Badge>
              </div>
            </div>

            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'flex-1 space-y-2 rounded-lg p-2 transition-colors',
                    stage.color,
                    snapshot.isDraggingOver && 'ring-2 ring-primary'
                  )}
                  style={{ minHeight: '400px' }}
                >
                  {candidatesByStage[stage.id].map((candidate, index) => (
                    <Draggable
                      key={candidate.id}
                      draggableId={candidate.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            'cursor-grab p-4 transition-shadow hover:shadow-md',
                            snapshot.isDragging && 'rotate-2 shadow-lg'
                          )}
                        >
                          <h4 className="mb-2 font-medium">{candidate.name}</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
