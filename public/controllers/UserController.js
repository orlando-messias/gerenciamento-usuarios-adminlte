class UserController{
    constructor(formIdCreate, formIdUpdate, tableId){
        this.formEl = document.getElementById(formIdCreate)
        this.formupdateEl = document.getElementById(formIdUpdate)
        this.tableEl = document.getElementById(tableId)
        this.onSubmit()
        this.onEdit()
        this.selectAll()
    }


    onSubmit(){
        //let _this = this   ->  se nao fosse utilizar arrow function
        this.formEl.addEventListener('submit', e => {
            e.preventDefault()
            let user = this.getValues(this.formEl)  // como foi usado arrow function entao o this faz ref a classe
            if (!user) return false
            
            this.getPhoto(this.formEl).then((content) => {
                user.photo = content
                user.save()   // metodo save() la da classe user
                this.addLine(user)
                this.formEl.reset()
            }, (e) => {
                console.error(e)
            })
        
        })
    }   

    onEdit(){
        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e => {
            this.showFormCreate()
        })

        this.formupdateEl.addEventListener('submit', e => {
            e.preventDefault()
            let userUpdate = this.getValues(this.formupdateEl)  // dados do formulario de edicao
            console.log(userUpdate)
            let index = this.formupdateEl.dataset.trIndex  //recupera o valor do indice da linha cujo editar foi clicado
            let tr = this.tableEl.rows[index]
            let userBefore = JSON.parse(tr.dataset.user)   // dados iniciais antes de editar usuario
            let newUser = Object.assign({}, userBefore, userUpdate)  // object.assign une dados de um obj com outro

            this.getPhoto(this.formupdateEl).then((content) => {
                newUser.photo = content
                if(newUser.photo == 'dist/img/boxed-bg.jpg')   // o usuario não escolheu nova foto?
                    newUser.photo = userBefore.photo
                else
                    newUser.photo = content

                let finalUser = new User()
                finalUser.loadFromJson(newUser)
                finalUser.save()  // metodo save() la da classe user

                this.addUpudateTr(finalUser, tr)

                this.updateCount()
                this.formupdateEl.reset()
                this.showFormCreate()   
                
            }, (e) => {
                console.error(e)
            })
        })
    }

    showFormCreate(){
        document.querySelector('#box-user-create').style.display='block'
        document.querySelector('#box-user-update').style.display='none'
    }

    showFormUpdate(){
        document.querySelector('#box-user-create').style.display='none'
        document.querySelector('#box-user-update').style.display='block'
    }

    getPhoto(forms){
        
        return new Promise((resolve, reject) => {
            let fr = new FileReader()
            let theElements = [...forms.elements].filter(item => {
                if(item.name === 'photo')
                    return item
            })
            let file = theElements[0].files[0]

            fr.onload = () => {
                resolve(fr.result)
            }
            fr.onerror = (e) => {
                reject(e)
            }

            file ? fr.readAsDataURL(file) : resolve('dist/img/boxed-bg.jpg')
        })

    }

    getValues(forms){
        let user = {}
        let isValid = true
        var spread = [...forms.elements].forEach(field => {

            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){
                field.parentElement.classList.add('has-error')
                isValid = false
            }
            else
                field.parentElement.classList.remove('has-error')
            
            if(field.name == 'gender' && field.checked)
                user[field.name] = field.value
            else if(field.id == 'admin')
                user[field.id] = field.checked ? 'S' : 'N'
            else
                user[field.id.substring(12)] = field.value
        })

        if(!isValid)
            return false
        
        return new User(user.Name, user.gender, user.Birth, user.Country, user.Email1, user.Password1, user.photo, user.admin)

    }

    addLine(dataUser){
        let tr = this.addUpudateTr(dataUser)
        this.tableEl.appendChild(tr)
        this.updateCount()
    }

    addUpudateTr(data, tr=null){     // se o parametro tr nao for passado, o valor dele é nulo automaticametne
        
        if(tr == null)
            tr = document.createElement('tr')

        console.log(data)

        tr.dataset.user = JSON.stringify(data)
        tr.innerHTML = 
        `   <td><img src="${data.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${data.name}</td>
            <td>${data.email}</td>
            <td>${data.admin}</td>
            <td>${data.birth}</td>
            <td>
            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `
        this.addEventsTr(tr)
        return tr
    }


    // getUsersStorage(){
    //     let users = []
    //     if(sessionStorage.getItem('users'))  // existe algo na session storage users?
    //         users = JSON.parse(sessionStorage.getItem('users'))
    //     return users
    // }
    
    insertUserStorage(dataUser){
        let users = User.getUsersStorage()
        users.push(dataUser)
        localStorage.setItem('users', JSON.stringify(users))
    }

    selectAll(){
        //let users = User.getUsersStorage()
        MyHttpRequest.get('/users').then(data => {
            data.users.forEach(dataUser => {
                this.addLine(dataUser)
            })
        })
        
    }

    addEventsTr(tr){

        tr.querySelector('.btn-delete').addEventListener('click', e => {
            if(confirm('Deseja realmente excluir?')){
                let user = new User()
                user.loadFromJson(JSON.parse(tr.dataset.user))
                user.remove()
                tr.remove()
                this.updateCount()
            }
        })

        tr.querySelector('.btn-edit').addEventListener('click', e => {
            let json = JSON.parse(tr.dataset.user)
            this.formupdateEl.dataset.trIndex = tr.sectionRowIndex //pega o indice da linha a partir de 0

            for(let name in json){
                let field = this.formupdateEl.querySelector('[name=' + name + ']')
                
                if(name == 'id')
                    continue

                switch(field.type){
                    case 'file':
                        continue
                    break
                    case 'radio':
                       field = this.formupdateEl.querySelector('[name=' + name + '][value=' + json[name] + ']') 
                       field.checked = true
                    break
                    case 'checkbox':
                        if(json[name] == 'S') 
                            json[name] = true
                        else
                            json[name] = false
                        field.checked = json[name]
                    break
                    default:
                        field.value = json[name]
                }
                   
                console.log(name +': ' + field.value)
            }
            
            this.formupdateEl.querySelector('.updatePhoto').src = json.photo
            this.showFormUpdate()
        })
    }

    updateCount(){
        let numberUsers = 0
        let numberAdmin = 0

        let lines = [...this.tableEl.children].forEach(tr => {
            numberUsers++
            let user = JSON.parse(tr.dataset.user)
            if(user.admin == 'S')
                numberAdmin++
        })
        
        document.querySelector('#number-users').innerHTML = numberUsers
        document.querySelector('#number-users-admin').innerHTML = numberAdmin
    }
}