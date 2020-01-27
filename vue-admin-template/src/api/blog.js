import request from '@/utils/request'
const baseUrl = 'http://localhost:3000'

export function fetchList (params) {
    return request({
        url: `${baseUrl}/blog/list`,
        method: 'get',
        params
    })
}

export function del (params) {
    return request({
        url: `${baseUrl}/blog/del`,
        method: 'post',
        data: {
            ...params
        }
    })
}