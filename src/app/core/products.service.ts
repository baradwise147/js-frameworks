import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Product, ProductInput} from './product';

export interface UploadedImage {
    path: string;
    filename: string;
}

@Injectable({providedIn: 'root'})
export class ProductsService {
    private readonly http = inject(HttpClient);
    private readonly url = '/api/products';
    private readonly uploadUrl = '/api/upload';

    list() {
        return this.http.get<Product[]>(this.url);
    }

    get(id: string) {
        return this.http.get<Product>(this.url + '/' + encodeURIComponent(id));
    }

    create(product: ProductInput) {
        return this.http.post<Product>(this.url, product);
    }

    update(id: string, product: ProductInput) {
        return this.http.put<Product>(this.url + '/' + encodeURIComponent(id), product);
    }

    delete(id: string) {
        return this.http.delete<void>(this.url + '/' + encodeURIComponent(id));
    }

    uploadImage(file: File) {
        const headers = new HttpHeaders({
            'Content-Type': file.type || 'application/octet-stream',
            'X-File-Name': encodeURIComponent(file.name)
        });
        return this.http.post<UploadedImage>(this.uploadUrl, file, {headers});
    }
}
