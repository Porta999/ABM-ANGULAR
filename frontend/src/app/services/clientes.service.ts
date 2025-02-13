import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  // Define la URL base de tu API (ajústala según corresponda)
  private apiUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  getClientes() {
    return this.http.get<any[]>(`${this.apiUrl}/Clientes`);
  }

  // Función para agregar un cliente
  addCliente(cliente: any) {
    const { ClienteID, ...clienteSinID } = cliente; // Elimina ClienteID si existe
    return this.http.post<any>(`${this.apiUrl}/Clientes`, clienteSinID);
  }

  updateCliente(ClienteID: number, cliente: any) {
    return this.http.put<any>(`${this.apiUrl}/Clientes/${ClienteID}`, cliente);
  }

  deleteCliente(ClienteID: number) {
    return this.http.delete<any>(`${this.apiUrl}/api/clientes/${ClienteID}`);
  }
}