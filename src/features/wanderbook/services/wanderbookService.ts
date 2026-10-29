import { apiRequest } from '@/lib/apiClient';
import type {
  Comment,
  Page,
  Person,
  PlaceTag,
  Post,
  Profile,
  ReportReason,
  ReportTarget,
  Uploaded,
} from '../types';

/** The Wanderbook API. Viewing works signed out; everything that changes something needs sign-in. */

const before = (cursor?: number | null) => (cursor ? `?before=${String(cursor)}` : '');

// ---- profiles ----

export const getMyProfile = (signal?: AbortSignal) =>
  apiRequest<Profile>('/api/wanderbook/me', {
    fallbackError: 'Could not load your profile.',
    signal,
  });

export const getProfile = (publicId: string, signal?: AbortSignal) =>
  apiRequest<Profile>(`/api/wanderbook/profiles/${publicId}`, {
    fallbackError: 'Could not load this profile.',
    signal,
  });

export const updateMyProfile = (update: { bio: string; homeTown: string; isPrivate: boolean }) =>
  apiRequest<Profile>('/api/wanderbook/me', {
    method: 'PUT',
    body: update,
    fallbackError: 'Could not save your profile.',
  });

/** Profile photo or cover from an upload; `null` removes it. */
export const setProfilePhoto = (kind: 'avatar' | 'cover', photoId: string | null) =>
  apiRequest<Profile>(`/api/wanderbook/me/${kind}`, {
    method: 'PUT',
    body: { photoId },
    fallbackError: 'Could not change the photo.',
  });

export const follow = (publicId: string, on: boolean) =>
  apiRequest<Profile>(`/api/wanderbook/profiles/${publicId}/follow`, {
    method: on ? 'POST' : 'DELETE',
    fallbackError: on ? 'Could not follow.' : 'Could not unfollow.',
  });

export const block = (publicId: string, on: boolean) =>
  apiRequest<unknown>(`/api/wanderbook/profiles/${publicId}/block`, {
    method: on ? 'POST' : 'DELETE',
    fallbackError: on ? 'Could not block.' : 'Could not unblock.',
  });

export const getFollows = (
  publicId: string,
  list: 'followers' | 'following',
  cursor?: number | null,
  signal?: AbortSignal,
) =>
  apiRequest<Page<Person>>(`/api/wanderbook/profiles/${publicId}/${list}${before(cursor)}`, {
    fallbackError: 'Could not load the list.',
    signal,
  });

export const getFollowRequests = (cursor?: number | null, signal?: AbortSignal) =>
  apiRequest<Page<Person>>(`/api/wanderbook/me/follow-requests${before(cursor)}`, {
    fallbackError: 'Could not load follow requests.',
    signal,
  });

/** Approves (`true`) or declines a follow request. */
export const answerFollowRequest = (publicId: string, approve: boolean) =>
  apiRequest<unknown>(`/api/wanderbook/me/follow-requests/${publicId}`, {
    method: approve ? 'POST' : 'DELETE',
    expectedStatus: 204,
    fallbackError: 'Could not answer the request.',
  });

export const removeFollower = (publicId: string) =>
  apiRequest<unknown>(`/api/wanderbook/me/followers/${publicId}`, {
    method: 'DELETE',
    expectedStatus: 204,
    fallbackError: 'Could not remove this follower.',
  });

export const getBlocked = (signal?: AbortSignal) =>
  apiRequest<Person[]>('/api/wanderbook/me/blocked', {
    fallbackError: 'Could not load blocked people.',
    signal,
  });

export const searchPeople = (text: string, signal?: AbortSignal) =>
  apiRequest<Person[]>(`/api/wanderbook/people?q=${encodeURIComponent(text)}`, {
    fallbackError: 'Could not search.',
    signal,
  });

// ---- photos and posts ----

/** Uploads one original photo. The backend removes its location data and checks it before storing. */
export function uploadPhoto(file: Blob, name: string): Promise<Uploaded> {
  const form = new FormData();
  form.append('file', file, name);
  return apiRequest<Uploaded>('/api/wanderbook/photos', {
    method: 'POST',
    form,
    fallbackError: 'Could not upload this photo.',
  });
}

export const createPost = (post: { photoIds: string[]; caption: string; place: PlaceTag | null }) =>
  apiRequest<Post>('/api/wanderbook/posts', {
    method: 'POST',
    body: post,
    expectedStatus: 201,
    fallbackError: 'Could not post.',
  });

export const getPost = (publicId: string, signal?: AbortSignal) =>
  apiRequest<Post>(`/api/wanderbook/posts/${publicId}`, {
    fallbackError: 'Could not load this post.',
    signal,
  });

export const editPost = (publicId: string, edit: { caption: string; place: PlaceTag | null }) =>
  apiRequest<Post>(`/api/wanderbook/posts/${publicId}`, {
    method: 'PUT',
    body: edit,
    fallbackError: 'Could not save the post.',
  });

export const deletePost = (publicId: string) =>
  apiRequest<unknown>(`/api/wanderbook/posts/${publicId}`, {
    method: 'DELETE',
    expectedStatus: 204,
    fallbackError: 'Could not delete the post.',
  });

export const getFeed = (cursor?: number | null, signal?: AbortSignal) =>
  apiRequest<Page<Post>>(`/api/wanderbook/feed${before(cursor)}`, {
    fallbackError: 'Could not load the feed.',
    signal,
  });

export const getProfilePosts = (publicId: string, cursor?: number | null, signal?: AbortSignal) =>
  apiRequest<Page<Post>>(`/api/wanderbook/profiles/${publicId}/posts${before(cursor)}`, {
    fallbackError: 'Could not load posts.',
    signal,
  });

export const likePost = (publicId: string, on: boolean) =>
  apiRequest<Post>(`/api/wanderbook/posts/${publicId}/like`, {
    method: on ? 'POST' : 'DELETE',
    fallbackError: 'Could not like this post.',
  });

export const getLikes = (publicId: string, signal?: AbortSignal) =>
  apiRequest<Person[]>(`/api/wanderbook/posts/${publicId}/likes`, {
    fallbackError: 'Could not load likes.',
    signal,
  });

export const getComments = (publicId: string, after?: number | null, signal?: AbortSignal) =>
  apiRequest<Page<Comment>>(
    `/api/wanderbook/posts/${publicId}/comments${after ? `?after=${String(after)}` : ''}`,
    { fallbackError: 'Could not load comments.', signal },
  );

export const addComment = (publicId: string, text: string) =>
  apiRequest<Comment>(`/api/wanderbook/posts/${publicId}/comments`, {
    method: 'POST',
    body: { text },
    expectedStatus: 201,
    fallbackError: 'Could not comment.',
  });

export const deleteComment = (id: number) =>
  apiRequest<unknown>(`/api/wanderbook/comments/${String(id)}`, {
    method: 'DELETE',
    expectedStatus: 204,
    fallbackError: 'Could not delete the comment.',
  });

export const report = (r: {
  targetType: ReportTarget;
  target: string;
  reason: ReportReason;
  details: string;
}) =>
  apiRequest<unknown>('/api/wanderbook/reports', {
    method: 'POST',
    body: r,
    expectedStatus: 204,
    fallbackError: 'Could not send the report.',
  });
