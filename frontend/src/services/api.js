import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})


export const registerStudent = (name) =>
  api.post('/students/register', { name })

export const getStudent = (studentId) =>
  api.get(`/students/${studentId}`)

export const createPoll = (pollData) =>
  api.post('/polls', pollData)

export const getAllPolls = () =>
  api.get('/polls')

export const getPoll = (pollId) =>
  api.get(`/polls/${pollId}`)

export const activatePoll = (pollId) =>
  api.patch(`/polls/${pollId}/activate`)

export const closePoll = (pollId) =>
  api.patch(`/polls/${pollId}/close`)

export const completePoll = (pollId) =>
  api.patch(`/polls/${pollId}/complete`)

export const submitVote = (voteData) =>
  api.post('/votes', voteData)

export const getPollResults = (pollId) =>
  api.get(`/polls/${pollId}/results`)

export const getActivePoll = () =>
  api.get('/polls/active/current')

export const getPollHistory = () =>
  api.get('/polls/history/all')

export default api
