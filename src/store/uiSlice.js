import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jobsSearch: '',
  jobsStatusFilter: 'all',
  candidatesSearch: '',
  candidatesStageFilter: 'all',
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setJobsSearch: (state, action) => {
      state.jobsSearch = action.payload;
    },
    setJobsStatusFilter: (state, action) => {
      state.jobsStatusFilter = action.payload;
    },
    setCandidatesSearch: (state, action) => {
      state.candidatesSearch = action.payload;
    },
    setCandidatesStageFilter: (state, action) => {
      state.candidatesStageFilter = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const {
  setJobsSearch,
  setJobsStatusFilter,
  setCandidatesSearch,
  setCandidatesStageFilter,
  toggleSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
