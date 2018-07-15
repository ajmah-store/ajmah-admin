import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireFunctions} from 'angularfire2/functions'

import { USERS_COLLECTION, USER_TYPES, User } from '../models/user.model';
import { Store } from '@ngxs/store';
import { CreateAlert } from '../store/actions/ui.actions';
import { ALERT_TYPES } from '../models/alert.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _userId: string = null;
  private user$: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private fs: AngularFirestore,
    private functions: AngularFireFunctions,
    private store: Store,
    private router: Router
  ) {

    //check if already logged in
    this.afAuth.authState.subscribe(
      user => {
        if(user) {

          //set userId
          this._userId = user.uid;

          //set user
          this.user$ = this.fs.collection(USERS_COLLECTION).valueChanges().pipe(map(
            (userData:any) => ({...userData, emailVerified: user.emailVerified})
          ));

          //route to dashboard
          this.router.navigate(['/dashboard']);

        }

        else {

          //set user id as null
          this._userId = null;

          //set user$ as null
          this.user$ = null;

          //route to login
          this.router.navigate(['/login']);

        }
      }
    );

   }

   /**
    * Returns true if user is authenticated
    */
   get authenticated():boolean {

    return this.userId !== null;

   }


   get currentUser():Observable<User> {

    return this.user$;

   }
  /**
   * Return user id of the currently logged in user
   */
  get userId(): string {

    return this._userId;

  }


  /**
   * Logs in a user if he is authorized.
   * @param email Email of the user
   * @param password Password of the user
   */
  async login(email:string, password:string):Promise<void> {

    try {

      const getUserID = this.functions.httpsCallable('getUserID');

      const uid = await getUserID(email).toPromise();

      //sign in with email and password
      //const user = (await this.afAuth.auth.signInWithEmailAndPassword(email, password)).user;

      //fetch data from firestore
      const userData:any = await this.getUserData(uid);

      console.log(userData);
      
      //check if user is not authorized
      if(parseInt(userData.type) !== USER_TYPES.ADMIN && parseInt(userData.type) !== USER_TYPES.EDITOR) {

        //signout user
        //await this.afAuth.auth.signOut();
        
        //throw not authorized error
        throw { message: 'User is not Authorized' } as Error;

      }

      //authorized
      else {

        //sign in the user
        await this.afAuth.auth.signInWithEmailAndPassword(email, password);

      }

    }


    catch(error) {
      
      //alert error
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Error!',
        content: error['message'] || error
      }));

      //log error
      console.log(error);

      //return error
      throw error;

    }
  } //{login}

  /**
   * Logs out the currently logged in user
   */
  async logout() {

    try {

      //firebase signout
      await this.afAuth.auth.signOut();

    }

    catch(error) {

      //alert error
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Couldn\'t signout the user',
        content: error.message
      }));

      //log error
      console.log(error);

      //throw error
      throw error;

    }


  }


  private async getUserData(userId:string) {

    //return a promise
    return new Promise(
      (resolve, reject) => {

        //fetch user data from firestore
        this.fs.collection(USERS_COLLECTION).doc(userId).valueChanges().subscribe(

          user => {
            
            //if user is not undefined resolve
            if(user) resolve(user);

          }, error => reject(error) //reject error

        );

      }
    );

  }
  


}
