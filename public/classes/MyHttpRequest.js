
class MyHttpRequest{

    static get(url, params = {}){
        return MyHttpRequest.request('GET', url, params)
    }

    static post(url, params = {}){
        return MyHttpRequest.request('POST', url, params)
    }

    static put(url, params = {}){
        return MyHttpRequest.request('PUT', url, params)
    }

    static delete(url, params = {}){
        return MyHttpRequest.request('DELETE', url, params)
    }

    static request(method, url, params = {}){
        return new Promise((resolve, reject) => {
            let ajax = new XMLHttpRequest()
            ajax.open(method.toUpperCase(), url)

            ajax.onerror = event => {
                reject(event)
            }

            ajax.onload = event => {
                let obj = {}
                
                try {
                    obj = JSON.parse(ajax.responseText)
                } catch (e) {
                    reject(e)
                    console.error(e)
                }

                resolve(obj)
            }
            ajax.send()
        })
        
    }
}