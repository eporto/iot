import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';

@Component({
  templateUrl: 'build/pages/register/register.html',
})
export class RegisterPage {
  private user:any = {
      name: "" ,
      password: "",
      password2:"",
      gender:"",
      course:"",
      period:1
    }
    private submitted:boolean = false;
    private SignInErrors:Array<string> = [];

    constructor(private navCtrl: NavController, private http:Http) {

    }

  SignUp() {
    this.validateUser(this.user);
    if (this.SignInErrors.length > 0) {
      console.log(this.SignInErrors)
    } else {
      let url:string = "http://localhost:5000/app/register";
       //let url:string = 'https://iot-project.herokuapp.com/app/register';
      let dataToSend:any = this.user; 

    this.http.post(url,dataToSend).map(res => res.json())
      .subscribe(data => {
         this.navCtrl.pop();
         console.log(data); //debug
      }, error => {
          console.log("Erro Post: "+error); //debug
    });
    }
    
    
    
  }

  validateUser(form) {
    this.SignInErrors = [];
    if (form.name.trim().length <=0) this.SignInErrors.push("Nome inválido");
    if (form.password.trim().length <=0) this.SignInErrors.push("Senha inválida");
    if (form.gender.trim().length <=0) this.SignInErrors.push("Favor escolher um Sexo");
    if (form.course.trim().length <=0) this.SignInErrors.push("Favor escolher um Curso");
    if (form.password2.trim() !== form.password.trim()) this.SignInErrors.push("As senhas não batem");

  }
}

