import { Component, OnInit, Input } from '@angular/core';
import { Product } from '../../models/product.model';
import { Store } from '@ngxs/store';
import { offCanvasFrames } from '../../constants';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SelectOption } from '../../components/input-select/input-select.component';
import { map } from 'rxjs/operators';
import { CreateAlert } from '../../store/actions/ui.actions';
import { ALERT_TYPES } from '../../models/alert.model';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {

  private _product: Product;

  frameId = offCanvasFrames;

  featuredImage: Blob;

  categories$: Observable<SelectOption[]>

  productForm: FormGroup;

  updateTask: Promise<any>;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private ps: ProductService
  ) { }

  ngOnInit() {

    this.categories$ = this.ps.getCategories().pipe(map(
      (categories: Category[]) => {
        return categories.map(category => ({value: category.id, content: category.name, image: category.imageUrl}));
      }
    ));

    //create product form
    this.createProductForm();
    if(this.product) this.changeValues();
  }

  get product():Product {
    return this._product;
  }

  @Input()
  set product(val:Product) {
    this._product = val;
    if(val) this.changeValues();
  }

  isFrameOpened$(id:number): Observable<boolean> {
    return this.store.select(state => state.ui.offCanvasOpened == id);
  } 

  createProductForm() {
    this.productForm = this.fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.pattern("[A-Za-z_][A-Za-z0-9_ ]*")])],
      'featured': [false, Validators.required],
      'category': ['', Validators.required],
      'price': ['', Validators.compose([Validators.required, Validators.pattern("[0-9]*(\.[0-9]*)?")])],
      'unit': ['', Validators.required],
      'description': ['', Validators.required],
      'discount': [0, Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])]
    });
  }

  changeValues() {
    if(this.productForm) {
      let controls = this.productForm.controls;
      controls.name.setValue(this.product.name);
      controls.featured.setValue(this.product.featured);
      controls.category.setValue(this.product.category);
      controls.price.setValue(this.product.price);
      controls.unit.setValue(this.product.unit);
      controls.description.setValue(this.product.description);
      controls.discount.setValue(this.product.discount);
    }
  }

  isInvalid(controlName:string) {
    let control = this.productForm.controls[controlName];
    return control.invalid && control.dirty;
  }

  selectImage(event) {
    this.featuredImage = event.data;
  }

  updateProduct(event) {
    event.preventDefault();

    if(this.productForm.valid) {
      let formValue = this.productForm.value;

      let product = {
        ...this.product,
        name: formValue.name.trim(),
        featured: formValue.featured,
        category: formValue.category,
        price: parseFloat(formValue.price),
        unit: formValue.unit.trim(),
        description: formValue.description.trim(),
        discount: Math.abs(parseInt(formValue.discount)%100)
      }

      this.updateTask = this.ps.updateProduct(product, this.featuredImage);

    }
    else {

      //alert invalid data
      this.store.dispatch(new CreateAlert({
        type: ALERT_TYPES.DANGER,
        title: 'Error!',
        content: 'Invalid credentials'
      }));

    }
  }


}
