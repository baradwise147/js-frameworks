import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {AbstractControl, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {switchMap} from 'rxjs';
import {ProductsService} from '../core/products.service';
import {categories} from '../core/product';

const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function nonBlank(control: AbstractControl) {
    return typeof control.value === 'string' && !control.value.trim() ? {blank: true} : null;
}

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './product-form.component.html'
})
export class ProductFormComponent {
    private readonly fb = inject(FormBuilder);
    private readonly service = inject(ProductsService);
    private readonly router = inject(Router);
    readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    readonly categories = categories;
    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly error = signal('');
    readonly uploadError = signal('');
    readonly loadFailed = signal(false);
    readonly selectedFile = signal<File | null>(null);
    readonly previewUrl = signal('');
    readonly images = [{value: 'images/apartment.jpg', label: 'Світла квартира'}, {
        value: 'images/house.jpg',
        label: 'Будинок із садом'
    }, {value: 'images/office.jpg', label: 'Офісна будівля'}, {
        value: 'images/interior.jpg',
        label: 'Сучасний інтер’єр'
    }, {value: 'images/villa.jpg', label: 'Приватний будинок'}, {
        value: 'images/workspace.jpg',
        label: 'Робочий простір'
    }];
    readonly form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100), nonBlank]],
        category: ['Квартира', [Validators.required]],
        city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60), nonBlank]],
        price: [1, [Validators.required, Validators.min(1), Validators.max(1000000000)]],
        area: [1, [Validators.required, Validators.min(1), Validators.max(100000)]],
        rooms: [1, [Validators.required, Validators.min(1), Validators.max(1000), Validators.pattern(/^\d+$/)]],
        description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(3000), nonBlank]],
        image: ['images/apartment.jpg', Validators.required]
    });
    private readonly currentImage = toSignal(this.form.controls.image.valueChanges, {
        initialValue: this.form.controls.image.value
    });
    readonly imagePreview = computed(() => this.previewUrl() || this.currentImage());
    readonly imageOptions = computed(() => {
        const current = this.currentImage();
        if (!current || this.images.some(item => item.value === current)) {
            return this.images;
        }
        const fileName = current.split('/').pop() || current;
        return [{value: current, label: `Завантажене фото (${fileName})`}, ...this.images];
    });

    constructor() {
        inject(DestroyRef).onDestroy(() => this.revokePreview());
        if (this.id) this.load();
    }

    invalid(name: keyof typeof this.form.controls) {
        const c = this.form.controls[name];
        return c.invalid && c.touched;
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            this.uploadError.set('Оберіть зображення у форматі JPG, PNG, WebP, GIF або AVIF.');
            input.value = '';
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            this.uploadError.set('Розмір файлу не повинен перевищувати 10 МБ.');
            input.value = '';
            return;
        }

        this.uploadError.set('');
        this.revokePreview();
        this.selectedFile.set(file);
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
            this.previewUrl.set(URL.createObjectURL(file));
        }
    }

    clearSelectedFile(input?: HTMLInputElement) {
        this.revokePreview();
        this.previewUrl.set('');
        this.selectedFile.set(null);
        this.uploadError.set('');
        if (input) input.value = '';
    }

    onPresetChange(input?: HTMLInputElement) {
        if (this.selectedFile()) {
            this.clearSelectedFile(input);
        }
    }

    private revokePreview() {
        const url = this.previewUrl();
        if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
            URL.revokeObjectURL(url);
        }
    }

    load() {
        if (!this.id) return;
        this.loading.set(true);
        this.loadFailed.set(false);
        this.error.set('');
        this.service.get(this.id).subscribe({
            next: p => {
                this.form.patchValue(p);
                this.loading.set(false);
            }, error: (e: Error) => {
                this.error.set(e.message);
                this.loadFailed.set(true);
                this.loading.set(false);
            }
        });
    }

    save() {
        if (this.saving() || this.loadFailed()) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        const value = this.form.getRawValue();
        const product = {
            ...value,
            name: value.name.trim(),
            city: value.city.trim(),
            description: value.description.trim()
        };
        this.saving.set(true);
        this.error.set('');
        this.uploadError.set('');

        const saveProduct = (imagePath: string) => {
            const payload = {...product, image: imagePath};
            return this.id ? this.service.update(this.id, payload) : this.service.create(payload);
        };

        const file = this.selectedFile();
        const request = file
            ? this.service.uploadImage(file).pipe(
                switchMap(uploaded => {
                    this.form.controls.image.setValue(uploaded.path);
                    this.clearSelectedFile();
                    return saveProduct(uploaded.path);
                })
            )
            : saveProduct(product.image);

        request.subscribe({
            next: p => {
                void this.router.navigate(['/products', p.id]);
            }, error: (e: Error) => {
                this.error.set(e.message);
                this.saving.set(false);
            }
        });
    }
}
