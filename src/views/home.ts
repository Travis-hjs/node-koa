const data = {
    name: 'hjs',
    num: 99,
    time: Date.now()
}

export function getHomeData() {
    return JSON.stringify(data) 
}