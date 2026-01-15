export interface Professor {
  id: number;
  name: string;
}
export interface Course {
  id: number;
  name: string;
  number: string;
}

export interface Topic {
  id: number;
  name: string;
  description: string;
}

export interface Semester {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  ip_address: string;
  points: number;
}

export interface File {
  id: number;
  filename: string;
  original_author?: Pick<User, 'id' | 'username' | 'ip_address'>;
  topic?: Topic;
  professor?: Professor;
  course?: Course;
  semester?: Semester;
  // Present on /api/files/filter/
  peer_users?: Array<Pick<User, 'id' | 'username' | 'points' | 'ip_address'>>;
  upvotes?: number[];
  downvotes?: number[];
}

export enum Status {
  HOSTED = "HOSTED",
  PRIVATE = 'PRIVATE',
}
export interface RegisteredFile extends File {
  status: Status;
}