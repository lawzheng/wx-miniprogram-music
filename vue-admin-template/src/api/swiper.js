import request from '@/utils/request'
const baseUrl = 'http://localhost:3000'

export function fetchList () {
    return request({
        url: `${baseUrl}/swiper/list`,
        method: 'get'
    })
}

export function delBanner (params) {
    return request({
        url: `${baseUrl}/swiper/delBanner`,
        method: 'post',
        data: {
            ...params
        }
    })
}