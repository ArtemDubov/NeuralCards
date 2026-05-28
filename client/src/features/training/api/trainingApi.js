import axiosClient from "../../../shared/api/axiosClient";
import { API_ENDPOINTS } from "../../../shared/api/apiConfig";

export const trainingApi = {
  createSession: (data) =>
    axiosClient.post(API_ENDPOINTS.TRAINING.CREATE_SESSION, data),

  getSession: (id) => axiosClient.get(API_ENDPOINTS.TRAINING.SESSION(id)),

  submitAnswer: (id, answer, isCorrect) =>
    axiosClient.post(API_ENDPOINTS.TRAINING.ANSWER(id), {
      answer,
      is_correct: isCorrect,
    }),

  completeSession: (id) =>
    axiosClient.post(API_ENDPOINTS.TRAINING.COMPLETE(id)),

  // Deleted Sprint mode API
  // Practice mode
  createPracticeSession: (cardSetId) =>
    axiosClient.post(`/api/training/practice/sessions`, {
      card_set_id: cardSetId,
    }),

  submitPracticeAnswer: (sessionId, cardId, knew) =>
    axiosClient.post(
      `/api/training/practice/${sessionId}/answer?card_id=${cardId}&knew=${knew}`,
    ),

  // Marathon mode
  createMarathonSession: (cardSetId) =>
    axiosClient.post(`/api/training/marathon/sessions`, null, {
      params: { card_set_id: cardSetId },
    }),

  submitMarathonAnswer: (sessionId, cardId, knew) =>
    axiosClient.post(`/api/training/marathon/${sessionId}/answer`, null, {
      params: { card_id: cardId, knew },
    }),

  completeMarathon: (sessionId) =>
    axiosClient.post(`/api/training/marathon/${sessionId}/complete`),

  // Dictation mode
  createDictationSession: (cardSetId) =>
    axiosClient.post(`/api/training/dictation/sessions`, {
      card_set_id: cardSetId,
    }),

  submitDictationAnswer: (sessionId, cardId, answer) =>
    axiosClient.post(`/api/training/dictation/${sessionId}/answer`, null, {
      params: { card_id: cardId, answer },
    }),

  completeDictation: (sessionId) =>
    axiosClient.post(`/api/training/dictation/${sessionId}/complete`),

  // Matching mode
  createMatchingSession: (cardSetId, pairCount = 8) =>
    axiosClient.post(`/api/training/matching/sessions`, {
      card_set_id: cardSetId,
      pair_count: pairCount,
    }),

  submitMatchingAnswer: (sessionId, matches) =>
    axiosClient.post(`/api/training/matching/${sessionId}/answer`, matches),
};
