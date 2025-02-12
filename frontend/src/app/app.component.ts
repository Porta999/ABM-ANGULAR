import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { ClientesService } from './services/clientes.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule , RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'ABM-ANGULAR';
  clientes: any[] = [];
  clientesFiltrados: any[] = [];

  constructor(private clientesService: ClientesService) {}

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.clientesService.getClientes().subscribe(
      (data) => {
        this.clientes = data;
        this.clientesFiltrados = [...this.clientes];
        console.log('Clientes cargados desde la BD:', this.clientes);
      },
      (error) => console.error('Error al obtener clientes:', error)
    );
  }

  onSubmit(form: any) {
    if (!form.valid) return;

    const nuevoCliente = form.value;
    this.clientesService.addCliente(nuevoCliente).subscribe(
      (clienteGuardado) => {
        this.clientes.push(clienteGuardado);
        this.clientesFiltrados = [...this.clientes];
        console.log('Cliente agregado:', clienteGuardado);
      },
      (error) => console.error('Error al agregar cliente:', error)
    );
  }

  filtrarClientes(event: any) {
    const filtro = event.target.value.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.NombreCompleto.toLowerCase().includes(filtro) ||
      cliente.Email.toLowerCase().includes(filtro) ||
      cliente.Ciudad.toLowerCase().includes(filtro)
    );
  }
}