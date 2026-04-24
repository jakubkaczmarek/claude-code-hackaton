import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agent } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Agent[]> {
    return this.http.get<Agent[]>('/api/agents');
  }

  getById(id: string): Observable<Agent> {
    return this.http.get<Agent>(`/api/agents/${id}`);
  }
}
