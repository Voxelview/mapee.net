import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, shareReplay } from 'rxjs';

// Written by the Release workflow in Voxelview/Mapee on every release, so the site never needs
// a redeploy to show a new version. The bucket allows this site to read it (CORS).
const RELEASE_INFO_URL =
  'https://storage.googleapis.com/mapee_update_bucket_goldentadpole/website/installer-info.xml';

// Bundled copy, used only if the bucket can't be reached.
const FALLBACK_INFO_URL = '/info/installer-info.xml';

export interface InstallerInfo {
  version: string;
  url: string;
  fileSize: number;
  buttonText: string;
  releaseDate: Date;
}

@Injectable({ providedIn: 'root' })
export class InstallerInfoService {
  private readonly http = inject(HttpClient);

  readonly info$: Observable<InstallerInfo> = this.http
    .get(RELEASE_INFO_URL, { responseType: 'text' })
    .pipe(
      catchError(() => this.http.get(FALLBACK_INFO_URL, { responseType: 'text' })),
      map((xml) => this.parse(xml)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  readonly version$ = this.info$.pipe(map((info) => info.version));

  private parse(xml: string): InstallerInfo {
    const document = new DOMParser().parseFromString(xml, 'text/xml');
    const releaseDate = this.getText(document, 'release-date').split('-').map(Number);

    return {
      version: this.getText(document, 'version'),
      url: this.getText(document, 'url'),
      fileSize: Number(this.getText(document, 'file-size')),
      buttonText: this.getText(document, 'download-button-upper-text'),
      releaseDate: new Date(releaseDate[0], releaseDate[1] - 1, releaseDate[2])
    };
  }

  private getText(document: Document, tagName: string): string {
    return document.getElementsByTagName(tagName)[0]?.textContent?.trim() ?? '';
  }
}