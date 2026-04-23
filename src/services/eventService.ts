import api from './api';

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  event_type: 'user' | 'admin';
  creator_id: string;
  subdivision_id?: number;
  creator_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EventCreateRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_all_day?: boolean;
  event_type?: 'user' | 'admin';
  subdivision_id?: number;
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  event_type?: 'user' | 'admin';
  subdivision_id?: number;
}

export const createEvent = async (eventData: EventCreateRequest): Promise<Event> => {
  const response = await api.post<Event>('/events', eventData);
  return response.data;
};

export const getEvents = async (
  startDate?: string, 
  endDate?: string
): Promise<Event[]> => {
  const params: any = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get<Event[]>('/events', { params });
  return response.data;
};

export const getEventsForMonth = async (year: number, month: number): Promise<Event[]> => {
  const response = await api.get<Event[]>('/events/month', {
    params: { year, month }
  });
  return response.data;
};

export const getEventById = async (eventId: string): Promise<Event> => {
  const response = await api.get<Event>(`/events/${eventId}`);
  return response.data;
};

export const updateEvent = async (
  eventId: string, 
  eventData: EventUpdateRequest
): Promise<Event> => {
  const response = await api.put<Event>(`/events/${eventId}`, eventData);
  return response.data;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await api.delete(`/events/${eventId}`);
};