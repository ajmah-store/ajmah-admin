import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  loginForm: FormGroup;

  loginTask: Promise<any>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) { }

  ngOnInit() {

    //create login form
    this.createLoginForm();

  }


  createLoginForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$")])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    })
  }

  isInvalid(controlName:string) {
    let control = this.loginForm.controls[controlName];
    return control.invalid && control.dirty;
  }

  login() {

    let formValue = this.loginForm.value;

    this.loginTask = this.auth.login(formValue.email, formValue.password);

  }

}
