import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {beforeEach, describe, it, expect, vi} from 'vitest';
import {ProductFormComponent} from './product-form.component';
import {ProductsService} from '../core/products.service';

const draft = {
    name: 'Квартира біля парку',
    category: 'Квартира',
    city: 'Київ',
    price: 90000,
    area: 60,
    rooms: 2,
    description: 'Світла квартира з великим балконом.',
    image: 'images/apartment.jpg'
};
describe('ProductFormComponent', () => {
    let create: ReturnType<typeof vi.fn>;
    let uploadImage: ReturnType<typeof vi.fn>;
    beforeEach(() => {
        create = vi.fn(() => of({...draft, id: 'new'}));
        uploadImage = vi.fn(() => of({path: 'images/uploaded-123.jpg', filename: 'uploaded-123.jpg'}));
        TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [provideRouter([]), {provide: ProductsService, useValue: {create, uploadImage}}]
        });
        vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true)
    });
    it('rejects blank names, short descriptions and non-positive numbers', () => {
        const c = TestBed.createComponent(ProductFormComponent).componentInstance;
        c.form.setValue({...draft, name: '     ', description: 'Коротко', price: 0, area: -1, rooms: 1.5});
        c.save();
        expect(c.form.invalid).toBe(true);
        expect(create).not.toHaveBeenCalled();
        expect(c.form.controls.name.touched).toBe(true)
    });
    it('saves valid trimmed data and navigates to the new record', () => {
        const c = TestBed.createComponent(ProductFormComponent).componentInstance;
        c.form.setValue({...draft, name: '  ' + draft.name + '  '});
        c.save();
        expect(create).toHaveBeenCalledWith(draft);
        expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/products', 'new'])
    });
    it('keeps user input when saving fails', () => {
        create.mockReturnValue(throwError(() => new Error('Save failed')));
        const c = TestBed.createComponent(ProductFormComponent).componentInstance;
        c.form.setValue(draft);
        c.save();
        expect(c.error()).toBe('Save failed');
        expect(c.saving()).toBe(false);
        expect(c.form.getRawValue()).toEqual(draft)
    });
    it('uploads a selected image file before saving the listing', () => {
        const c = TestBed.createComponent(ProductFormComponent).componentInstance;
        const file = new File(['abc'], 'flat.jpg', {type: 'image/jpeg'});
        c.form.setValue(draft);
        c.onFileSelected({target: {files: [file], value: 'flat.jpg'}} as unknown as Event);
        c.save();
        expect(uploadImage).toHaveBeenCalledWith(file);
        expect(create).toHaveBeenCalledWith({...draft, image: 'images/uploaded-123.jpg'});
        expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/products', 'new']);
    });
    it('rejects non-image files on selection', () => {
        const c = TestBed.createComponent(ProductFormComponent).componentInstance;
        const input = {files: [new File(['text'], 'notes.txt', {type: 'text/plain'})], value: 'notes.txt'};
        c.onFileSelected({target: input} as unknown as Event);
        expect(c.selectedFile()).toBeNull();
        expect(c.uploadError()).toContain('JPG');
        expect(input.value).toBe('');
    });
});
