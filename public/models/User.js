class User{
    constructor(name, gender, birth, country, email, password, photo, admin){
        this.id
        this.name = name
        this.gender = gender
        this.birth = birth
        this.country = country
        this.email = email
        this.password = password
        this.photo = photo
        this.admin = admin

    }

    loadFromJson(json){
        for(let name in json){
            this[name] = json[name]
        }
    }

    static getUsersStorage(){
        let users = []
        if(localStorage.getItem('users'))
            users = JSON.parse(localStorage.getItem('users'))
        
        return users
    }

    save(){
        return new Promise((resolve, reject) => {
            let promise
            if(this._id){
                promise = MyHttpRequest.put(`/users/${this._id}`, this.toJSON())
            }else{
                promise = MyHttpRequest.post('/users', this.toJSON())
            }
            promise.then(data => {
                this.loadFromJson(data)
                resolve(this)
            }).catch(e => {
                reject(e)
            })
        })

        
    }

    toJSON(){
        let json = {}
        Object.keys(this).forEach(key => {
            if(this[key] != undefined)
                json[key] = this[key]
        })
        return json
    }

    remove(){
        let users = User.getUsersStorage()
        users.forEach((userData, index) => {
            if(this.id == userData.id){
                console.log(userData, index)
                users.splice(index, 1)
            }
        })
        localStorage.setItem('users', JSON.stringify(users))
    }

    getNewId(){
        let usersId = parseInt(localStorage.getItem('usersId'))
        if(!usersId > 0)
            usersId = 0
        usersId++
        localStorage.setItem('usersId', usersId)
        return usersId
    }

}