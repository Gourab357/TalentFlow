import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  timeline: [],
  loading: false,
  error: null,
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    setCandidates: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    addCandidate: (state, action) => {
      state.items.push(action.payload);
    },
    updateCandidate: (state, action) => {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateCandidateStage: (state, action) => {
      const candidate = state.items.find(c => c.id === action.payload.id);
      if (candidate) {
        const oldStage = candidate.stage;
        candidate.stage = action.payload.stage;
        state.timeline.push({
          id: `${Date.now()}-${Math.random()}`,
          candidateId: candidate.id,
          type: 'stage_change',
          description: `Stage changed from ${oldStage} to ${candidate.stage}`,
          timestamp: new Date().toISOString(),
          fromStage: oldStage,
          toStage: candidate.stage,
        });
      }
    },
    addTimelineEvent: (state, action) => {
      state.timeline.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setCandidates,
  addCandidate,
  updateCandidate,
  updateCandidateStage,
  addTimelineEvent,
  setLoading,
  setError,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;
