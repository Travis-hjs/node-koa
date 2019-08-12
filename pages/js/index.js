const BASE_URL = 'http://10.0.18.116:1995';

/** 页面整体 */
const page = document.querySelector('.page');

function getData() {
    baseRequest('GET', BASE_URL + '/getHome', { 
        id: 10
    }, res => {
        console.log('getData success', res);
        
    }, err => {
        console.log('getData fail', err);
    });
}

function postData() {
    baseRequest('POST', BASE_URL + '/send', {
        name: 'hjs',
        age: new Date().getFullYear() - 1995,
        tall: '178cm'
    }, res => {
        console.log('postData success', res);
        
    }, err => {
        console.log('postData fail', err);
        
    });
}
