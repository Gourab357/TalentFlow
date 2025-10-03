import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    addJob: (state, action) => {
      state.items.push(action.payload);
    },
    updateJob: (state, action) => {
      const index = state.items.findIndex(job => job.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteJob: (state, action) => {
      state.items = state.items.filter(job => job.id !== action.payload);
    },
    reorderJobs: (state, action) => {
      const { fromOrder, toOrder } = action.payload;
      const jobsCopy = [...state.items];
      const [moved] = jobsCopy.splice(fromOrder, 1);
      jobsCopy.splice(toOrder, 0, moved);
      state.items = jobsCopy.map((job, index) => ({ ...job, order: index }));
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

export const { setJobs, addJob, updateJob, deleteJob, reorderJobs, setLoading, setError } = jobsSlice.actions;
export default jobsSlice.reducer;
