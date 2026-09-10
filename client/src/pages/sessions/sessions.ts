import { Component, inject, OnInit, signal } from '@angular/core';
import { SessionCard } from '../../components/session-card/session-card';
import { SessionDialog } from '../../components/session-dialog/session-dialog';
import { UiButton } from '../../components/ui/button';
import { SessionService } from '../../services/sessions.service';

@Component({
  selector: 'sessions-page',
  imports: [UiButton, SessionCard, SessionDialog],
  templateUrl: './sessions.html',
})
export class SessionsPage implements OnInit {
  openCreateDialog = false;
  loading = signal<boolean>(true);
  skeletons = [0, 1, 2];

  sessionService = inject(SessionService);

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions().subscribe({
      next: (sessions) => {
        this.sessionService.sessions.set(sessions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
