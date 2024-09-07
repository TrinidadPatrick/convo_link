import axios from 'axios'

const http : any = axios.create({
  baseURL: 'http://localhost:5000/api/',
  // baseURL: 'https://convo-link.vercel.app/api/',
  withCredentials : true,
    headers : {
        "Content-Type" : "Application/json",
    }
})

export default http;