import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { ClientesService } from './services/clientes.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule, RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'ABM-ANGULAR';
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  modoEdicion: boolean = false; 
  clienteSeleccionado: any = null; 

  @ViewChild('inputID', { static: false }) inputIDRef!: ElementRef;

  // Todos los campos como string para no mostrar '0' en el formulario
  formData = {
    ClienteID: '',
    NombreCompleto: '',
    Email: '',
    Numero: '',
    Ciudad: '',
    Direccion: '',
    CodigoPostal: ''
  };

  constructor(
    private clientesService: ClientesService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  alternarModo() {
    this.modoEdicion = !this.modoEdicion;
    this.clienteSeleccionado = null;
    // Resetea los campos a cadena vacía
    this.formData = { 
      ClienteID: '',
      NombreCompleto: '',
      Email: '',
      Numero: '',
      Ciudad: '',
      Direccion: '',
      CodigoPostal: ''
    };

    setTimeout(() => {
      if (this.inputIDRef) {
        this.inputIDRef.nativeElement.value = '';  
      }
    });
  }

  buscarCliente(id: number): void {
    const cliente = this.clientes.find(c => c.ClienteID === id);
    console.log('Cliente encontrado:', cliente);

    if (cliente) {
      // Convertimos a string para mostrarlos en el formulario
      this.formData = { 
        ClienteID: String(cliente.ClienteID ?? ''),
        NombreCompleto: String(cliente.NombreCompleto ?? ''),
        Email: String(cliente.Email ?? ''),
        Numero: String(cliente.Numero ?? ''),
        Ciudad: String(cliente.Ciudad ?? ''),
        Direccion: String(cliente.Direccion ?? ''),
        CodigoPostal: String(cliente.CodigoPostal ?? '')
      };
    }
  }

  eliminarCliente() {
    if (this.clienteSeleccionado) {
      this.clientesService.deleteCliente(this.clienteSeleccionado.ClienteID).subscribe(() => {
        this.clientes = this.clientes.filter(c => c.ClienteID !== this.clienteSeleccionado.ClienteID);
        this.clienteSeleccionado = null;
        this.modoEdicion = false;
        this.clientesFiltrados = [...this.clientes];
        this.cdRef.detectChanges();
      });
    }
  }
  
  cargarClientes() {
    this.clientesService.getClientes().subscribe(
      (data) => {
        this.clientes = data;
        this.clientesFiltrados = [...this.clientes];
        this.cdRef.detectChanges();
        console.log('Clientes cargados desde la BD:', this.clientes);
      },
      (error) => console.error('Error al obtener clientes:', error)
    );
  }

  onSubmit(form: NgForm) {
    if (!form.valid) return;

    // Antes de enviar, convertimos los campos numéricos a number
    // Si están vacíos, ponlos en 0 o null (según requiera tu base)
    const cliente = {
      ClienteID: this.formData.ClienteID ? Number(this.formData.ClienteID) : null,
      NombreCompleto: this.formData.NombreCompleto,
      Email: this.formData.Email,
      Numero: this.formData.Numero ? Number(this.formData.Numero) : null,
      Ciudad: this.formData.Ciudad,  // si la DB lo maneja como texto, se queda string
      Direccion: this.formData.Direccion,
      CodigoPostal: this.formData.CodigoPostal ? Number(this.formData.CodigoPostal) : null
    };

    if (this.modoEdicion) {
      console.log('Editando cliente:', cliente);
      this.clientesService.updateCliente(cliente.ClienteID!, cliente).subscribe(
        (clienteActualizado) => {
          const index = this.clientes.findIndex(c => c.ClienteID === cliente.ClienteID);
          if (index !== -1) {
            this.clientes[index] = clienteActualizado;
          }
          this.clientesFiltrados = [...this.clientes];
          this.cdRef.detectChanges();
          console.log('Cliente actualizado:', clienteActualizado);
        },
        (error) => console.error('Error al actualizar cliente:', error)
      );
    } else {
      // Para nuevo cliente, dejamos ClienteID en null (para que la DB lo autogenere)
      const nuevoCliente = { ...cliente, ClienteID: null };
      console.log('Agregando cliente:', nuevoCliente);


      this.clientesService.addCliente(nuevoCliente).subscribe(
        (clienteGuardado) => {
          this.clientes.push(clienteGuardado);
          this.clientesFiltrados = [...this.clientes];
          this.cdRef.detectChanges();
          console.log('Cliente agregado:', clienteGuardado);
        },
        (error) => console.error('Error al agregar cliente:', error)
      );
    }

    form.resetForm();
    this.modoEdicion = false;
    this.cdRef.detectChanges();
  }

  filtrarClientes(event: any) {
    const filtro = event.target.value.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.NombreCompleto?.toLowerCase().includes(filtro) ||
      cliente.Email?.toLowerCase().includes(filtro) ||
      cliente.Ciudad?.toLowerCase().includes(filtro)
    );
    this.cdRef.detectChanges();
  }
}