import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, startWith } from 'rxjs';

import { PageShellComponent } from '../../components/page-shell/page-shell';
import { InstallerInfoService } from '../../installer-info.service';
import { ROADMAP_ITEMS } from '../../site-content';

@Component({
  selector: 'app-new-page',
  imports: [AsyncPipe, PageShellComponent],
  templateUrl: './new-page.html',
  styleUrl: './new-page.css'
})
export class NewPage {
  private readonly installerInfoService = inject(InstallerInfoService);

  // The "Current" entry shows the latest released version.
  protected readonly roadmapItems$ = this.installerInfoService.version$.pipe(
    map((version) =>
      ROADMAP_ITEMS.map((item) =>
        item.timeline === 'Current' ? { ...item, version: `Version ${version}` } : item
      )
    ),
    startWith(ROADMAP_ITEMS)
  );
}