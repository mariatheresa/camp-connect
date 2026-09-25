export interface Participant {
  id: string;
  name: string;
  photoPath: string | null;
  jobProfile: string | null;
  title: string | null;
}

export interface DbParticipant {
  id: string;
  name: string;
  photo_path: string | null;
  job_profile: string | null;
  title: string | null;
}

export type RatingLevel = 0 | 1 | 2 | 3;
