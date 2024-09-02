import axios from 'axios'

const http : any = axios.create({
  // baseURL: 'http://localhost:5000/api/',
  baseURL: 'https://convo-link.vercel.app/api/',
  withCredentials: true,
})

export default http;