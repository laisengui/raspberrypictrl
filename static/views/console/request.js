//import axios from 'axios'



// 查询参数列表
export function gpio(query) {
  return axios({
      url: '/gpio',
      method: 'get',
      params: query
  })
}


