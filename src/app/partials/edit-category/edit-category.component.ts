import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { offCanvasFrames } from '../../constants';
import { InputImageComponent } from '../../components/input-image/input-image.component';
import { Store } from '@ngxs/store';
import { ProductService } from '../../services/product.service';
import { Observable } from 'rxjs';
import { CreateAlert } from '../../store/actions/ui.actions';
import { ALERT_TYPES } from '../../models/alert.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit {

  categoryForm: FormGroup;

  frameId = offCanvasFrames;

  featuredImage: File;

  updateTask: Promise<any>;

  private _category: Category;


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

  get category(): Category {
    return this._category;
  }

  @Input()
  set category(val: Category) {
    this._category = val;
    this.changeValue();
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
    });
  }

  private changeValue() {
    if(this.categoryForm) {
      this.categoryForm.controls.name.setValue(this.category.name);
    }
  }
  
  isInvalid(formControlName:string):boolean {
    let control =  this.categoryForm.controls[formControlName];
    return control.invalid && control.dirty;
  }

  updateCategory() {

    if(this.categoryForm.valid) {

      //get category from form group
      let category = {
        id: null,
        imageUrl: null,
        name: this.categoryForm.value.name,
        productCount: 0
      };

      //add Category
      this.updateTask = this.ps.updateCategory(category, this.featuredImage);

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
