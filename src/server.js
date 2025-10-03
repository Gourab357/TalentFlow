import { createServer, Model, Factory, Response } from 'miragejs';
import { faker } from '@faker-js/faker';

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const locations = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'];

export function makeServer({ environment = 'development' } = {}) {
  return createServer({
    environment,
    models: {
      job: Model,
      candidate: Model,
      timeline: Model,
    },
    factories: {
      job: Factory.extend({
        title() {
          const roles = [
            'Senior Frontend Engineer',
            'Backend Developer',
            'Full Stack Engineer',
            'Product Designer',
            'DevOps Engineer',
            'Data Scientist',
            'QA Engineer',
            'Engineering Manager',
            'Product Manager',
            'UX Researcher',
          ];
          return faker.helpers.arrayElement(roles);
        },
        slug() {
          return this.title.toLowerCase().replace(/\s+/g, '-');
        },
        status() {
          return faker.helpers.arrayElement(['active', 'active', 'active', 'archived']);
        },
        tags() {
          return faker.helpers.arrayElements(
            ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'Remote'],
            faker.number.int({ min: 2, max: 4 })
          );
        },
        description() {
          return faker.lorem.paragraphs(3);
        },
        location() {
          return faker.helpers.arrayElement(locations);
        },
        type() {
          return faker.helpers.arrayElement(jobTypes);
        },
        createdAt() {
          return faker.date.past().toISOString();
        },
        order(i) {
          return i;
        },
      }),
      candidate: Factory.extend({
        name() {
          return faker.person.fullName();
        },
        email() {
          return faker.internet.email();
        },
        phone() {
          return faker.phone.number();
        },
        stage() {
          return faker.helpers.arrayElement(stages);
        },
        jobId(i) {
          // Distribute candidates across jobs
          return String((i % 25) + 1);
        },
        appliedAt() {
          return faker.date.recent({ days: 60 }).toISOString();
        },
        notes() {
          return faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.3 });
        },
      }),
    },

    seeds(server) {
      // Create 25 jobs
      server.createList('job', 25);

      // Create 1000 candidates
      server.createList('candidate', 1000);
    },

    routes() {
      this.namespace = 'api';

      // Add realistic latency
      this.timing = faker.number.int({ min: 200, max: 1200 });

      // Jobs endpoints
      this.get('/jobs', (schema, request) => {
        const queryParams = request.queryParams;
        const search = String(queryParams.search || '');
        const status = String(queryParams.status || 'all');
        const page = String(queryParams.page || '1');
        const pageSize = String(queryParams.pageSize || '20');
        
        const allJobs = schema.db.jobs.slice();

        // Filter by status
        let jobs = status !== 'all' 
          ? allJobs.filter((job) => job.status === status)
          : allJobs;

        // Search by title or tags
        if (search) {
          const searchLower = search.toLowerCase();
          jobs = jobs.filter((job) => 
            job.title.toLowerCase().includes(searchLower) ||
            job.tags.some((tag) => tag.toLowerCase().includes(searchLower))
          );
        }

        // Sort by order
        jobs = jobs.sort((a, b) => a.order - b.order);

        // Pagination
        const total = jobs.length;
        const pageNum = parseInt(page);
        const size = parseInt(pageSize);
        const start = (pageNum - 1) * size;
        const paginatedJobs = jobs.slice(start, start + size);

        return {
          jobs: paginatedJobs,
          total,
          page: pageNum,
          pageSize: size,
        };
      });

      this.get('/jobs/:id', (schema, request) => {
        const id = request.params.id;
        return schema.db.jobs.find(id);
      });

      this.post('/jobs', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        
        // Simulate occasional errors
        if (Math.random() < 0.05) {
          return new Response(500, {}, { error: 'Failed to create job' });
        }

        const newJob = {
          ...attrs,
          id: faker.string.uuid(),
          order: schema.db.jobs.length,
          createdAt: new Date().toISOString(),
        };
        const job = schema.db.jobs.insert(newJob);

        return job;
      });

      this.patch('/jobs/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        
        if (Math.random() < 0.05) {
          return new Response(500, {}, { error: 'Failed to update job' });
        }

        return schema.db.jobs.update(id, attrs);
      });

      this.patch('/jobs/:id/reorder', (schema, request) => {
        const { fromOrder, toOrder } = JSON.parse(request.requestBody);
        
        // Simulate occasional reorder failures
        if (Math.random() < 0.1) {
          return new Response(500, {}, { error: 'Failed to reorder jobs' });
        }

        const jobs = schema.db.jobs.slice().sort((a, b) => a.order - b.order);
        const [moved] = jobs.splice(fromOrder, 1);
        jobs.splice(toOrder, 0, moved);

        // Update all order values
        jobs.forEach((job, index) => {
          schema.db.jobs.update(job.id, { order: index });
        });

        return { success: true };
      });

      this.delete('/jobs/:id', (schema, request) => {
        const id = request.params.id;
        schema.db.jobs.remove(id);
        return {};
      });

      // Candidates endpoints
      this.get('/candidates', (schema, request) => {
        const queryParams = request.queryParams;
        const search = String(queryParams.search || '');
        const stage = String(queryParams.stage || 'all');
        const page = String(queryParams.page || '1');
        const pageSize = String(queryParams.pageSize || '50');
        
        const allCandidates = schema.db.candidates.slice();

        // Filter by stage
        let candidates = stage !== 'all'
          ? allCandidates.filter((c) => c.stage === stage)
          : allCandidates;

        // Search by name or email
        if (search) {
          const searchLower = search.toLowerCase();
          candidates = candidates.filter((c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
          );
        }

        // Pagination
        const total = candidates.length;
        const pageNum = parseInt(page);
        const size = parseInt(pageSize);
        const start = (pageNum - 1) * size;
        const paginatedCandidates = candidates.slice(start, start + size);

        return {
          candidates: paginatedCandidates,
          total,
          page: pageNum,
          pageSize: size,
        };
      });

      this.get('/candidates/:id', (schema, request) => {
        const id = request.params.id;
        return schema.db.candidates.find(id);
      });

      this.post('/candidates', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        
        if (Math.random() < 0.05) {
          return new Response(500, {}, { error: 'Failed to create candidate' });
        }

        const newCandidate = {
          ...attrs,
          id: faker.string.uuid(),
          appliedAt: new Date().toISOString(),
        };
        const candidate = schema.db.candidates.insert(newCandidate);

        return candidate;
      });

      this.patch('/candidates/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        
        if (Math.random() < 0.05) {
          return new Response(500, {}, { error: 'Failed to update candidate' });
        }

        return schema.db.candidates.update(id, attrs);
      });

      this.get('/candidates/:id/timeline', (schema) => {
        // Return mock timeline events
        return [
          {
            id: '1',
            type: 'note',
            description: 'Initial screening call with the candidate.',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'email',
            description: 'Sent a follow-up email with the technical assessment.',
            timestamp: new Date().toISOString(),
          },
        ];
      });

      // Assessments endpoints
      this.get('/assessments/:jobId', (schema, request) => {
        const { jobId } = request.params;
        // Return a simple stubbed assessment for the job
        return {
          jobId,
          sections: [
            {
              id: 'sec-1',
              title: 'General',
              questions: [
                { id: 'q1', type: 'single', label: 'Do you have React experience?', required: true, options: ['Yes', 'No'] },
                { id: 'q2', type: 'short', label: 'Years of experience', required: true },
              ],
            },
          ],
        };
      });

      this.put('/assessments/:jobId', (schema, request) => {
        const body = JSON.parse(request.requestBody || '{}');
        if (Math.random() < 0.05) {
          return new Response(500, {}, { error: 'Failed to save assessment' });
        }
        return { success: true, saved: body };
      });

      this.post('/assessments/:jobId/submit', (schema, request) => {
        const body = JSON.parse(request.requestBody || '{}');
        if (Math.random() < 0.1) {
          return new Response(500, {}, { error: 'Submission failed' });
        }
        return { success: true, received: body };
      });
    },
  });
}
