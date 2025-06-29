export interface Feedback {
  id: number;
  userId: number;
  placeId: number;
  bookingId?: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  place?: {
    name: string;
    type: string;
  };
  booking?: {
    id: number;
    status: string;
    place?: {
      name: string;
      city?: {
        name: string;
      };
    };
  };
}

export interface CreateFeedbackRequest {
  placeId: number;
  bookingId?: number;
  rating: number;
  comment: string;
}