// Seed/Demo data generator
SmartCleaner.SeedData = {
  generate() {
    // Only generate if no records exist
    if (SmartCleaner.Storage.get('records', []).length > 0) return;

    const records = [
      { id: 'rec1', name: 'Acme Corp Onboarding', customer: 'Acme Corp', status: 'intake', owner: 'Alice Johnson', dueDate: '2025-03-15', notes: 'New client onboarding request', createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-01-15T10:00:00Z' },
      { id: 'rec2', name: 'Beta Inc Review', customer: 'Beta Inc', status: 'review', owner: 'Bob Smith', dueDate: '2025-03-20', notes: 'Contract review pending', createdAt: '2025-02-01T09:30:00Z', updatedAt: '2025-02-05T14:00:00Z' },
      { id: 'rec3', name: 'Gamma LLC Support Ticket', customer: 'Gamma LLC', status: 'assigned', owner: 'Charlie Brown', dueDate: null, notes: 'Support case #4512', createdAt: '2025-02-10T11:00:00Z', updatedAt: '2025-02-12T08:00:00Z' },
      { id: 'rec4', name: 'Delta Services Project', customer: 'Delta Services', status: 'progress', owner: 'Diana Prince', dueDate: '2025-04-01', notes: 'Implementation in progress', createdAt: '2025-01-20T08:00:00Z', updatedAt: '2025-02-14T16:30:00Z' },
      { id: 'rec5', name: 'Echo Enterprises Approval', customer: 'Echo Enterprises', status: 'waiting', owner: 'Eve Adams', dueDate: null, notes: 'Awaiting manager sign-off', createdAt: '2025-02-12T13:00:00Z', updatedAt: '2025-02-12T13:00:00Z' },
      { id: 'rec6', name: 'Foxtrot Order', customer: 'Foxtrot Co', status: 'complete', owner: 'Frank Castle', dueDate: null, notes: 'Order shipped, follow-up done', createdAt: '2024-12-01T09:00:00Z', updatedAt: '2025-01-10T17:00:00Z' },
      { id: 'rec7', name: 'Golf Archive', customer: 'Golf Corp', status: 'archived', owner: 'Grace Hopper', dueDate: null, notes: 'Legacy project archived', createdAt: '2024-06-01T12:00:00Z', updatedAt: '2024-11-30T10:00:00Z' },
      { id: 'rec8', name: 'Hotel Onboarding', customer: 'Hotel Ltd', status: 'intake', owner: 'Hank Pym', dueDate: '2025-03-25', notes: 'Initial documentation received', createdAt: '2025-02-18T09:00:00Z', updatedAt: '2025-02-18T09:00:00Z' },
      { id: 'rec9', name: 'India Services Review', customer: 'India Services', status: 'review', owner: 'Iris West', dueDate: null, notes: 'Compliance review', createdAt: '2025-02-16T14:00:00Z', updatedAt: '2025-02-17T10:00:00Z' },
      { id: 'rec10', name: 'Juliet Corp Support', customer: 'Juliet Corp', status: 'progress', owner: 'Jack Ryan', dueDate: '2025-03-10', notes: 'Ongoing support for ticketing system', createdAt: '2025-01-25T11:00:00Z', updatedAt: '2025-02-15T15:00:00Z' },
    ];

    SmartCleaner.Storage.set('records', records);
    SmartCleaner.Audit.add('seed_data', 'Generated 10 sample records');

    // Also add sample tasks
    const tasks = [
      { id: 'task1', title: 'Review Acme onboarding docs', description: 'Check all documents', assignedTo: 'Alice Johnson', status: 'pending', dueDate: '2025-03-17', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'task2', title: 'Sign Gamma support contract', description: 'Send to legal', assignedTo: 'Bob Smith', status: 'in_progress', dueDate: '2025-03-20', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'task3', title: 'Prepare Delta project report', description: 'Compile weekly status', assignedTo: 'Diana Prince', status: 'pending', dueDate: '2025-03-25', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'task4', title: 'Call Beta Inc about contract', description: 'Follow up on outstanding items', assignedTo: 'Eve Adams', status: 'complete', dueDate: '2025-03-12', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    SmartCleaner.Storage.set('tasks', tasks);
    SmartCleaner.Audit.add('seed_data', 'Generated 4 sample tasks');
  }
};
