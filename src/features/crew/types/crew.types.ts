export type CrewRole = 'supervisor' | 'technician' | 'helper';

export interface TimeEntry {
  id: string;
  startTime: string;   // ISO
  endTime?: string;    // ISO, undefined if active
  user: string;
  jobId: string;
  workOrderUrl?: string;
}

export interface JobAssignment {
  estimateId: string;
  customerName: string;
  address: string;
  scheduledDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
}
