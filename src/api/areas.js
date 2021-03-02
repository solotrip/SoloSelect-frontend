import axios from "axios";

const API_URL = process.env.REACT_APP_SS_API_URL + 'areas'


export async function autocomplete(query) {
  const response = await axios.get(`${API_URL}/autocomplete`, {
    params: {
      q: query
    }
  })
  return response.data
}


export async function next() {
  const response = await axios.get(`${API_URL}/next`)
  return response.data
}


export async function resetCursor() {
  const response = await axios.post(`${API_URL}/reset-cursor`)
  return response.data
}

export async function get(sid) {
  const response = await axios.get(`${API_URL}/${sid}`)
  return response.data
}

export async function getAreaImages(sid) {
  const response = await axios.get(`${API_URL}/${sid}/images`)
  return response.data
}

export async function updateArea(sid, updates) {
  await axios.patch(`${API_URL}/${sid}`, updates)
}

export async function removeImage(sid, type, key) {
  await axios.delete(`${API_URL}/${sid}/images/${type}/${key}`)
}
