import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { CreateAlert } from '../../store/actions/ui.actions';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputImageComponent } from '../../components/input-image/input-image.component';
import { offCanvasFrames } from '../../constants';
import { ProductService } from '../../services/product.service';
import { ALERT_TYPES } from '../../models/alert.model';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {

  categoryForm: FormGroup;

  frameId = offCanvasFrames;

  featuredImage: File;

  addTask: Promise<any>;


  @ViewChild(InputImageComponent) featuredImageInput: InputImageComponent;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private ps: ProductService
  ) { }

  ngOnInit() {

    //create category form group
    this.createCategoryForm();

  }

  isFrameOpened$(id:number): Observable<boolean> {
    return this.store.select(state => state.ui.offCanvasOpened == id);
  }

  selectImage(ev:any) {
    this.featuredImage = ev.data;
  }

  createCategoryForm() {
    this.categoryForm = this.fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.pattern("[A-Za-z_][A-Za-z0-9_ ]*")])],
    })
  }
  
  isInvalid(formControlName:string):boolean {
    let control =  this.categoryForm.controls[formControlName];
    return control.invalid && control.dirty;
  }

  addCategory() {

    if(this.categoryForm.valid && this.featuredImage) {

      //get category from form group
      let category = {
        id: null,
        imageUrl: null,
        name: this.categoryForm.value.name,
        productCount: 0
      };

      //add Category
      this.addTask = this.ps.addCategory(category, this.featuredImage);

    }

    else {

      //alert error
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Error!',
        content: 'Invalid credentials'
      }));

    }
  }

}
