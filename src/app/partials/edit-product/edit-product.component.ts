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

  addTask: Promise<any>;

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
      'description': ['', Validators.required]
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
    }
  }

  isInvalid(controlName:string) {
    let control = this.productForm.controls[controlName];
    return control.invalid && control.dirty;
  }

  selectImage(event) {
    this.featuredImage = event.data;
  }

  editProduct() {

    if(this.productForm.valid && this.featuredImage) {
      let formValue = this.productForm.value;

      let product = {
        ...this.product,
        name: formValue.name.trim(),
        featured: formValue.featured(),
        category: formValue.category,
        price: parseFloat(formValue.price),
        unit: formValue.unit.trim(),
        description: formValue.description.trim()
      }

      this.ps.updateProduct(product, this.featuredImage);

    }
  }


}
